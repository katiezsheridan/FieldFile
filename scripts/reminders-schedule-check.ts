/** Fixture checks for lib/reminders/schedule.ts.  npx tsx scripts/reminders-schedule-check.ts */
import assert from "node:assert/strict";
import { dueReminders, texasToday } from "../lib/reminders/schedule";

const at = (d: string) => dueReminders(d).map((r) => `${r.kind}:${r.taxYear}:${r.step}:${r.daysLeft}`);
const cases: [string, () => void][] = [
  ["nothing due in summer", () => assert.deepEqual(at("2026-07-15"), [])],
  ["Oct 31: not yet", () => assert.deepEqual(at("2026-10-31"), [])],
  ["Nov 1: first activities nudge, 60 days left", () => assert.deepEqual(at("2026-11-01"), ["activities:2026:nov1:60"])],
  ["mid-Dec: only the latest step reached", () => assert.deepEqual(at("2026-12-21"), ["activities:2026:dec20:10"])],
  ["Dec 31 still counts", () => assert.deepEqual(at("2026-12-31"), ["activities:2026:dec20:0"])],
  ["Jan 2: activities over, report not yet", () => assert.deepEqual(at("2027-01-02"), [])],
  ["Mar 1: report for the previous tax year", () => assert.deepEqual(at("2027-03-01"), ["report:2026:mar1:60"])],
  ["Apr 23 → Apr 30", () => assert.deepEqual(at("2027-04-23"), ["report:2026:apr23:7"])],
  ["May 1: report deadline passed, nothing", () => assert.deepEqual(at("2027-05-01"), [])],
  ["Texas date, not UTC: 03:00 UTC Nov 1 is still Oct 31 in Texas", () =>
    assert.equal(texasToday(new Date("2026-11-01T03:00:00Z")), "2026-10-31")],
];
let failed = 0;
for (const [n, f] of cases) { try { f(); console.log(`  ✓ ${n}`); } catch (e) { failed++; console.log(`  ✗ ${n}\n    ${(e as Error).message}`); } }
console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
