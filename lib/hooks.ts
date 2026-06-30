"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import {
  Property,
  Activity,
  Document,
  Filing,
  PropertyWithDetails,
  ExemptionType,
  ExemptionStatus,
} from "./types";

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
        storagePath: doc.storage_path ?? undefined,
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

// Property write fields shared by create/update. The Clerk userId is derived
// server-side from auth(), so callers never pass it.
type PropertyWriteFields = {
  name: string;
  county: string;
  acreage: number;
  exemptionType: ExemptionType;
  exemptionStatus: ExemptionStatus;
  photoUrl?: string;
  address?: string;
  state?: string;
  coordinates?: { lat: number; lng: number };
  legalDescription?: string;
  appraisalAccount?: string;
};

// Create a property via the /api/properties handler (service-role + Clerk auth,
// ownership scoped to the signed-in user).
export async function createProperty(
  property: PropertyWriteFields
): Promise<Property> {
  const res = await fetch("/api/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(property),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create property");
  }
  return res.json();
}

// Update editable fields on a property (by UUID or slug).
export async function updateProperty(
  idOrSlug: string,
  updates: Partial<PropertyWriteFields>
): Promise<Property> {
  const res = await fetch(`/api/properties/${idOrSlug}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update property");
  }
  return res.json();
}

// Delete a property (and its cascading activities/documents/filings) via the
// /api/properties/[id] handler. Ownership scoped to the signed-in user.
export async function deleteProperty(idOrSlug: string): Promise<void> {
  const res = await fetch(`/api/properties/${idOrSlug}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete property");
  }
}

// Update just the property photo. Thin wrapper over updateProperty.
export async function updatePropertyPhoto(
  idOrSlug: string,
  photoUrl: string
): Promise<Property> {
  return updateProperty(idOrSlug, { photoUrl });
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

// Rename an existing document
export async function updateDocumentName(id: string, name: string) {
  const { error } = await supabase
    .from("documents")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
}

// Delete a document: storage object (if path) then DB row
export async function deleteDocumentRecord(id: string, storagePath?: string) {
  if (storagePath) {
    const { error: storageErr } = await supabase.storage
      .from("documents")
      .remove([storagePath]);
    if (storageErr) console.error("Storage delete error:", storageErr);
  }
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}

// Create a land document record (attached to property, not an activity)
export async function createLandDocument(
  propertyId: string,
  doc: {
    type: "photo" | "receipt" | "note";
    name: string;
    url: string;
    storagePath?: string;
  }
) {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      property_id: propertyId,
      type: doc.type,
      name: doc.name,
      url: doc.url,
      storage_path: doc.storagePath,
    })
    .select()
    .single();

  if (error) {
    console.error("Land document creation error:", error);
    alert(`Failed to save document record: ${error.message}`);
    throw error;
  }
  return data;
}

// Fetch all documents for a property: land docs (property_id) + activity evidence
export function usePropertyDocuments(propertyId: string | undefined) {
  const [landDocuments, setLandDocuments] = useState<Document[]>([]);
  const [activityDocuments, setActivityDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data: activities, error: actErr } = await supabase
      .from("activities")
      .select("id")
      .eq("property_id", propertyId);
    if (actErr) {
      setError(actErr.message);
      setLoading(false);
      return;
    }
    const activityIds = (activities || []).map((a) => a.id);

    const [landRes, evidenceRes] = await Promise.all([
      supabase.from("documents").select("*").eq("property_id", propertyId),
      activityIds.length
        ? supabase.from("documents").select("*").in("activity_id", activityIds)
        : Promise.resolve({ data: [], error: null } as { data: unknown[]; error: null }),
    ]);

    if (landRes.error) {
      setError(landRes.error.message);
      setLoading(false);
      return;
    }
    if (evidenceRes.error) {
      setError(evidenceRes.error.message);
      setLoading(false);
      return;
    }

    const map = (rows: unknown[]): Document[] =>
      (rows as Array<Record<string, unknown>>).map((d) => ({
        id: d.id as string,
        activityId: (d.activity_id as string | null) ?? undefined,
        propertyId: (d.property_id as string | null) ?? undefined,
        type: d.type as Document["type"],
        name: d.name as string,
        url: d.url as string,
        storagePath: (d.storage_path as string | null) ?? undefined,
        uploadedAt: d.uploaded_at as string,
      }));

    setLandDocuments(map((landRes.data || []) as unknown[]));
    setActivityDocuments(map((evidenceRes.data || []) as unknown[]));
    setLoading(false);
  }, [propertyId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return { landDocuments, activityDocuments, loading, error, refetch: fetchDocs };
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
