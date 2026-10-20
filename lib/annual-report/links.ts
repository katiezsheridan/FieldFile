/**
 * Where a landowner goes to fix a container. Activity containers live under
 * /activities; census containers (`census:<observation id>`, see
 * pwd888/census.ts) under /census.
 */
export function containerHref(propertyId: string, containerId: string): string {
  return containerId.startsWith("census:")
    ? `/properties/${propertyId}/census/${containerId.slice("census:".length)}`
    : `/properties/${propertyId}/activities/${containerId}`;
}

/**
 * Where to send the landowner to close a gap: usually the container itself,
 * but a census activity missing evidence goes to record counts in the census
 * section, where counts alone document a census.
 */
export function gapHref(propertyId: string, gapKey: string): string | null {
  if (gapKey.endsWith(".censusCounts")) return `/properties/${propertyId}/census/new`;
  const id = gapContainerId(gapKey);
  return id ? containerHref(propertyId, id) : null;
}

/** The container a gap key names: `activity.<id>.<what>` → `<id>`. */
export function gapContainerId(gapKey: string): string | null {
  const m = /^activity\.([^.]+)\./.exec(gapKey);
  return m ? m[1] : null;
}
