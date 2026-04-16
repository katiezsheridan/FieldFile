# CLAUDE.md

Guidance for AI assistants (Claude Code and friends) working in this repo.

## What this project is

FieldFile is a Next.js app that helps Texas landowners with wildlife tax exemptions: storing documentation, logging wildlife management activities, and preparing annual reports. Positioning is **document storage, activity logging, and annual report preparation** — the landowner submits to the county. Don't introduce language that says FieldFile files on the landowner's behalf.

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
- File storage helpers (`uploadDocument`, `uploadObservationPhoto`, `uploadLandDocument`, `deleteDocument`) live in `lib/supabase.ts` — use them rather than calling `supabase.storage` directly from components.
- New schema changes: add an SQL migration to `/migrations`, apply to dev Supabase, mention in the PR's "Migrations" checklist, and apply to prod on merge.

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
