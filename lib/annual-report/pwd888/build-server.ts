/**
 * Fetch and assemble the PWD-888 for one property and tax year. Server only;
 * the caller resolves (and so authorizes) the property first.
 */

import { assemblePwd888 } from "./assemble";
import { fetchAssemblyInput } from "./data-server";
import type { Pwd888Assembly } from "./types";

export async function buildPwd888(
  propertyId: string,
  taxYear: number
): Promise<Pwd888Assembly> {
  return assemblePwd888(await fetchAssemblyInput(propertyId, taxYear));
}
