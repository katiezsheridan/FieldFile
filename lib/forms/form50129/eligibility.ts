import { ExemptionType } from "@/lib/types";

// Who is offered the 1-d-1 application (Form 50-129).
//
// The setup wizard's situation question is the signal. "I'm exploring" is the
// only answer that records a property with no special valuation, and it is the
// only situation where FieldFile offers the application flow — the other two
// record a wildlife valuation and get the plan and annual-report surfaces
// instead. See SITUATION_TO_EXEMPTION in app/(main)/setup/page.tsx.
//
//   setup situation        exemptionType   50-129 offered?
//   "I'm exploring"        none            yes
//   "Working toward one"   wildlife        no
//   "I already have one"   wildlife        no
//
// Note this also excludes agriculture-valued properties converting to wildlife,
// who do in fact file a 50-129 with the plan attached at Section 5. That is a
// deliberate product call, not an oversight — reachable by editing the property
// exemption type to "none" if it needs revisiting.
//
// This gates the offer, not the data: the form50129 API routes are unchanged,
// so a filing already in progress is never orphaned by an exemption-type edit.
export function canApplyFor1d1(exemptionType?: ExemptionType | null): boolean {
  return exemptionType === "none";
}
