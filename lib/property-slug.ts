import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "./utils";

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
