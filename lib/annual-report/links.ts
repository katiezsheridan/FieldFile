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

/** The container a gap key names: `activity.<id>.<what>` → `<id>`. */
export function gapContainerId(gapKey: string): string | null {
  const m = /^activity\.([^.]+)\./.exec(gapKey);
  return m ? m[1] : null;
}
