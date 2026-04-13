# FieldFile — Project Handoff Doc

Last updated: 2026-04-13

## Purpose
Web app that helps Texas landowners file annual **wildlife tax exemption** paperwork. Tracks wildlife management activities on their properties, organizes photo/receipt/GPS evidence, and produces county-ready reports. Supports all 254 Texas counties.

## Tech Stack
- **Framework:** Next.js 14.2.25 (App Router), React 18, TypeScript 5.3
- **Auth:** Clerk (`@clerk/nextjs` ^6.36)
- **DB + Storage:** Supabase (Postgres w/ RLS, Storage buckets)
- **Maps:** Leaflet + React-Leaflet, OpenStreetMap Nominatim for geocoding
- **UI:** Tailwind 3.4, Radix UI primitives (dropdown/tabs/progress), Lucide icons, CVA for variants (shadcn-style but no shadcn dep)
- **Uploads:** react-dropzone
- **Email:** Resend
- **Anti-spam:** Google reCAPTCHA v3

## Routes

### Marketing (public)
- `/` — home (hero, testimonials, features, pricing preview, FAQ)
- `/pricing` — Free / Document Review ($99) / Full-Service ($750/activity)
- `/how-it-works`, `/about`, `/services`, `/resources`, `/faq`
- `/request-availability` — contact form
- `/terms`, `/privacy`
- `/quiz` — interactive eligibility quiz (captures leads)

### Auth (public)
- `/sign-in`, `/sign-up`, `/signup` — Clerk

### App (protected)
- `/dashboard` — active property, progress, deadline countdown, filing status, quick actions
- `/setup` — 3-step onboarding wizard (property → user → activities)
- `/properties/[id]` — property detail + activity grid
- `/properties/[id]/activities/[activityId]` — activity checklist/notes/status
- `/properties/[id]/documents` — uploads
- `/properties/[id]/filing` — filing review/status
- `/properties/[id]/map` — Leaflet map with activity pins
- `/file` — alt filing onboarding

### API
- `POST /api/setup` — creates property + activities + initial filing; geocodes via Nominatim
- `GET/POST /api/properties`, `GET/PUT /api/properties/[id]`
- `POST /api/leads` — quiz lead capture (public)
- `POST /api/quiz-report` — quiz results
- `POST /api/verify-captcha`

## Features
- **Auth/onboarding:** Clerk sign-up → auto-link prior `quiz_leads` to new account → `/setup` wizard
- **Properties:** multi-property support; name, address, county, acreage, exemption type (wildlife | agriculture); auto-geocoded
- **Activities:** 7 activity types (feeders, water, shelters, census, habitat control, erosion, predator mgmt); per-type required evidence; status machine (`not_started` → `in_progress` → `evidence_uploaded` → `needs_followup` → `complete`); dated notes; due dates
- **Documents:** drag-and-drop photo/receipt/note upload, GPS + timestamp extraction from photos, Supabase Storage persistence
- **Map:** Leaflet property view with custom per-activity pin icons, hover tooltips, popups
- **Dashboard:** progress bar, deadline countdown, filing status tracker, quick actions, personalized greeting
- **Quiz (public):** multi-question eligibility quiz w/ county lookup by zip/city, inline educational cards, lead capture (email/name/phone/answers), downloadable report
- **Pricing tiers:** Free (self-serve) / Document Review $99 / Full-Service $750/activity

## Data Model (Supabase Postgres, RLS enabled)

- **properties** — `id, user_id (Clerk), name, address, county, state, acreage, exemption_type, lat, lng, timestamps`
- **activities** — `id, property_id (FK cascade), type, name, description, status, notes (JSON), due_date, completed_date, locations (JSONB), required_evidence (JSONB), timestamps`
- **documents** — `id, activity_id (FK cascade), type (photo|receipt|note), name, url, storage_path, gps_lat, gps_lng, taken_at, uploaded_at`
- **filings** — `id, property_id, year, status (draft|ready_to_file|filed|accepted|needs_followup), filed_date, method (online|mail|portal), confirmation_number` — UNIQUE(property_id, year)
- **quiz_leads** — `id, email, name, phone, answers (JSONB), survey_url, survey_path, user_id (nullable), created_at` — anyone can INSERT, only admins can read

## UI / Visual Design

**Aesthetic:** modern, minimal, earthy/rural. Generous whitespace, rounded-xl cards, subtle borders, card-based layouts over cream backgrounds. Landowner-oriented imagery and copy.

**Brand colors (custom Tailwind tokens):**
- Neutrals: `field-ink` #322B2A (text), `field-cream` #F7F5EE (bg), `field-wheat` #D8D2C9 (borders), `field-mist` #EEEFEC (card bg)
- Accents: `field-forest` #495336 (primary CTA), `field-hero` #5E7080 (dashboard), `field-terra` #B64F2F (alerts/deadlines), `field-earth` #6B5E51 (secondary text), `field-gold` #CAAC58 (progress, badges)
- Status: draft=hero slate, filed=gold, accepted=forest, followup=terra

**Type:** Inter (w/ SFPro + system-ui fallback), weights 400/500/600/700, Tailwind default scale.

**Components:** Radix headless primitives + custom components in `/components/` (ActivityCard, ActivityGrid, ActivityDetail, ActivityChecklist, PropertyMap, ActivityPins, DeadlineCountdown, FilingStatus, QuickActions, ProgressBar, Header, Sidebar, PropertySwitcher, EligibilityQuiz, QuestionCard, QuizReport, EmailCapture, CountyLookup).

**Button/input style:** forest-green primary CTAs, cream input backgrounds w/ green focus rings, `rounded-xl` cards, `rounded-lg` inputs, ring-2 focus states.

## Middleware & Auth
`middleware.ts` uses `clerkMiddleware`. Public routes: `/`, `/pricing`, `/sign-in|up`, `/signup`, `/how-it-works`, `/faq`, `/privacy`, `/terms`, `/quiz`, `/services`, `/resources`, `/request-availability`, `/about`, `/api/*`. All other routes call `auth.protect()`. Matcher excludes static assets.

**Flow:** marketing → `/signup` → Clerk email verify → `linkQuizLeadToUser()` links pre-existing quiz lead by email → `/setup` wizard → `/dashboard`.

## `lib/` utilities
- `supabase.ts` — client init, `uploadDocument()`, `deleteDocument()`
- `hooks.ts` — `useDebounce`, `useAutoSave`, `useProperties`, `useProperty`, `useActivity`, `updateActivity`, `createProperty`, `createActivity`, `createDocument`
- `types.ts` — `Property`, `Activity`, `ActivityType`, `ActivityStatus`, `EvidenceRequirement`, `Document`, `Filing`, `FilingStatus`, `PropertyWithDetails`
- `utils.ts` — `cn()`, `formatDate()`, `getStatusColor()`, `getStatusLabel()`
- `quiz-data.ts` — quiz questions, info cards, county lookup (zip/city → county), eligibility logic
- `demo-data.ts` — demo fallback data (`getProperty`, `getDeadlineDays`)
- `onboarding.ts` — `linkQuizLeadToUser()`
- `recaptcha.ts` — v3 helpers

## Key things to preserve in a rewrite / handoff
1. Supabase RLS policies (esp. `quiz_leads` INSERT-only-for-anon)
2. Clerk → Supabase `user_id` linkage (Clerk IDs stored as TEXT, not UUID)
3. Pre-signup quiz lead → post-signup account linkage via email
4. Per-activity-type evidence requirement templates
5. All 254 Texas county lookup table
6. Custom FieldFile color tokens in `tailwind.config.ts`
