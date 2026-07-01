/**
 * Map a review-screen owner-profile edit (camelCase, aligned with the assembled
 * payload's owner/representative blocks) to owner_profiles columns (snake_case),
 * following the project's map*Row convention. Bucket-2 writes only.
 */

import type { OwnerType, RepBasis } from "./fieldMap";

export type OwnerProfileInput = {
  type?: OwnerType;
  typeOther?: string | null;
  name?: string | null;
  dateOfBirth?: string | null;
  physicalAddress?: string | null;
  mailingAddress?: string | null;
  phone?: string | null;
  email?: string | null;
  repBasis?: RepBasis | null;
  repBasisOther?: string | null;
  repName?: string | null;
  repTitle?: string | null;
  repPhone?: string | null;
  repEmail?: string | null;
  repMailingAddress?: string | null;
};

/** RepBasis payload key → owner_profiles.rep_basis enum value. */
const REP_BASIS_TO_DB: Record<RepBasis, string> = {
  officer: "officer",
  generalPartner: "general_partner",
  attorney: "attorney",
  agentTaxMatters: "agent_tax_matters",
  other: "other",
};

/**
 * Build an owner_profiles column patch from a camelCase input. Only keys present
 * on the input are included (so a partial edit is a partial update); empty
 * strings are normalized to null.
 */
export function ownerProfileToRow(
  input: OwnerProfileInput,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const set = (col: string, v: unknown) => {
    if (v === undefined) return;
    row[col] = v === "" ? null : v;
  };
  set("owner_type", input.type);
  set("owner_type_other", input.typeOther);
  set("owner_name", input.name);
  set("date_of_birth", input.dateOfBirth);
  set("physical_address", input.physicalAddress);
  set("mailing_address", input.mailingAddress);
  set("phone", input.phone);
  set("email", input.email);
  set(
    "rep_basis",
    input.repBasis == null ? input.repBasis : REP_BASIS_TO_DB[input.repBasis],
  );
  set("rep_basis_other", input.repBasisOther);
  set("rep_name", input.repName);
  set("rep_title", input.repTitle);
  set("rep_phone", input.repPhone);
  set("rep_email", input.repEmail);
  set("rep_mailing_address", input.repMailingAddress);
  return row;
}
