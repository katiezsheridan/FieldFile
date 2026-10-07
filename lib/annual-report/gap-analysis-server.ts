/**
 * Run gap analysis for one property and tax year. Server-only — ownership is
 * enforced by the caller having already resolved the property through
 * `resolvePropertyId()`.
 *
 * The fetching lives in pwd888/data-server.ts, shared with the report
 * assembler, so the readiness card and the rendered PWD-888 always count the
 * same containers — activities and census observations alike.
 */

import { analyzeReportGaps, type GapAnalysis } from "./gap-analysis";
import { toContainerInput } from "./pwd888/assemble";
import { fetchAssemblyInput } from "./pwd888/data-server";

export async function analyzePropertyYear(
  propertyId: string,
  taxYear: number
): Promise<GapAnalysis> {
  const input = await fetchAssemblyInput(propertyId, taxYear);
  return analyzeReportGaps({
    propertyId,
    taxYear,
    containers: input.containers.map(toContainerInput),
    identity: input.identity,
    associationMember: input.association.member,
    associationName: input.association.name,
  });
}
