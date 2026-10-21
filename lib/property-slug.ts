import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingSchemaError } from "./errors";
import { slugify } from "./utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PropertyRef = { id: string; slug: string | null };

/**
 * Resolve a route param — uuid, current slug, or a slug the property used
 * before a rename — to the user's property. Scoped to `userId`, so it doubles
 * as the ownership check. Current slugs win over historical ones: if the user
 * later gives another property an old name, the live property owns the URL.
 *
 * Server only (service-role client). Tolerates property_slug_history not
 * existing yet, behaving as before the migration.
 */
export async function resolvePropertyRef(
  supabase: SupabaseClient,
  param: string,
  userId: string
): Promise<PropertyRef | null> {
  const { data } = await supabase
    .from("properties")
    .select("id, slug")
    .eq(UUID_RE.test(param) ? "id" : "slug", param)
    .eq("user_id", userId)
    .maybeSingle();
  if (data) return data as PropertyRef;
  if (UUID_RE.test(param)) return null;

  const { data: old, error } = await supabase
    .from("property_slug_history")
    .select("property_id")
    .eq("user_id", userId)
    .eq("slug", param)
    .maybeSingle();
  if (error && !isMissingSchemaError(error)) throw error;
  if (!old) return null;

  const { data: current } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", old.property_id)
    .eq("user_id", userId)
    .maybeSingle();
  return (current as PropertyRef | null) ?? null;
}

/**
 * Record that a property gave up `oldSlug` for `newSlug`. The new slug is
 * removed from history (it is live again); the old one now points here.
 * Never fails a rename: if the table is missing, history is simply not kept.
 */
export async function recordSlugChange(
  supabase: SupabaseClient,
  userId: string,
  propertyId: string,
  oldSlug: string | null,
  newSlug: string
) {
  if (!oldSlug || oldSlug === newSlug) return;
  const del = await supabase
    .from("property_slug_history")
    .delete()
    .eq("user_id", userId)
    .eq("slug", newSlug);
  if (del.error) {
    if (isMissingSchemaError(del.error)) return;
    throw del.error;
  }
  const { error } = await supabase
    .from("property_slug_history")
    .upsert(
      { property_id: propertyId, user_id: userId, slug: oldSlug },
      { onConflict: "user_id,slug" }
    );
  if (error && !isMissingSchemaError(error)) throw error;
}

/**
 * A slug for `name` that no OTHER property of this user is already using.
 * Collisions get a numeric suffix: bark-springs, bark-springs-2, ...
 *
 * `excludePropertyId` is the property being renamed — it must not collide with
 * itself, or every rename would walk the suffix upward.
 */
export async function uniquePropertySlug(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  excludePropertyId?: string
): Promise<string> {
  const { data } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("user_id", userId);

  const taken = new Set(
    (data ?? [])
      .filter((p) => p.id !== excludePropertyId)
      .map((p) => p.slug)
      .filter((s): s is string => Boolean(s))
  );

  const base = slugify(name);
  let slug = base;
  let i = 2;
  while (taken.has(slug)) slug = `${base}-${i++}`;
  return slug;
}
