/**
 * Render one property's real PWD-888 to a local file. Read-only: it reads the
 * database and storage, and writes only the output path — nothing is uploaded.
 *
 *   npx tsx scripts/pwd888-render-smoke.ts "<property name>" <taxYear> out.pdf
 *
 * The output holds the owner's details and photos; keep it out of the repo.
 */
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { blockingGaps } from "../lib/annual-report/gap-analysis";
import { buildPwd888 } from "../lib/annual-report/pwd888/build-server";
import { loadExhibitImage } from "../lib/annual-report/pwd888/exhibit-images-server";
import { renderPwd888 } from "../lib/forms/pwd888/render";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const [name, yearArg, out] = process.argv.slice(2);
  const { data: p } = await db.from("properties").select("id").eq("name", name).single();
  const r = await buildPwd888(p!.id, Number(yearArg));
  const open = blockingGaps({ ...r.analysis, gaps: r.gaps }).length;
  let loaded = 0;
  const bytes = await renderPwd888(r.payload, {
    loadImage: async (x) => { const img = await loadExhibitImage(x); if (img) loaded++; return img; },
    draft: open ? { openItems: open } : null,
  });
  writeFileSync(out, bytes);
  console.log(`${name} ${yearArg}: ${r.payload.partIV.length} Part IV entries, ${r.payload.partV.length} exhibits (${loaded} images loaded), ${open} blocking → ${out} (${(bytes.length / 1024).toFixed(0)} KB)`);
}
main().catch((e) => { console.error(e); process.exit(1); });
