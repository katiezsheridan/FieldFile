-- Form 50-129 (1-d-1) data layer (Session 2): owner profiles + filings.
--
-- Two additions that let FieldFile ASSEMBLE a 1-d-1 application from stored data
-- (see lib/forms/form50129/buildPayload.ts). Nothing here files or signs; this
-- is storage for assembling a completed-but-unsigned PDF the owner submits.
--
--   owner_profiles     - the "ask once, reuse every year" owner/applicant block
--                        (Form Sections 1 & 2). One row per property; reused for
--                        every tax year's filing on that property. (Bucket 2.)
--   form50129_filings  - one filing per property per tax year. Holds the
--                        per-filing (Bucket-3) answers as JSONB and a pointer to
--                        the generated PDF. Mirrors the plans table's
--                        one-per-property-per-year shape.
--
-- RLS note: permissive at the DB layer, matching every other table in this app
-- (properties, plans, activities, documents, ...). Row ownership is enforced in
-- the API layer (service-role key + Clerk userId + a property.user_id match).
-- There is no Clerk->Supabase JWT bridge, so true per-user Postgres RLS is
-- intentionally not attempted here. user_id is the Clerk id stored as TEXT.

create table if not exists owner_profiles (
  id uuid default gen_random_uuid() primary key,
  property_id uuid not null references properties(id) on delete cascade,
  user_id text not null,
  -- Section 1: property owner / applicant.
  owner_type text not null default 'individual'
    check (owner_type in ('individual', 'partnership', 'corporation', 'other')),
  owner_type_other text,
  owner_name text,
  date_of_birth text,             -- individuals only; free text (the form is not strict)
  physical_address text,
  mailing_address text,
  phone text,
  email text,
  -- Section 2: authorized representative (required for non-individual owners).
  rep_basis text
    check (rep_basis in
      ('officer', 'general_partner', 'attorney', 'agent_tax_matters', 'other')),
  rep_basis_other text,
  rep_name text,
  rep_title text,
  rep_phone text,
  rep_email text,
  rep_mailing_address text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (property_id)
);

create index if not exists owner_profiles_property_id_idx on owner_profiles (property_id);
create index if not exists owner_profiles_user_id_idx on owner_profiles (user_id);

create table if not exists form50129_filings (
  id uuid default gen_random_uuid() primary key,
  property_id uuid not null references properties(id) on delete cascade,
  user_id text not null,
  tax_year integer not null,
  status text not null default 'draft'
    check (status in ('draft', 'ready', 'filed')),
  -- Bucket-3 per-filing answers: Section 4 ag-use history, the Section 3/5/6
  -- yes/no confirmations. Shape mirrors FilingAnswers in
  -- lib/forms/form50129/buildPayload.ts.
  answers jsonb not null default '{}',
  generated_pdf_path text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (property_id, tax_year)
);

create index if not exists form50129_filings_property_id_idx
  on form50129_filings (property_id);
create index if not exists form50129_filings_user_id_idx
  on form50129_filings (user_id);

alter table owner_profiles enable row level security;
alter table form50129_filings enable row level security;

-- Permissive DB policies (match existing pattern; real enforcement is in /api).
-- drop-then-create so the migration is safe to re-run.
drop policy if exists "Users can manage owner profiles" on owner_profiles;
create policy "Users can manage owner profiles"
  on owner_profiles for all using (true);
drop policy if exists "Users can manage form50129 filings" on form50129_filings;
create policy "Users can manage form50129 filings"
  on form50129_filings for all using (true);
