/**
 * Fixture checks for the PWD-888 assembler — no database.
 *
 *   npx tsx scripts/pwd888-assemble-check.ts
 *
 * Each case pins a rule that, if it regressed, would put something untrue on a
 * tax report: counting the same feeder four times, picking one of two
 * disagreeing answers, printing a practice that does not count.
 */
import assert from "node:assert/strict";
import { assemblePwd888, splitMailingAddress } from "../lib/annual-report/pwd888/assemble";
import { censusToContainer } from "../lib/annual-report/pwd888/census";
import type { ReportContainer, ReportEvidence } from "../lib/annual-report/pwd888/types";
import type { FieldValue, PracticeCode } from "../lib/types";

const photo = (id: string, capturedAt: string): ReportEvidence => ({
  id, kind: "document", docType: "photo", capturedAt, caption: null, lat: null, lng: null, storagePath: `p/${id}.jpg`,
});

let n = 0;
const c = (
  sub: string,
  performedOn: string | null,
  fieldValues: Record<string, FieldValue> = {},
  evidence = true
): ReportContainer => {
  const id = `a${++n}`;
  return {
    id, source: "activity", label: sub, practiceCode: sub.slice(0, 2) as PracticeCode,
    subActivityCode: sub, performedOn, fieldValues,
    evidence: evidence && performedOn ? [photo(`d${n}`, `${performedOn}T10:00:00Z`)] : [],
  };
};

const base = {
  propertyId: "p1",
  taxYear: 2026,
  identity: {
    ownerName: "Pat Owner", accountNumber: "R12345", mailingAddress: "12 Oak Ln, Dripping Springs, TX 78620",
    phone: "512-555-0100", tractName: "Home Place", majorityCounty: "Hays",
  },
  additionalCounties: "",
  association: { member: false, name: null, proposedMember: null },
};

const cases: [string, () => void][] = [
  ["inventory counts take the max, not the sum (4 feeder fills ≠ 4× the feeders)", () => {
    const r = assemblePwd888({ ...base, containers: [
      c("SF-05", "2026-02-01", { feeder_count: 3, purpose: ["Supplementation"] }),
      c("SF-05", "2026-05-01", { feeder_count: 3 }),
      c("SF-05", "2026-08-01", { feeder_count: 4, purpose: ["Harvesting of wildlife"] }),
    ]});
    const e = r.payload.partIV.find((x) => x.code === "SF-05")!;
    assert.equal(e.blanks.find((b) => b.key === "feeder_count")!.value, 4);
    assert.deepEqual(e.blanks.find((b) => b.key === "purpose")!.value, ["Supplementation", "Harvesting of wildlife"]);
  }],
  ["work quantities sum; dates list, filling blanks from the work date", () => {
    const r = assemblePwd888({ ...base, containers: [
      c("HC-02", "2026-02-10", { acres_burned: 12.5, burn_date: "2026-02-10" }),
      c("HC-02", "2026-03-04", { acres_burned: 7 }),
    ]});
    const e = r.payload.partIV.find((x) => x.code === "HC-02")!;
    const acres = e.blanks.find((b) => b.key === "acres_burned")!;
    assert.equal(acres.value, 19.5);
    assert.equal(acres.basis, "combined");
    const dates = e.blanks.find((b) => b.key === "burn_date")!;
    assert.deepEqual(dates.value, ["2026-02-10", "2026-03-04"]);
    assert.equal(dates.basis, "derived");
  }],
  ["disagreeing answers are a blocking conflict, never a silent pick", () => {
    const r = assemblePwd888({ ...base, containers: [
      c("HC-01", "2026-01-15", { grazing_system: "1 herd/3 pasture" }),
      c("HC-01", "2026-06-15", { grazing_system: "Short duration system" }),
    ]});
    const e = r.payload.partIV.find((x) => x.code === "HC-01")!;
    assert.equal(e.blanks.find((b) => b.key === "grazing_system"), undefined);
    assert.equal(r.conflicts.length, 1);
    assert.ok(r.gaps.some((g) => g.key === "report.HC-01.grazing_system.conflict" && g.severity === "blocking"));
  }],
  ["only qualifying containers reach Part II/IV: undated and unevidenced are out", () => {
    const r = assemblePwd888({ ...base, containers: [
      c("SH-01", "2026-04-01", { target_species: "bluebirds" }),
      c("SW-02", null, {}),
      c("PC-01", "2026-04-01", {}, false),
    ]});
    assert.deepEqual(r.payload.partIV.map((e) => e.code), ["SH-01"]);
    assert.equal(r.payload.partII.SH, true);
    assert.equal(r.payload.partII.SW, false);
    assert.equal(r.payload.partII.PC, false);
  }],
  ["zero is a blank, so 'Number of feeders: 0' is never printed", () => {
    const r = assemblePwd888({ ...base, containers: [c("SF-05", "2026-02-01", { feeder_count: 0, feed_type: "Corn" })] });
    const e = r.payload.partIV[0];
    assert.equal(e.blanks.find((b) => b.key === "feeder_count"), undefined);
  }],
  ["'Other (describe)' disappears when no container ticked Other", () => {
    const r = assemblePwd888({ ...base, containers: [
      c("CE-02", "2026-03-01", { observed_from: ["Feeders"], observed_from_other: "stale text", target_species: "deer" }),
    ]});
    assert.equal(r.payload.partIV[0].blanks.find((b) => b.key === "observed_from_other"), undefined);
  }],
  ["spotlight: three census nights fill slots A-C in date order; a fourth overflows", () => {
    const night = (id: string, d: string) => censusToContainer({
      id, observedOn: d, method: "spotlight", methodLabel: "Spotlight Survey", milesSurveyed: 5,
      species: ["White-tailed deer"], counts: [{ species: "White-tailed deer", count: 14 }], photos: [],
    });
    const r = assemblePwd888({ ...base, containers: [
      night("o3", "2026-09-20"), night("o1", "2026-09-06"), night("o2", "2026-09-13"), night("o4", "2026-09-27"),
    ]});
    const e = r.payload.partIV.find((x) => x.code === "CE-01")!;
    const slot = (k: string) => e.blanks.find((b) => b.key === k)?.value;
    assert.equal(slot("date_a"), "2026-09-06");
    assert.equal(slot("date_b"), "2026-09-13");
    assert.equal(slot("date_c"), "2026-09-20");
    assert.deepEqual(e.overflowDates, ["2026-09-27"]);
    assert.equal(slot("route_length"), 5);
    assert.equal(slot("target_species"), "White-tailed deer");
    assert.equal(r.payload.partII.CE, true);
  }],
  ["spotlight with only two nights leaves Date C as a gap", () => {
    const r = assemblePwd888({ ...base, containers: [
      c("CE-01", "2026-09-06", { target_species: "deer" }), c("CE-01", "2026-09-13", { target_species: "deer" }),
    ]});
    assert.ok(r.gaps.some((g) => g.key === "report.CE-01.date_c"));
  }],
  ["census photo station maps to CE-11 remote detection", () => {
    const k = censusToContainer({
      id: "x", observedOn: "2026-05-05", method: "game_camera", methodLabel: "Game Camera Pull",
      milesSurveyed: null, species: ["Bobcat"], counts: [], photos: [],
    });
    assert.equal(k.subActivityCode, "CE-11");
    assert.deepEqual(k.fieldValues.methods, ["Remote detection (i.e. cameras)"]);
  }],
  ["census counts are documentation: no photo needed", () => {
    const k = censusToContainer({
      id: "n1", observedOn: "2026-03-03", method: "direct_observation", methodLabel: "Direct Observation",
      milesSurveyed: null, species: ["Turkey"], counts: [{ species: "Turkey", count: 6 }], photos: [],
    });
    const r = assemblePwd888({ ...base, containers: [k] });
    assert.equal(r.payload.partII.CE, true);
    assert.deepEqual(r.payload.partV.map((x) => [x.kind, x.censusCounts]), [["census_record", [{ species: "Turkey", count: 6 }]]]);
  }],
  ["a census with no counts is not documented, even with species listed", () => {
    const k = censusToContainer({
      id: "n2", observedOn: "2026-03-03", method: "direct_observation", methodLabel: "Direct Observation",
      milesSurveyed: null, species: ["Turkey"], counts: [{ species: "Turkey", count: 0 }], photos: [],
    });
    const r = assemblePwd888({ ...base, containers: [k] });
    assert.equal(r.payload.partII.CE, false);
    assert.equal(r.payload.partIV.length, 0);
    assert.ok(r.gaps.some((g) => g.key === "activity.census:n2.evidence" && /no counts recorded/.test(g.label)));
  }],
  ["exhibits are numbered in Part IV order", () => {
    const r = assemblePwd888({ ...base, containers: [c("CE-02", "2026-01-01", { target_species: "deer" }), c("HC-04", "2026-06-01", { acres_treated: 4 })] });
    assert.deepEqual(r.payload.partV.map((x) => [x.number, x.subActivityCode]), [[1, "HC-04"], [2, "CE-02"]]);
  }],
  ["mailing address splits across the form's two blanks", () => {
    assert.deepEqual(splitMailingAddress("12 Oak Ln, Dripping Springs, TX 78620"), { street: "12 Oak Ln", cityStateZip: "Dripping Springs, TX 78620", split: true });
    assert.deepEqual(splitMailingAddress("PO Box 9"), { street: "PO Box 9", cityStateZip: null, split: false });
    // No comma between street and city: never guess where the city starts.
    assert.deepEqual(splitMailingAddress("1606 Headway Circle #9023 Austin, TX 78619"), { street: "1606 Headway Circle #9023 Austin, TX 78619", cityStateZip: null, split: false });
  }],
  ["the 50-129 association answer is a proposal, never rendered", () => {
    const r = assemblePwd888({ ...base, containers: [], association: { member: null, name: null, proposedMember: true } });
    assert.equal(r.payload.partIII.member, null);
    assert.deepEqual(r.proposals.map((p) => p.key), ["association.member"]);
  }],
];

let failed = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n    ${(e as Error).message.split("\n").join("\n    ")}`); }
}
console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
