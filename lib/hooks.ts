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
  Plan,
  PlanPractice,
  PracticeType,
  PracticeDocumentation,
  PracticeCode,
  ActivityType,
  FieldValue,
} from "./types";
import type { PlanPropertySummary } from "./plan-serialize";

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
      // Annual-report container columns. Undefined against a database without
      // the annual-report migration, and null on rows that predate it.
      practiceCode: act.practice_code ?? undefined,
      subActivityId: act.sub_activity_id ?? undefined,
      performedOn: act.performed_on ?? undefined,
      performedThrough: act.performed_through ?? undefined,
      locationLabel: act.location_label ?? undefined,
      fieldValues: act.field_values ?? undefined,
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

/**
 * `sub_activities.code` -> uuid. The PWD-888 catalog lives in
 * lib/sub-activities.ts (48 rows, fixed), so this is fetched once per page load
 * and cached; `activities.sub_activity_id` is a uuid FK and needs the real id.
 *
 * Returns null when the annual-report reference tables are not in the database
 * yet (migrations/add_annual_report_domain.sql has not been applied). Callers
 * should tell the user rather than silently dropping their answers.
 */
let subActivityIdMap: Record<string, string> | null = null;

export async function fetchSubActivityIdMap(): Promise<
  Record<string, string> | null
> {
  if (subActivityIdMap) return subActivityIdMap;

  const { data, error } = await supabase
    .from("sub_activities")
    .select("code, id");

  if (error || !data) return null;

  subActivityIdMap = Object.fromEntries(
    data.map((row: { code: string; id: string }) => [row.code, row.id])
  );
  return subActivityIdMap;
}

/** The tax year a piece of work counts toward: the year it was performed. */
export function taxYearOf(performedOn: string): number {
  return Number(performedOn.slice(0, 4));
}

/**
 * The report period for (property, tax year), creating it if this is the first
 * activity that year. Every container must carry one — the three-of-seven count
 * is over containers in a period, so a null period makes the work invisible to
 * the report.
 *
 * Returns null when `report_periods` isn't in the database yet.
 */
export async function ensureReportPeriod(
  propertyId: string,
  taxYear: number
): Promise<string | null> {
  const find = async () => {
    const { data } = await supabase
      .from("report_periods")
      .select("id")
      .eq("property_id", propertyId)
      .eq("tax_year", taxYear)
      .maybeSingle();
    return data?.id ?? null;
  };

  const existing = await find();
  if (existing) return existing;

  const { data, error } = await supabase
    .from("report_periods")
    .insert({ property_id: propertyId, tax_year: taxYear, status: "draft" })
    .select("id")
    .single();

  // A concurrent insert wins the (property_id, tax_year) unique constraint —
  // that row is just as good as ours.
  if (error) return find();
  return data?.id ?? null;
}

// Create activity
//
// THE ACTIVITY IS THE CONTAINER: practiceCode, subActivityId and fieldValues
// are chosen by the landowner up front, and evidence inherits its
// classification from here. See CLAUDE.md > "Annual Report Domain Model".
export async function createActivity(
  propertyId: string,
  activity: Omit<Activity, "id" | "propertyId" | "documents">
) {
  const reportPeriodId = activity.performedOn
    ? await ensureReportPeriod(propertyId, taxYearOf(activity.performedOn))
    : null;

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
      // Annual-report container columns. Omitted entirely when absent so this
      // still works against a database without the annual-report migration.
      ...(activity.practiceCode ? { practice_code: activity.practiceCode } : {}),
      ...(activity.subActivityId
        ? { sub_activity_id: activity.subActivityId }
        : {}),
      ...(activity.performedOn ? { performed_on: activity.performedOn } : {}),
      ...(activity.performedThrough
        ? { performed_through: activity.performedThrough }
        : {}),
      ...(activity.locationLabel
        ? { location_label: activity.locationLabel }
        : {}),
      ...(activity.fieldValues ? { field_values: activity.fieldValues } : {}),
      ...(reportPeriodId ? { report_period_id: reportPeriodId } : {}),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reclassify a container: practice, sub-activity, when, where and the PWD-888
 * detail answers. This is the ONLY reclassification path — evidence carries no
 * practice of its own, so correcting the activity moves every photo and receipt
 * in it. Re-dating into another tax year moves the container to that year's
 * report period, and a DB trigger drags its documents along.
 */
export async function updateActivityContainer(
  activityId: string,
  propertyId: string,
  patch: {
    practiceCode: PracticeCode;
    subActivityId: string;
    performedOn: string;
    performedThrough?: string;
    locationLabel?: string;
    fieldValues: Record<string, FieldValue>;
    type: ActivityType;
    name: string;
    description: string;
  }
) {
  const reportPeriodId = await ensureReportPeriod(
    propertyId,
    taxYearOf(patch.performedOn)
  );

  const { error } = await supabase
    .from("activities")
    .update({
      practice_code: patch.practiceCode,
      sub_activity_id: patch.subActivityId,
      performed_on: patch.performedOn,
      performed_through: patch.performedThrough ?? null,
      location_label: patch.locationLabel ?? null,
      field_values: patch.fieldValues,
      type: patch.type,
      name: patch.name,
      description: patch.description,
      completed_date: patch.performedOn,
      updated_at: new Date().toISOString(),
      ...(reportPeriodId ? { report_period_id: reportPeriodId } : {}),
    })
    .eq("id", activityId);

  if (error) throw error;
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

// ---------- Wildlife Plan ----------

// A loaded plan, with the property identity summary the wizard shows read-only.
export type PlanWithProperty = Plan & { property: PlanPropertySummary | null };

// The draft fields the wizard auto-saves. Status is advanced separately via the
// review step (submitPlan), so it is intentionally not part of the draft shape.
export type PlanDraftFields = {
  habitatTypes?: string[];
  propertyDescription?: string;
  waterSources?: string[];
  wildlifeSpecies?: string[];
  currentLandUse?: string;
  landHistory?: string;
  targetSpecies?: string[];
};

// Get-or-create the draft plan for a property + year. Idempotent server-side.
export async function createPlan(
  propertyId: string,
  year?: number
): Promise<Plan> {
  const res = await fetch("/api/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ propertyId, year }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create plan");
  }
  return res.json();
}

// PATCH a plan. Used for both draft saves and status changes; the server gates
// status advances on completion.
export async function updatePlan(
  planId: string,
  updates: PlanDraftFields & { status?: Plan["status"] }
): Promise<PlanWithProperty> {
  const res = await fetch(`/api/plans/${planId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update plan");
  }
  return res.json();
}

// Load a plan (with its practices and property summary) for the wizard.
export function usePlan(planId: string | undefined) {
  const [plan, setPlan] = useState<PlanWithProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!planId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/plans/${planId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load plan");
      }
      setPlan(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan");
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { plan, loading, error, refetch: fetchPlan };
}

// Debounced draft auto-save. Persists the plan's draft fields through the API
// (Clerk-scoped) whenever they settle, so the user can leave and return to
// exactly where they were. Skips the initial render so loading a plan does not
// immediately re-save it.
export function usePlanDraftAutoSave(
  planId: string | undefined,
  draft: PlanDraftFields,
  delay: number = 800
) {
  // Serialize so we compare by value, not object identity (which changes every
  // render and would otherwise trigger a save on every keystroke's re-render).
  const serialized = JSON.stringify(draft);
  const debounced = useDebounce(serialized, delay);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!planId) return;

    let cancelled = false;
    const save = async () => {
      setIsSaving(true);
      setError(null);
      try {
        await updatePlan(planId, JSON.parse(debounced) as PlanDraftFields);
        if (!cancelled) setLastSaved(new Date());
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not save");
        }
      } finally {
        if (!cancelled) setIsSaving(false);
      }
    };
    save();
    return () => {
      cancelled = true;
    };
  }, [debounced, planId]);

  return { isSaving, lastSaved, error };
}

// ---------- Wildlife Plan: practices ----------

export type PlanPracticeWrite = {
  practiceType: PracticeType;
  selected: boolean;
  documentation: PracticeDocumentation;
};

// Upsert the plan's practices (selection + documentation) in one call.
export async function updatePlanPractices(
  planId: string,
  practices: PlanPracticeWrite[]
): Promise<PlanPractice[]> {
  const res = await fetch(`/api/plans/${planId}/practices`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ practices }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to save practices");
  }
  return res.json();
}

// Debounced auto-save for the practices step, mirroring usePlanDraftAutoSave.
// Compares by serialized value so it only saves on real changes, and skips the
// first render so loading a plan does not immediately re-save it.
export function usePlanPracticesAutoSave(
  planId: string | undefined,
  practices: PlanPracticeWrite[],
  delay: number = 800
) {
  const serialized = JSON.stringify(practices);
  const debounced = useDebounce(serialized, delay);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!planId) return;

    let cancelled = false;
    const save = async () => {
      setIsSaving(true);
      setError(null);
      try {
        await updatePlanPractices(
          planId,
          JSON.parse(debounced) as PlanPracticeWrite[]
        );
        if (!cancelled) setLastSaved(new Date());
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not save");
        }
      } finally {
        if (!cancelled) setIsSaving(false);
      }
    };
    save();
    return () => {
      cancelled = true;
    };
  }, [debounced, planId]);

  return { isSaving, lastSaved, error };
}
