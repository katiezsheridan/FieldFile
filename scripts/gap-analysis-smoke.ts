/**
 * Run gap analysis against the real database and print it.
 *
 *   npx tsx scripts/gap-analysis-smoke.ts [taxYear]
 *
 * Read-only. Exists because the interesting failures here are data-shaped —
 * a null performed_on, a container with no sub-activity — and a fixture would
 * not have surfaced them.
 */
import { createClient } from "@supabase/supabase-js";
import { analyzePropertyYear } from "../lib/annual-report/gap-analysis-server";
import { blockingGaps, isReportReady } from "../lib/annual-report/gap-analysis";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const year = Number(process.argv[2] ?? new Date().getFullYear());
  const { data: properties } = await db
    .from("properties")
    .select("id, name")
    .order("name");

  for (const p of properties ?? []) {
    const a = await analyzePropertyYear(p.id, year);
    const counting = a.practices.filter((x) => x.counts).map((x) => x.code);
    console.log(`\n${"=".repeat(64)}\n${p.name} — ${year}`);
    console.log(
      `  ${a.qualifyingPractices}/7 practices documented ` +
        `${a.meetsMinimum ? "✓ meets the floor" : "✗ short of 3"}` +
        (counting.length ? `  [${counting.join(", ")}]` : "")
    );
    console.log(`  report ready: ${isReportReady(a) ? "yes" : "no"}`);
    for (const s of a.practices.filter((x) => x.containers > 0)) {
      console.log(
        `    ${s.code} ${s.name}: ${s.containers} container(s), ${s.qualifying} qualifying`
      );
    }
    const blocking = blockingGaps(a);
    console.log(`  gaps: ${a.gaps.length} (${blocking.length} blocking)`);
    for (const g of a.gaps.slice(0, 8)) {
      console.log(`    [${g.severity[0].toUpperCase()}] ${g.section}  ${g.label}`);
    }
    if (a.gaps.length > 8) console.log(`    … ${a.gaps.length - 8} more`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
