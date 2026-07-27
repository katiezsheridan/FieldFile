-- Leads captured from marketing landing pages (e.g. /wildlife-exemption).
-- Distinct from `signups` (the Get Started form) and `quiz_leads` (the
-- eligibility quiz). The `source` column tags which landing page / campaign
-- the lead came from.
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  county text,
  acreage numeric,
  source text not null default 'wildlife_exemption',
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

-- Public landing-page capture: anonymous clients may INSERT only. There is no
-- select/update/delete policy for anon, so the lead list cannot be read back
-- with the public anon key. (The /api/lead-capture route handler writes with
-- the service-role key, which bypasses RLS; this policy is defense-in-depth and
-- allows future direct-from-client inserts if ever needed.)
create policy "Anon can insert leads"
  on leads
  for insert
  to anon
  with check (true);
