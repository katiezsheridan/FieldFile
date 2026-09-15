# Annual Report (PWD-888) — build session QA

**Dates:** 2026-09-10 → 2026-09-15
**PRs:** #46, #47, #48, #49 merged · #50 open
**Migrations:** `add_annual_report_domain.sql`, `add_field_log_containers.sql` — both applied to Supabase and verified

## Goal

Make the app mirror TPWD form PWD-888 so a landowner records wildlife
management work once, in the form's own terms, and it carries onto the annual
report without re-entry. Build the data model underneath it, and get the
three-of-seven rule computed from real evidence.

## Delivered

| # | What | Notes |
|---|---|---|
| 46 | PWD-888 Part IV catalog + schema | 7 practices, 48 sub-activities, 169 field definitions. Add Activity mirrors the form's blanks and checkboxes |
| 47 | Edit a container after it's added; readable errors | Reclassifying an activity moves all its evidence. Supabase errors surfaced properly |
| 48 | **Fix: Add Activity was passing a slug where a UUID belonged** | Broken since slugs shipped. Also: slug regenerates on rename, page follows the new URL |
| 49 | Field captures file into activity containers | Sub-activity captured in the field; server groups same-day work into one container |
| 50 | Gap analysis for the three-of-seven rule | *Open.* Per property per tax year; property page leads with readiness |

## Verified

- `npx tsc --noEmit`, `npm run lint`, `npm run build` — clean on every PR
- Catalog transcribed from the **real form** (`templates/pwd_888.pdf`, rev 03/02),
  not from memory. Verification caught invented blanks, a wrong option set
  (no "baiting" in cowbird control) and ten dropped watering-facility types
- SQL seed is **generated** from `lib/sub-activities.ts` — `--check` fails on drift
- Both migrations applied and confirmed against the database:
  7 practices / 48 sub-activities / 169 field requirements; 11 activities and
  14 documents backfilled, 0 unmapped; 5 field-log entries filed, 0 unfiled
- Add Activity confirmed working in production — 5 real activities created with
  detail, sub-activity, and report period
- Gap analysis smoke-tested against real data, which caught a counting bug
  (undated containers were counting toward the floor)

## QA checklist — needs a human

- [ ] **Field log grouping.** Capture two photos of the same activity on the
      same day → should land in **one** container with both photos
- [ ] **Offline capture.** Capture with no signal, flush later → should join the
      container for the **capture** date, not the sync date
- [ ] **Edit an activity.** Change its practice/sub-activity → evidence follows
- [ ] **Re-date across years.** Move an activity to another tax year → its
      documents move with it; warning names both years
- [ ] **Classify the backfilled containers.** 5 "Field log entry" + 2 census
      rows have a practice but no sub-activity
- [ ] **Readiness card.** Counts match the smoke test; attaching a photo to a
      dated, classified activity flips that practice to counted
- [ ] **Rename a property while on its page** → lands on the new URL, no 404

## Known gaps

- Every property currently reads **0 of 3** — correct, not a bug. Promised Lland
  Ranch has 5 dated, classified activities with **no photos**; Bark Springs'
  older activities have no `performed_on`; the field-log containers have no
  sub-activity
- 4 call sites still pass `propertyId={id}` (a slug) — unaudited for the same
  confusion that broke Add Activity: `ActivityEvidenceCard`, `FieldLogMap`,
  `Form50129Review`, the field-log entry page
- Property renames still break bookmarks and shared links (no slug history)
- Part III (association membership) isn't stored anywhere — always an open gap
- **One Supabase project serves local, preview and production.** No staging
  database; every migration hits live data on its first run

## Next

Adaptive questionnaire (consumes the gap list), then the PWD-888 render. The
form has **no AcroForm fields**, so the render must draw onto the page rather
than use pdf-lib's `getForm()` the way `fill50129` does.
