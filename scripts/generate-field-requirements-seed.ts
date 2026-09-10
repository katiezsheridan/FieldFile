/**
 * Regenerates the `sub_activities` / `field_requirements` seed block inside
 * migrations/add_annual_report_domain.sql from the PWD-888 catalog in
 * lib/sub-activities.ts.
 *
 *   npx tsx scripts/generate-field-requirements-seed.ts [--check]
 *
 * lib/sub-activities.ts is the source of truth; the SQL is derived. Hand-edit
 * the seed and the two spellings of Part IV drift, which is exactly the failure
 * CLAUDE.md > "Annual Report Domain Model" warns about.
 *
 * --check exits non-zero if the migration is out of date, for CI.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  PRACTICE_DEFS,
  SUB_ACTIVITY_DEFS,
  type FieldDef,
} from "../lib/sub-activities";

const MIGRATION = path.join("migrations", "add_annual_report_domain.sql");
const BEGIN = "-- >>> GENERATED FROM lib/sub-activities.ts — DO NOT EDIT BY HAND";
const END = "-- <<< END GENERATED";

const q = (v: string | null | undefined): string =>
  v === null || v === undefined ? "null" : `'${v.replace(/'/g, "''")}'`;

/** A nullable text column in a VALUES list needs a cast when the row is null. */
const qt = (v: string | null | undefined): string =>
  v === null || v === undefined ? "null::text" : q(v);

/**
 * A field's own help. The sub-activity's guidance (minimum intensity, how the
 * form prints it) goes on `sub_activities.help_text`, not repeated onto each of
 * its fields.
 */
function helpFor(field: FieldDef): string | null {
  const parts = [
    field.helpText,
    field.formLabel ? `On the form: "${field.formLabel}"` : null,
  ];
  return parts.filter(Boolean).join(" ") || null;
}

function render(): string {
  const lines: string[] = [BEGIN];

  lines.push("");
  lines.push("insert into practices (code, name, description, form_section_number) values");
  lines.push(
    PRACTICE_DEFS.map(
      (p) =>
        `  (${q(p.code)}, ${q(p.name)}, ` +
        `${q(`${p.description} Tax Code ${p.statute}.`)}, ${p.formSectionNumber})`
    ).join(",\n") + "\non conflict (code) do update set"
  );
  lines.push("      name = excluded.name,");
  lines.push("      description = excluded.description,");
  lines.push("      form_section_number = excluded.form_section_number;");

  lines.push("");
  lines.push(
    "insert into sub_activities (practice_code, code, name, slug, help_text, sort_order) values"
  );
  lines.push(
    SUB_ACTIVITY_DEFS.map(
      (s) =>
        `  (${q(s.practiceCode)}, ${q(s.code)}, ${q(s.name)}, ${q(s.slug)}, ` +
        `${qt(s.helpText ?? null)}, ${s.sortOrder})`
    ).join(",\n") + "\non conflict (code) do update set"
  );
  lines.push("      practice_code = excluded.practice_code,");
  lines.push("      name = excluded.name,");
  lines.push("      slug = excluded.slug,");
  lines.push("      help_text = excluded.help_text,");
  lines.push("      sort_order = excluded.sort_order;");

  lines.push("");
  lines.push("insert into field_requirements");
  lines.push("  (sub_activity_id, field_key, label, help_text, input_type, unit, choices,");
  lines.push("   required_for_form, ai_extractable, sort_order)");
  lines.push("select sa.id, v.field_key, v.label, v.help_text, v.input_type, v.unit,");
  lines.push(
    "       v.choices::jsonb, v.required_for_form::boolean, v.ai_extractable::boolean,"
  );
  lines.push("       v.sort_order::integer");
  lines.push("from (values");

  const rows: string[] = [];
  for (const sub of SUB_ACTIVITY_DEFS) {
    if (sub.fields.length === 0) continue;
    rows.push(`  -- ===== ${sub.code} ${sub.name} =====`);
    sub.fields.forEach((f, i) => {
      const choices = f.choices ? q(JSON.stringify(f.choices)) : "null";
      rows.push(
        `  (${q(sub.code)}, ${q(f.key)}, ${q(f.label)}, ${qt(helpFor(f))}, ` +
          `${q(f.inputType)}, ${qt(f.unit ?? null)}, ${choices}, ` +
          `${q(String(Boolean(f.requiredForForm)))}, ` +
          `${q(String(Boolean(f.aiExtractable)))}, ${q(String((i + 1) * 10))}),`
      );
    });
  }
  // Trim the trailing comma on the last data row.
  const lastIdx = rows.length - 1;
  rows[lastIdx] = rows[lastIdx].replace(/,$/, "");

  lines.push(...rows);
  lines.push(") as v(sub_code, field_key, label, help_text, input_type, unit, choices,");
  lines.push("       required_for_form, ai_extractable, sort_order)");
  lines.push("join sub_activities sa on sa.code = v.sub_code");
  lines.push("on conflict (sub_activity_id, field_key) do update set");
  lines.push("      label = excluded.label,");
  lines.push("      help_text = excluded.help_text,");
  lines.push("      input_type = excluded.input_type,");
  lines.push("      unit = excluded.unit,");
  lines.push("      choices = excluded.choices,");
  lines.push("      required_for_form = excluded.required_for_form,");
  lines.push("      ai_extractable = excluded.ai_extractable,");
  lines.push("      sort_order = excluded.sort_order;");
  lines.push("");
  lines.push(END);

  return lines.join("\n");
}

async function main() {
  const check = process.argv.includes("--check");
  const sql = await readFile(MIGRATION, "utf8");

  const start = sql.indexOf(BEGIN);
  const stop = sql.indexOf(END);
  if (start === -1 || stop === -1) {
    throw new Error(
      `${MIGRATION} has no generated block. Add the ${BEGIN} / ${END} markers around the seed.`
    );
  }

  const next = sql.slice(0, start) + render() + sql.slice(stop + END.length);
  if (next === sql) {
    console.log("seed is up to date");
    return;
  }
  if (check) {
    console.error(`${MIGRATION} is out of date — run: npx tsx ${process.argv[1]}`);
    process.exit(1);
  }
  await writeFile(MIGRATION, next);
  console.log(
    `regenerated: ${SUB_ACTIVITY_DEFS.length} sub-activities, ` +
      `${SUB_ACTIVITY_DEFS.reduce((n, s) => n + s.fields.length, 0)} field requirements`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
