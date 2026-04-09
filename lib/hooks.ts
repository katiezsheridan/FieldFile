"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { Property, Activity, Document, Filing, PropertyWithDetails } from "./types";

// Debounce hook for auto-save
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Auto-save hook
export function useAutoSave<T extends Record<string, unknown>>(
  table: string,
  id: string | undefined,
  data: T,
  delay: number = 1000
) {
  const debouncedData = useDebounce(data, delay);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render to avoid saving initial data
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!id) return;

    const saveData = async () => {
      setIsSaving(true);
      setError(null);

      const { error: saveError } = await supabase
        .from(table)
        .update({ ...debouncedData, updated_at: new Date().toISOString() })
        .eq("id", id);

      setIsSaving(false);

      if (saveError) {
        setError(saveError.message);
        console.error("Auto-save error:", saveError);
      } else {
        setLastSaved(new Date());
      }
    };

    saveData();
  }, [debouncedData, id, table]);

  return { isSaving, lastSaved, error };
}

// Fetch all properties for a user
export function useProperties(userId: string | undefined) {
  const [properties, setProperties] = useState<PropertyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/properties");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch properties");
      }
      const data: PropertyWithDetails[] = await res.json();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, error, refetch: fetchProperties };
}

// Fetch a single property with details (by slug or UUID)
export function useProperty(slugOrId: string | undefined) {
  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!slugOrId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/properties/${slugOrId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch property");
      }
      const data: PropertyWithDetails = await res.json();
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch property");
    } finally {
      setLoading(false);
    }
  }, [slugOrId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return { property, loading, error, refetch: fetchProperty };
}

// Fetch a single activity
export function useActivity(activityId: string | undefined) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!activityId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data: act, error: actError } = await supabase
      .from("activities")
      .select("*")
      .eq("id", activityId)
      .single();

    if (actError) {
      setError(actError.message);
      setLoading(false);
      return;
    }

    // Fetch documents
    const { data: docsData } = await supabase
      .from("documents")
      .select("*")
      .eq("activity_id", activityId);

    setActivity({
      id: act.id,
      propertyId: act.property_id,
      type: act.type,
      name: act.name,
      description: act.description || "",
      status: act.status,
      requiredEvidence: act.required_evidence || [],
      documents: (docsData || []).map((doc) => ({
        id: doc.id,
        activityId: doc.activity_id,
        type: doc.type,
        name: doc.name,
        url: doc.url,
        uploadedAt: doc.uploaded_at,
        metadata: doc.gps_lat
          ? { gpsCoordinates: { lat: doc.gps_lat, lng: doc.gps_lng } }
          : undefined,
      })),
      notes: act.notes || "",
      dueDate: act.due_date || "",
      completedDate: act.completed_date,
      locations: act.locations || [],
    });
    setLoading(false);
  }, [activityId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activity, loading, error, refetch: fetchActivity, setActivity };
}

// Update activity
export async function updateActivity(
  activityId: string,
  updates: Partial<{
    notes: string;
    status: string;
    due_date: string;
    completed_date: string;
    locations: { lat: number; lng: number; label?: string }[];
  }>
) {
  const { error } = await supabase
    .from("activities")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", activityId);

  if (error) throw error;
}

// Create property
export async function createProperty(
  userId: string,
  property: Omit<Property, "id">
) {
  const { data, error } = await supabase
    .from("properties")
    .insert({
      user_id: userId,
      name: property.name,
      address: property.address,
      county: property.county,
      state: property.state,
      acreage: property.acreage,
      exemption_type: property.exemptionType,
      lat: property.coordinates.lat,
      lng: property.coordinates.lng,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Create activity
export async function createActivity(
  propertyId: string,
  activity: Omit<Activity, "id" | "propertyId" | "documents">
) {
  const { data, error } = await supabase
    .from("activities")
    .insert({
      property_id: propertyId,
      type: activity.type,
      name: activity.name,
      description: activity.description,
      status: activity.status,
      notes: activity.notes,
      due_date: activity.dueDate,
      completed_date: activity.completedDate,
      locations: activity.locations,
      required_evidence: activity.requiredEvidence,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Create document record
export async function createDocument(
  activityId: string,
  doc: {
    type: "photo" | "receipt" | "note";
    name: string;
    url: string;
    storagePath?: string;
    gpsLat?: number;
    gpsLng?: number;
  }
) {
  console.log("Creating document record:", { activityId, doc });

  const { data, error } = await supabase
    .from("documents")
    .insert({
      activity_id: activityId,
      type: doc.type,
      name: doc.name,
      url: doc.url,
      storage_path: doc.storagePath,
      gps_lat: doc.gpsLat,
      gps_lng: doc.gpsLng,
    })
    .select()
    .single();

  if (error) {
    console.error("Document creation error:", error);
    alert(`Failed to save document record: ${error.message}`);
    throw error;
  }

  console.log("Document created:", data);
  return data;
}
