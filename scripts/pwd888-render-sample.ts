/**
 * Render a PWD-888 with EVERY Part IV field filled, to check placement by eye.
 *
 *   npx tsx scripts/pwd888-render-sample.ts out.pdf
 *
 * No database. Text blanks carry their field key, so a value that lands on the
 * wrong line names itself. Every option of every choice is ticked.
 */
import { writeFileSync } from "node:fs";
import { SUB_ACTIVITY_DEFS } from "../lib/sub-activities";
import { renderPwd888 } from "../lib/forms/pwd888/render";
import type { Pwd888Payload } from "../lib/annual-report/pwd888/types";
import type { FieldValue } from "../lib/types";

const sample = (inputType: string, key: string, choices?: string[]): FieldValue => {
  switch (inputType) {
    case "number": case "integer": return 12;
    case "date": return "2026-03-14";
    case "boolean": return true;
    case "choice": return key === "technique" ? choices![1] : choices![0];
    case "multi_choice": return choices!;
    default: return key;
  }
};

const payload: Pwd888Payload = {
  years: "2026",
  partI: {
    accountNumber: "R123456", ownerName: "Pat Q. Landowner", mailingAddress: "12 Oak Lane",
    cityStateZip: "Dripping Springs, TX 78620", phone: "(512) 555-0100", tractName: "Home Place",
    majorityCounty: "Hays", additionalCounties: "Travis",
  },
  partII: { HC: true, EC: true, PC: true, SW: true, SF: true, SH: true, CE: true },
  partIII: { member: true, associationName: "Hays County WMA" },
  partIV: SUB_ACTIVITY_DEFS.map((s) => ({
    code: s.code, practiceCode: s.practiceCode, name: s.name, containerIds: [], workDates: [],
    blanks: s.fields.map((f) => ({
      key: f.key, formLabel: f.formLabel ?? f.label, value: sample(f.inputType, f.key, f.choices),
      basis: "entered" as const, sourceIds: [],
    })),
    overflowDates: [],
  })),
  partV: [{
    id: "r1", kind: "census_record", docType: "note", capturedAt: "2026-09-06", caption: null, lat: null,
    lng: null, storagePath: null, number: 1, containerId: "c", subActivityCode: "CE-01",
    censusCounts: [{ species: "White-tailed deer", count: 14 }],
  }],
};

renderPwd888(payload).then((b) => { writeFileSync(process.argv[2], b); console.log("wrote", process.argv[2]); });
