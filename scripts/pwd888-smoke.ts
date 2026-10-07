/**
 * Assemble the PWD-888 for every property against the real database and print
 * what would be drawn on the form.
 *
 *   npx tsx scripts/pwd888-smoke.ts [taxYear]
 *
 * Read-only. Like gap-analysis-smoke.ts, it exists because the interesting
 * failures are data-shaped.
 */
import { createClient } from "@supabase/supabase-js";
import { buildPwd888 } from "../lib/annual-report/pwd888/build-server";
import { blockingGaps } from "../lib/annual-report/gap-analysis";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const show = (v: unknown) => (Array.isArray(v) ? v.join(", ") : String(v));

async function main() {
  const year = Number(process.argv[2] ?? new Date().getFullYear());
  const { data: properties } = await db.from("properties").select("id, name").order("name");

  for (const p of properties ?? []) {
    const r = await buildPwd888(p.id, year);
    const { payload: f } = r;
    console.log(`\n${"=".repeat(64)}\n${p.name} — ${f.years}`);
    console.log(`  Part I   ${JSON.stringify(f.partI)}`);
    const ticked = Object.entries(f.partII).filter(([, v]) => v).map(([k]) => k);
    console.log(`  Part II  ${ticked.length ? ticked.join(", ") : "(none)"}  — ${r.analysis.qualifyingPractices}/3`);
    console.log(`  Part III member=${f.partIII.member} name=${f.partIII.associationName}`);
    for (const e of f.partIV) {
      console.log(`  Part IV  ${e.code} ${e.name}  [${e.containerIds.length} container(s): ${e.workDates.join(", ")}]`);
      for (const b of e.blanks) console.log(`             ${b.formLabel}: ${show(b.value)}  (${b.basis})`);
      if (e.overflowDates.length) console.log(`             + overflow dates: ${e.overflowDates.join(", ")}`);
    }
    console.log(`  Part V   ${f.partV.length} exhibit(s)` + (f.partV.length ? `: ${f.partV.map((x) => `#${x.number} ${x.kind}/${x.docType}`).join(", ")}` : ""));
    const census = r.analysis.practices.find((x) => x.code === "CE")!;
    console.log(`  census   CE containers=${census.containers} qualifying=${census.qualifying}`);
    console.log(`  gaps     ${r.gaps.length} (${blockingGaps({ ...r.analysis, gaps: r.gaps }).length} blocking), conflicts ${r.conflicts.length}, proposals ${r.proposals.length}`);
    for (const g of r.gaps.filter((g) => g.key.startsWith("report.") || g.key.startsWith("identity.additional"))) {
      console.log(`    [${g.severity[0].toUpperCase()}] ${g.section}  ${g.label}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
