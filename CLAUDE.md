# CLAUDE.md

Guidance for AI assistants (Claude Code and friends) working in this repo.

## What this project is

FieldFile is a Next.js app that helps Texas landowners with wildlife tax exemptions: storing documentation, logging wildlife management activities, and preparing annual reports. Positioning is **document storage, activity logging, and annual report preparation** — the landowner submits to the county. Don't introduce language that says FieldFile files on the landowner's behalf.

## Annual Report Domain Model

This is the domain spine of the product. Read it before touching anything that
records what a landowner did on their land, or anything that produces a document
for a county appraisal district. **Not all of it is built** — the "Status" table
at the end of this section says what exists today and what is still target
state. Treat the model as binding on new code either way.

The deliverable this model exists to produce is **TPWD form PWD-888-W7000**,
"1-D-1 Open Space Agricultural Valuation — Wildlife Management Annual Report."
The form's own instruction: *submit to your County Tax Appraiser, not to TPWD*.
That matches our positioning — we prepare, the landowner submits.

Three related documents, don't confuse them:

| Form | What it is | Where it lives here |
|---|---|---|
| **PWD-885** | The wildlife management **plan** (forward-looking, TPWD form) | Wildlife Plan feature: `plans` / `plan_practices`, `components/plan/` |
| **PWD-888** | The **annual report** (backward-looking: what you actually did) | This section. Not built yet. |
| **Comptroller 50-129** | The 1-d-1 **application** to the CAD; Section 5 references the plan | `lib/forms/form50129/`, `components/filing/Form50129Review.tsx` |

### 1. The seven qualifying practices

Texas Tax Code **§ 23.51(7)(A)** defines "wildlife management" as actively using
land — that *at the time the wildlife-management use began* was already appraised
as qualified open-space or timber land — in at least three of seven ways, to
propagate a sustaining breeding, migrating, or wintering population of indigenous
wild animals for human use.

The statutory order, the PWD-888 Part IV numbering, and our existing
`PracticeCategory` union all agree. Codes below are **stable identifiers** —
never renumber them, never reuse a retired one.

| Code | Statute | PWD-888 Part IV | DB / TS value (`PracticeCategory`) | Label |
|---|---|---|---|---|
| `HC` | 23.51(7)(A)(i) | 1. Habitat Control | `habitat_control` | Habitat Control |
| `EC` | (ii) | 2. Erosion Control | `erosion_control` | Erosion Control |
| `PC` | (iii) | 3. Predator Control | `predator_control` | Predator Control |
| `SW` | (iv) | 4. Supplemental Water | `supplemental_water` | Supplemental Water |
| `SF` | (v) | 5. Providing Supplemental Food | `supplemental_food` | Supplemental Food |
| `SH` | (vi) | 6. Providing Supplemental Shelter | `supplemental_shelter` | Providing Supplemental Shelter |
| `CE` | (vii) | 7. Census | `census` | Census / Population Counts |

The two-letter code is the **wire format** for anything new (report payloads, AI
proposals, URL params, analytics). The snake_case value stays the **storage
format** — it is already a check constraint on `field_log_entries.practice_category`
and `plan_practices.practice_type`, and changing it would be a data migration for
no benefit. Keep a single mapping table when you add codes to code; do not let a
second spelling of the seven appear anywhere.

**Alternative qualification routes.** § 23.51(7)(B) (federally listed endangered
species under a federal permit, in a habitat preserve subject to a conservation
easement) and § 23.51(7)(C) (conservation/restoration projects compensating for
natural resource damages under CERCLA, the Oil Pollution Act, the Federal Water
Pollution Control Act, or Texas Natural Resources Code ch. 40) are *separate ways
to qualify*, not sub-questions of the three-of-seven rule. The Section 5 fields
already in `lib/forms/form50129/buildPayload.ts` — `endangeredHabitat`,
`esaPermit`, `habitatPreserveEasement`, `conservationProject.*` — are exactly
these. Don't fold them into practice counting.

#### Sub-activities

48 sub-activities across the seven practices. A sub-activity code is
`{PRACTICE}-{NN}`, and `NN` follows the order the item is printed on the form.

**The catalog lives in `lib/sub-activities.ts`** — all 48, with every blank,
checkbox and yes/no the form prints under each (169 field definitions). That file
is the source of truth; the `sub_activities` / `field_requirements` seed in
`migrations/add_annual_report_domain.sql` is GENERATED from it by
`npx tsx scripts/generate-field-requirements-seed.ts` (`--check` fails if the two
have drifted). Do not restate the catalog here, or in a component, or in a second
SQL block — one spelling of Part IV, in one file.

The form itself is kept at `templates/pwd_888.pdf`, and its Part IV text,
extracted verbatim, at `docs/pwd888-part-iv.txt`. Diff against those before
changing the catalog.

The existing `CensusMethod` union in `lib/types.ts` predates these codes and maps
onto `CE-*` as: `spotlight`→`CE-01`, `direct_observation`→`CE-02`, `aerial`→`CE-04`,
`track_survey`→`CE-05`, `daylight_count`→`CE-06`, `harvest_record`→`CE-07`,
`browse_utilization`→`CE-08`, `endangered_species`→`CE-09`, `nongame`→`CE-10`, and
`photo_station` / `game_camera` / `time_area_count` / `roost_count` /
`songbird_transect` / `quail_call_covey` / `point_count` / `other`→`CE-11`.
`CE-03` (stand counts) has **no** `CensusMethod` equivalent — add one when census
observations are wired into the report.

**Verification discipline.** The catalog was transcribed from the real form, not
from memory — the same rule `lib/forms/form50129/fieldMap.ts` follows. Re-extract
and diff before trusting any change to it. What that verification pass actually
caught, all of it from a recalled-not-read version of the form:

- **The revision is (03/02)**, not 07/08. There is one current PWD-888 and this
  is it; the practices are Part II, the sub-activity checklist is Part IV.
- **Invented blanks.** A recalled list adds detail the form does not ask for —
  acres and dates on `EC-04`, `EC-05`, `HC-07`, `HC-08`; a stream length on
  `HC-06`; an "Additional Information" box on all 48. The form prints none of
  them. Only transcribe what is printed.
- **Wrong option sets.** `PC-02`/`PC-03` method of control is trapping, shooting,
  scare tactics — not "baiting". `HC-06` asks for three separate species lists
  (trees, shrubs, herbaceous), not one free-text field.
- **Dropped detail.** `SW-02` prints ten named watering-facility types each with
  its own count blank; `SH-04` and `SF-04` have far more sub-detail than a
  summary suggests.
- **Shared blanks.** Part IV.3 prints fire ants, cowbirds and grackle/starling as
  three checkboxes over ONE "Method of control:" line, and Part IV.5 repeats
  grazing management, prescribed burning and range enhancement as bare checkboxes
  whose blanks are printed once under Habitat Control. The catalog notes both.
- **Prospective phrasing.** The annual report is retrospective, but several
  blanks read "Planned date of construction", "Acreage to be treated annually" —
  the form reuses the PWD-885 plan sheets. `FieldDef.label` is our past-tense
  wording and `FieldDef.formLabel` keeps the form's, so the UI reads correctly
  and the PDF fill stays honest.


### 2. The three-of-seven rule

> At least **3 of the 7** practices must be **performed and documented**, **per
> tax year**, **per qualifying tract**.

Unpack each part, because each one is a distinct constraint on the data model:

- **3 of 7** — statutory floor, not a target. Encourage more than three; a tract
  that squeaks by on exactly three has no margin if one practice's evidence is
  weak. The floor already exists in code as `MIN_PRACTICES` in
  `lib/plan-completion.ts` and as the `wildlife.practices` gap check in
  `buildPayload.ts` (`>= 3`). Any new count must import the constant, not
  re-type `3`.
- **Performed *and* documented** — these are two different failure modes and the
  report must distinguish them. A practice that was performed but has no evidence
  is a gap we can close by asking the landowner to upload something; a practice
  that was never performed cannot be fixed at report time. Never let a *selected*
  practice on the plan (PWD-885, forward-looking) count as a *performed* practice
  on the annual report (PWD-888, backward-looking). Selection is an intention;
  the annual report asserts a fact.
- **Per tax year** — the counting window is the report year, not all time.
  Evidence is bucketed by the date the activity happened, which is why
  `field_log_entries.captured_at` exists separately from `created_at`: a photo
  uploaded in January of evidence captured the prior November belongs to the
  prior year. Always count on the activity date, never the row-insert date.
- **Per qualifying tract** — a landowner with three tracts must satisfy the rule
  on each independently. Our unit is the property (`property_id`), and PWD-888
  Part I asks for tract name, majority county, and additional counties. Never
  aggregate practice counts across properties to reach three.

### 3. The core architectural decision: THE ACTIVITY IS THE CONTAINER

**A landowner creates an activity — practice, sub-activity, date, location — and
then dumps photos and receipts into it. Evidence never floats free, and evidence
is never classified by practice after the fact, because the user already told us
at bucket-creation time.**

This is the decision the rest of the product hangs off. It is a *product* choice
before it is a technical one: the landowner is standing in a pasture and knows
exactly what they just did. Capturing that intent at the moment of creation costs
one tap and is authoritative. Recovering it later from a photo of some brush is
guesswork, and guesswork is exactly what an appraisal district's audit will not
accept.

Rules that follow from it — these are checkable, treat them as review criteria:

- **Practice and sub-activity are chosen at container creation.** They are
  required fields on the container, not nullable ones filled in later.
- **Every piece of evidence carries a non-null FK to its container.** If you are
  adding an evidence table or column and the container reference is nullable,
  you have broken the model. `documents.activity_id` already works this way.
- **No classifier.** Do not build, propose, or scaffold anything that infers a
  practice from a photo, a filename, a receipt's OCR text, or a GPS cluster.
  This is not a "we haven't got to it yet" — it is out of the model.
- **No unsorted inbox.** There is no "upload evidence, sort it later" surface. An
  upload flow that does not start from a container is the wrong flow.
- **Reclassification happens on the container, once.** If the landowner picked
  the wrong practice, they edit the activity and every piece of evidence in it
  moves with it. That is the only reclassification path; there is no per-photo
  practice field to drift out of sync with its parent.
- **The container is what the report counts.** The three-of-seven count is over
  containers-with-evidence in the tax year, not over loose files.

**Why this shape matches the form.** PWD-888 Part IV is literally a checklist of
sub-activities grouped under practices, and Part V says "attach copies of
supporting documentation such as receipts, maps, photos." The form's own
structure is a container per sub-activity with evidence attached. Our data model
should look like the artifact it produces.

**Where the current code stands.** Two existing surfaces already honor the
*spirit* — the user names the practice at capture time, and nothing is ever
inferred — but neither is a full container yet:

- `field_log_entries` now carries `sub_activity_code` (what the landowner tapped)
  and `activity_id` (the container). **The client never picks the container** —
  `findOrCreateContainer()` in `lib/field-log-server.ts` resolves it server-side
  by find-or-create on `(property_id, sub_activity_id, performed_on)`. Two
  consequences worth preserving: capture works offline, because the sub-activity
  catalog is static TypeScript and no lookup is needed; and the key is the
  CAPTURE date, not `now()`, so an entry flushed from the offline queue three
  days later still joins the day the work happened. The table stays separate from
  `documents` on purpose — field photos carry GPS and live in the PRIVATE
  `field-log` bucket behind signed URLs, while `documents` is public.
- `census_observations` + `census_species_counts` is already a proper container
  for `CE`: a dated, located session with structured counts and documents hanging
  off it via `documents.observation_id`. It is the closest thing in the repo to
  the target shape — use it as the reference implementation.
- The legacy `ActivityType` union in `lib/types.ts` is a *sub-activity* taxonomy
  wearing a practice's name (`birdhouses`→`SH-01`, `feeders`→`SF-05`,
  `water_sources`→`SW-02`, `brush_management`→`HC-04`, `native_planting`→`HC-03`,
  `erosion_control`→`EC-*`, `predator_management`→`PC-04`, `census`→`CE-*`). When
  the container model lands, `activities` should carry practice code + sub-activity
  code as two fields rather than this flat mixed union.

### 4. The generation flow

```
activities with evidence  ->  gap analysis  ->  short adaptive questionnaire  ->  PWD-888 render
```

This deliberately mirrors the 50-129 pipeline, which is already built and
working end-to-end. Reuse those patterns rather than inventing parallel ones:

| Stage | What it does | Existing analog to copy |
|---|---|---|
| **Activities with evidence** | Read containers for the property + tax year, with their photos/receipts. Nothing is asked of the user yet. | `lib/field-log-server.ts` (`fetchFieldLogEntries` with `from`/`to`/`category`), `groupByPracticeCategory()` in `lib/field-log.ts` — built as report raw material |
| **Gap analysis** | Compute what the report still needs: fewer than three practices with evidence, a practice with a date but no photo, missing Part I identity, missing per-year confirmations. Returns a typed list, does not prompt. | `detectMissing()` / `MissingField[]` in `lib/forms/form50129/buildPayload.ts` — keep the `{ key, section, label, bucket }` shape |
| **Short adaptive questionnaire** | Ask **only** what gap analysis actually found, in plain language. Short is the whole point. | The bucket model: 1 = known, fill silently; 2 = ask once, reuse forever; 3 = genuinely per-filing |
| **PWD-888 render** | Fill the real TPWD PDF from the assembled payload; store it privately; hand back a signed URL. | `lib/forms/form50129/fill.ts` + `storage.ts` (private bucket, stable overwrite path, 1h signed URL) |

Non-negotiables carried over from the 50-129 work:

- **Never sign, never file.** PWD-888 Part V ends in a certification and a
  signature line. Leave the signature and its date **blank**, exactly as
  `fill50129` does. We output a completed-but-unsigned PDF; the landowner reviews,
  signs, and submits to the CAD.
- **Never ask for what we already know.** If evidence answers a question, the
  questionnaire must not ask it. A gap that data can close is a bug in the
  assembler, not a question for the user.
- **Ask once, reuse forever.** Part I (owner, account number, mailing address,
  tract name, county) is Bucket 2 — it is nearly the same data as
  `owner_profiles`, which already exists. Reuse that table rather than adding a
  second owner block; on year two the questionnaire should be a confirm, not a
  re-entry.
- **Part III** (wildlife management association membership) is a Bucket-2/3
  hybrid: it rarely changes, so store it and confirm it, don't re-ask it cold.

### 5. Propose, do not assert

**AI output is always a proposal with a confidence score. It reaches a submitted
form only through a recorded human confirmation event.**

In practice, **most AI output in this product surfaces as a pre-filled quiz
answer the user taps to confirm — not as a value written silently into a field.**
That sentence is the design brief. If you are about to write a model's output
straight into a form field, stop; you are building the wrong thing.

Why this is not negotiable: PWD-888 Part V and 50-129 Section 7 are sworn
statements the landowner signs. A false statement carries real criminal exposure
under Penal Code § 37.10. We do not put words in a landowner's mouth and then ask
them to swear to them. The confirmation event is also the audit artifact — if a
CAD ever asks how a number got on the form, the answer must be "the owner
confirmed it on this date," not "our software decided."

Rules:

- **Every AI-derived value is a proposal**, carrying at minimum: what was
  proposed, what produced it (model + prompt version), a confidence score, and
  what it was derived from.
- **A proposal is inert until confirmed.** It can be rendered as a suggestion, a
  pre-selected answer, or a draft. It cannot reach a rendered PDF, a `ready`
  status, or anything the landowner signs.
- **Confirmation is an event, recorded and durable** — who confirmed, when, the
  proposed value, and the accepted value (they differ when the user edits). It is
  a stored row, not a React state flag. It must survive a page refresh and be
  reconstructable a year later during an audit.
- **Confidence changes the ask, never the authority.** High confidence means a
  pre-selected answer the user taps once to accept. Low confidence means an open
  question or a "we're not sure — which of these?" It never means "high enough to
  skip the human."
- **Silence is not consent.** A proposal the user never saw is never confirmed.
  Do not treat "didn't object" or "clicked Next" as confirmation of individual
  values — the confirmation must be attached to the value.
- **The user always outranks the model.** An edited value is stored as the user's,
  and the proposal is kept alongside it as history, not overwritten.

When this gets built, the shape to reach for is a proposals table keyed to the
target field (`{ target_key, proposed_value, source, model, prompt_version,
confidence, status, confirmed_value, confirmed_by, confirmed_at }`), consumed by
the questionnaire step of the generation flow above. Anything that bypasses it —
a helper that "just fills in the obvious ones" — is the exact failure this rule
exists to prevent.

### Status: built vs. target

| Piece | Status |
|---|---|
| The seven practices as a type + check constraint | **Built** — `PracticeCategory`, `lib/plan-practices.ts`, `lib/field-log.ts`, two check constraints |
| Two-letter practice codes (`HC`…`CE`) | **Built** — `PracticeCode` in `lib/types.ts`, mapping in `lib/practices.ts` |
| 48 sub-activity codes + their 169 form fields | **Built** — `lib/sub-activities.ts`, generating the SQL seed. Plans still capture free-text `documentation.plannedActivities` |
| Three-of-seven, plan side | **Built** — `MIN_PRACTICES` in `lib/plan-completion.ts` |
| Three-of-seven, evidence-backed annual side | **Built** — `lib/annual-report/gap-analysis.ts`. A container counts only when dated AND classified AND documented; `qualifies()` is the one place that rule lives |
| Activity as container | **Built** — `AddActivityForm` creates one and `EditActivityForm` reclassifies it; `documents.activity_id`, `census_observations` and now `field_log_entries` (`sub_activity_code` + `activity_id`) all hang off one. Field captures are grouped server-side by (property, sub-activity, capture date), so a fence line photographed six times in a day is one container, not six |
| Practice chosen at capture time, never inferred | **Built** — field log capture and pin flows both require it up front |
| Evidence query layer for the report | **Built** — `lib/field-log-server.ts`, `groupByPracticeCategory()` |
| Gap analysis + bucket model | **Built** for both — `buildPayload.ts` (50-129) and `lib/annual-report/gap-analysis.ts` (PWD-888), sharing the `{ key, section, label, bucket }` shape. The PWD-888 side adds `severity`: blocking stops an honest render, warning only weakens it |
| Adaptive questionnaire | **Target** |
| PWD-888 render | **Target** — the blank form is at `templates/pwd_888.pdf`; nothing fills it yet. It has no AcroForm fields, so this will be a draw-onto-the-page fill, not the `getForm()` approach `fill50129` uses |
| Propose-don't-assert plumbing | **Target** — there is no AI-generated content in the app today |

## Stack

- **Next.js 14.2** (app router), **React 18**, **TypeScript 5** (strict).
- **Clerk 6** for auth, **Supabase 2** for database + file storage.
- **Tailwind 3** with a custom `field-*` palette. `clsx` + `tailwind-merge` via `cn()` in `lib/utils.ts`. `class-variance-authority` is installed but not yet used.
- A few Radix primitives (`dropdown-menu`, `progress`, `slot`, `tabs`) — the app is **not** Radix-first. Most UI is hand-built Tailwind components.
- **Leaflet** + `react-leaflet` for property maps. **Resend** for transactional email. **react-google-recaptcha-v3** on public forms (`/request-availability`, `/quiz`).
- Deployed on Vercel. CI runs lint + typecheck on GitHub Actions; Vercel runs the actual build on every preview.

## Workflow

- **Never push to `main`.** Push to a branch and open a PR. The PR template in `.github/PULL_REQUEST_TEMPLATE.md` has a migrations checkbox — use it when schema changes.
- **Ask before acting on ambiguity.** Small copy tweaks, fine to just do. Anything touching pricing, positioning, legal pages (privacy/terms), auth, or data shape — confirm first.
- **Run locally before pushing**: `npm run lint` and `npx tsc --noEmit`. CI will fail the PR otherwise.
- **Don't bypass hooks or CI.** If a check fails, fix the underlying cause.
- When implementing a multi-step change, prefer one focused PR per logical unit. A bundled PR is fine for tightly coupled changes; avoid 10-commit grab-bags.

## Directory layout

```
app/
  (marketing)/       Public pages: /, /pricing, /how-it-works, /faq,
                     /services, /about, /privacy, /terms, /quiz,
                     /request-availability, /resources (placeholder)
  (main)/            Authenticated app: /dashboard, /setup,
                     /properties/[id]/{map,documents,activities,...}
  (auth)/            Auth flow pages (/signup, /file)
  sign-in/, sign-up/ Clerk-hosted auth routes (outside groups — Clerk convention)
  api/               Route handlers: /leads, /properties, /quiz-report,
                     /verify-captcha, /setup
  guides/            Public guide pages (e.g. /guides/hill-country-species)
components/          Organized by feature (dashboard/, activities/, census/,
                     documents/, map/, quiz/, onboarding/, filing/, ui/, layout/)
lib/
  supabase.ts        Client instance + upload/delete helpers
  hooks.ts           useProperties, useAutoSave, useDebounce
  utils.ts           cn(), getStatusLabel(), etc.
  types.ts           Property, Activity, CensusObservation, etc.
  demo-data.ts       Prototype data (mirrors real schema)
  quiz-data.ts, census-species.ts, onboarding.ts, recaptcha.ts
middleware.ts        Clerk route protection (see below)
migrations/          Supabase SQL migrations
```

Route groups (`(marketing)`, `(main)`, `(auth)`) **don't affect URLs** — they're for grouping layouts and auth rules.

## Auth and data

- `middleware.ts` uses `clerkMiddleware` + `createRouteMatcher` with an **allow-list of public routes** (marketing, `/sign-in`, `/sign-up`, `/api/*`, `/quiz`, `/request-availability`). Everything else hits `auth.protect()`. If you add a new public route, add it to the matcher.
- Client code reads the user with `useUser()` from `@clerk/nextjs`. There's no custom `withAuth` HOC — protection is done at the middleware level.
- **Supabase is accessed directly from the client** via the anon-key instance in `lib/supabase.ts`. Server-side admin ops (e.g. `/api/leads`) use the service role key. Be careful adding new tables — if the client needs to read/write, RLS policies must allow it under the anon key.
- **Supabase rejects with a plain object, not an `Error`.** A `PostgrestError` is `{ message, code, details, hint }`, so `err instanceof Error` is false and a naive `catch` shows only its fallback string — turning a fixable `PGRST204` into "Something went wrong". Use `describeError()` / `isMissingSchemaError()` from `lib/errors.ts` in any catch around a Supabase call.
- File storage helpers (`uploadDocument`, `uploadObservationPhoto`, `uploadLandDocument`, `deleteDocument`) live in `lib/supabase.ts` — use them rather than calling `supabase.storage` directly from components.
- **There is ONE Supabase project — `rcniswzarpkwuyfksrcp` — and it is production.** Local development, the Vercel preview deploys and www.fieldfile.com all point at it. There is no dev/staging database, so `.env.local` holds production credentials and any migration you run lands on live landowner data on its first execution. (This doc previously described applying to "dev Supabase, then prod on merge"; that safety net does not exist. Do not write instructions that assume it does.)
- New schema changes: add an SQL migration to `/migrations`, mention it in the PR's "Migrations" checklist, and run it in the Supabase SQL editor. Because it runs against live data:
  - Make it **additive and idempotent** — `if not exists` / `on conflict` guards, new columns nullable, no renames or drops of anything in use. Write the matching `rollback_*.sql` at the same time.
  - Guard every backfill `update` with `where <column> is null` so a re-run is a no-op and a human's own classification always wins.
  - Supabase's SQL editor warns "This query includes destructive operations" for any `drop`/`revoke` keyword, including `drop policy if exists` immediately followed by `create policy`. Read what is actually being dropped before clicking through; the warning is a keyword scan, not an analysis.
- **After a migration, reload the PostgREST schema cache**: `notify pgrst, 'reload schema';`. The SQL editor talks straight to Postgres, but the app goes through PostgREST, which serves from a cached schema. Until it reloads, a new table or column exists in `psql` and is invisible to the app — an insert naming it fails with `PGRST204 Could not find the '<column>' column of '<table>' in the schema cache`. This bites right after a migration and then fixes itself, so it reads like a flaky app. Supabase usually reloads automatically; it can lag.

## Styling conventions

Tailwind palette lives in `tailwind.config.ts`. Use the **semantic `field-*` tokens**, not raw hex or Tailwind defaults:

| Role | Token | Notes |
|---|---|---|
| Page background | `field-cream` | `#F7F5EE` |
| Primary text | `field-ink` | `#322B2A` |
| Secondary text | `field-earth` | `#6B5E51` |
| Borders / muted | `field-wheat` | `#D8D2C9` |
| Card / mist bg | `field-mist` | `#EEEFEC` |
| Primary CTA | `field-forest` | `#495336` |
| Brand / accent | `field-green` | (used on hero, some buttons) |
| Secondary accent | `field-hero` | `#5E7080` |
| Alert / destructive | `field-terra` | `#B64F2F` |
| Highlight / badge | `field-gold` | `#CAAC58` |

Status colors (`status-draft`, `status-ready`, `status-filed`, `status-accepted`, `status-followup`) exist for the filing lifecycle. Some legacy aliases (`black`, `green`, `brown`, etc.) still exist for backward compatibility — prefer `field-*` in new code.

- Use `cn()` from `lib/utils.ts` to compose class names. It wraps `clsx` + `tailwind-merge`, so later classes override earlier ones predictably.
- Prefer `next/image` (`<Image />`) over raw `<img>`. There are a few `<img>` stragglers; don't add more — `next lint` will warn.
- JSX entity escaping: `next lint` fails on raw apostrophes and quotes inside JSX text. Use `&apos;`, `&rsquo;`, `&ldquo;`, `&rdquo;`, `&quot;`. This has bitten several past commits.
- Mobile-first. Most pages are laid out with `max-w-*` containers and responsive grid breakpoints (`md:`, `lg:`).

## Forms and UX patterns

- Public forms POST to `/api/*` route handlers (e.g. `/api/leads`). reCAPTCHA-protected forms wrap their page with `ReCaptchaProvider` and verify via `/api/verify-captcha`.
- Authenticated writes often call Supabase directly from the client via hooks (e.g. `useAutoSave`). That's intentional — it's fast and works with RLS.
- **There's no toast library.** Errors use `alert()` or inline messages. If you need a toast system, propose it in a PR — don't scatter a custom one.
- Next.js server actions are not used. Stick to the existing patterns.

## Testing

**No test suite exists yet.** `package.json` has `dev`, `build`, `start`, `lint` — no `test`. Don't claim a change is "tested" unless you actually exercised it in the dev server or preview deploy. When adding tests in the future, keep them close to the code they test (`foo.test.ts` next to `foo.ts`) and pick a runner (Vitest is the likely fit given the Next.js + TS stack).

## Gotchas

- **Client vs server components.** Most feature components are `"use client"` (50+ files) because they use state, Clerk hooks, or Supabase. Pages default to server components; add `"use client"` only when you need it.
- **Dynamic imports for Leaflet.** The map components use `next/dynamic` with `ssr: false` because Leaflet touches `window`. If you add a new map component, follow the existing pattern.
- **Clerk env vars in CI.** CI doesn't run `next build` because placeholder Clerk keys throw at prerender. Vercel has real keys and builds every PR — rely on the Vercel check for build failures, not GitHub Actions.
- **Filing terminology is a trap.** The product used to describe itself as "filing on the landowner's behalf"; this was removed in PR #2. Don't reintroduce it. The landowner submits; we prepare.
- **Two Vercel projects exist historically.** `fieldfile` is the live one; `field-file` is a ghost that 404s. Ignore it.
- **The `resources` route is a placeholder.** Don't link to it from nav or new pages until there's real content.

## When in doubt

Read the most recent 10–20 commits on `main` — the commit messages are descriptive and give a good feel for how changes tend to be scoped.
