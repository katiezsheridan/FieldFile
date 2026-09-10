-- ============================================================================
-- Annual Report domain model (PWD-888) — schema + reference data + backfill.
--
-- Implements the model documented in CLAUDE.md > "Annual Report Domain Model".
-- This migration EXTENDS `activities` and `documents`; it does not replace them.
-- No existing column is renamed or dropped, and no existing row is deleted.
--
-- Reference data seeded here (from the real forms, not from memory):
--   * 7 practices          — Tax Code 23.51(7)(A)(i)-(vii) / PWD-888 Part IV
--   * 48 sub-activities    — PWD-888-W7000 (rev 07/08), Part IV, in form order
--   * ~170 field_requirements — the detail each sub-activity asks for, with
--     minimum-intensity thresholds from TPWD's "Minimum Intensity Requirements
--     of Management Activities for the Edwards Plateau and Cross Timbers
--     Ecoregions" in help_text.
--
-- ECOREGION CAVEAT: minimum intensity is set per ecoregion. Every threshold in
-- help_text below is the Edwards Plateau / Cross Timbers standard (correct for
-- Hays County, the v1 target) and is labelled as such in the text. When a second
-- ecoregion is supported, these belong in their own
-- `intensity_standards (sub_activity_id, ecoregion, ...)` table rather than in
-- help_text. Do not let a second ecoregion's numbers overwrite these.
--
-- CONVENTIONS FOLLOWED (deliberately, for consistency with the existing schema):
--   * "enum" = `text` + a check constraint, exactly like every other constrained
--     column in this app (plans.status, field_log_entries.gps_source, ...).
--     Native Postgres ENUM types were not used: they need ALTER TYPE to extend,
--     don't drop with their table, and would be the only ones in the database.
--   * RLS is enabled with a permissive policy; ownership is enforced in the API
--     layer via the service-role key + Clerk userId + a properties.user_id join.
--     There is no Clerk->Supabase JWT bridge. Same as properties, activities,
--     documents, plans, census_*, field_log_entries. The ONE exception is
--     audit_events — see its section.
--   * Money is numeric(12,2). Timestamps are timestamptz.
--
-- Safe to re-run: every statement is if-not-exists / on-conflict guarded.
-- ============================================================================


-- ============================================================
-- 1. Reference tables: practices, sub_activities, field_requirements
-- ============================================================

-- The seven statutory practices. `code` is the stable wire identifier used by
-- report payloads, AI proposals, URL params and analytics. NEVER renumber a
-- code and never reuse a retired one.
create table if not exists practices (
  code text primary key
    check (code in ('HC', 'EC', 'PC', 'SW', 'SF', 'SH', 'CE')),
  name text not null,
  description text,
  -- Part IV section number on PWD-888 (1..7). Matches the statutory order.
  form_section_number integer not null check (form_section_number between 1 and 7),
  created_at timestamptz not null default now(),
  unique (form_section_number)
);

-- One row per PWD-888 Part IV line item.
--
-- `code` ({PRACTICE}-{NN}) is an addition to the original spec: the whole domain
-- model in CLAUDE.md is keyed on these stable codes, and the backfill below has
-- to reference sub-activities by something stable that is not a generated uuid.
-- `slug` stays as spec'd (human-readable, unique within a practice) — note that
-- e.g. grazing-management legitimately appears under both HC and SF, which is
-- why slug is unique per practice rather than globally.
create table if not exists sub_activities (
  id uuid primary key default gen_random_uuid(),
  practice_code text not null references practices(code) on delete restrict,
  code text not null unique,
  name text not null,
  slug text not null,
  -- Guidance shown above the detail fields: the TPWD minimum-intensity
  -- threshold for this activity, or a note about how the form prints it.
  -- Thresholds seeded today are the Edwards Plateau / Cross Timbers standard
  -- and say so — intensity is ecoregion-specific.
  help_text text,
  -- Position within the practice, as printed on the form.
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique (practice_code, slug),
  unique (practice_code, sort_order)
);

alter table sub_activities add column if not exists help_text text;

create index if not exists sub_activities_practice_code_idx
  on sub_activities (practice_code);

-- THE LOAD-BEARING TABLE. One row per piece of detail a sub-activity needs in
-- order to be reportable. This drives:
--   * the adaptive questionnaire (what to ask, how to render the input),
--   * gap analysis (`required_for_form` = a gap that blocks the render),
--   * which fields an AI pass is even allowed to propose (`ai_extractable`).
--
-- `field_key` is the key used inside activities.field_values. It is unique per
-- sub-activity, not globally: 'acres_burned' means the same thing under HC-02
-- and SF-02 but they are separate requirement rows.
--
-- `sort_order` is an addition to the original spec — a questionnaire with
-- non-deterministic field order is not shippable.
create table if not exists field_requirements (
  id uuid primary key default gen_random_uuid(),
  sub_activity_id uuid not null references sub_activities(id) on delete cascade,
  field_key text not null,
  label text not null,
  help_text text,
  input_type text not null check (input_type in (
    'number',        -- fractional quantity (acres, miles, percent)
    'integer',       -- whole count (feeders, boxes, animals removed)
    'text',          -- single line
    'longtext',      -- multi-line narrative
    'date',
    'date_range',    -- {"from": "...", "to": "..."} in field_values
    'choice',        -- one of `choices`
    'multi_choice',  -- array of `choices`
    'boolean'
  )),
  unit text,
  -- JSON array of strings for choice/multi_choice. The string IS the value AND
  -- the label: these are printed on the PDF verbatim, so they must match the
  -- form's own wording.
  choices jsonb,
  required_for_form boolean not null default false,
  ai_extractable boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  unique (sub_activity_id, field_key),
  -- choices only make sense for the two choice types, and are mandatory there.
  constraint field_requirements_choices_shape check (
    (input_type in ('choice', 'multi_choice')
       and choices is not null and jsonb_typeof(choices) = 'array')
    or (input_type not in ('choice', 'multi_choice') and choices is null)
  )
);

create index if not exists field_requirements_sub_activity_id_idx
  on field_requirements (sub_activity_id);
create index if not exists field_requirements_ai_extractable_idx
  on field_requirements (ai_extractable) where ai_extractable;


-- ============================================================
-- 2. report_periods — one annual report per property per tax year
-- ============================================================

create table if not exists report_periods (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  tax_year integer not null,
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'finalized', 'submitted')),
  finalized_at timestamptz,
  submitted_at timestamptz,
  -- Free text: the CAD the landowner submitted to, e.g. "Hays CAD".
  -- FieldFile never submits; this records what the landowner told us they did.
  submitted_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, tax_year)
);

create index if not exists report_periods_property_id_idx
  on report_periods (property_id);
create index if not exists report_periods_tax_year_idx
  on report_periods (tax_year);


-- ============================================================
-- 3. Extend `activities` (the container)
-- ============================================================
-- THE ACTIVITY IS THE CONTAINER. practice_code and sub_activity_id are what the
-- landowner tells us at container-creation time; evidence inherits its
-- classification from here and is never classified after the fact.
--
-- The legacy `type`, `name`, `description`, `status`, `due_date`,
-- `completed_date`, `locations`, `required_evidence`, `notes` columns are all
-- left in place and still written by existing code. `practice_code` /
-- `sub_activity_id` are the going-forward classification; `type` is backfilled
-- from and superseded by them (see section 9).
--
-- Columns are added NULLABLE on purpose: existing rows predate this model and
-- the backfill cannot classify all of them. Enforce required-ness in the API
-- for new rows; do not add NOT NULL here without a verified-clean backfill.

alter table activities
  add column if not exists practice_code text
    references practices(code) on delete restrict,
  add column if not exists sub_activity_id uuid
    references sub_activities(id) on delete restrict,
  add column if not exists report_period_id uuid
    references report_periods(id) on delete set null,
  -- When the work happened. performed_through is set only for work spanning
  -- days (a week of brush management); null means a single-day activity.
  add column if not exists performed_on date,
  add column if not exists performed_through date,
  add column if not exists location_label text,
  add column if not exists location_lat numeric,
  add column if not exists location_lng numeric,
  add column if not exists performed_by text,
  -- Answers keyed by field_requirements.field_key for this sub-activity.
  add column if not exists field_values jsonb not null default '{}'::jsonb,
  add column if not exists narrative text,
  add column if not exists narrative_source text
    check (narrative_source in ('ai_proposed', 'user_confirmed')),
  -- e.g. "Exhibits 4-9" — assigned at render time, printed on the PDF.
  add column if not exists exhibit_range text;

-- A date range must not run backwards.
alter table activities drop constraint if exists activities_performed_range_ck;
alter table activities add constraint activities_performed_range_ck
  check (performed_through is null
         or performed_on is null
         or performed_through >= performed_on);

-- The sub-activity must belong to the practice on the same row. Enforced with a
-- trigger rather than a composite FK so that the existing `activities` primary
-- key and `sub_activities.id` stay untouched.
create or replace function activities_check_sub_activity_practice()
returns trigger language plpgsql as $$
declare
  sa_practice text;
begin
  if new.sub_activity_id is null then
    return new;
  end if;
  select practice_code into sa_practice
    from sub_activities where id = new.sub_activity_id;
  if new.practice_code is null then
    -- Derive rather than reject: the sub-activity already implies the practice.
    new.practice_code := sa_practice;
  elsif new.practice_code <> sa_practice then
    raise exception
      'activity %: sub_activity % belongs to practice %, not %',
      new.id, new.sub_activity_id, sa_practice, new.practice_code;
  end if;
  return new;
end;
$$;

drop trigger if exists activities_sub_activity_practice_tg on activities;
create trigger activities_sub_activity_practice_tg
  before insert or update of practice_code, sub_activity_id on activities
  for each row execute function activities_check_sub_activity_practice();

create index if not exists activities_report_period_id_idx
  on activities (report_period_id);
create index if not exists activities_sub_activity_id_idx
  on activities (sub_activity_id);
create index if not exists activities_performed_on_idx
  on activities (performed_on);
-- The three-of-seven count is exactly this lookup: which practices have
-- containers in this period.
create index if not exists activities_report_period_practice_idx
  on activities (report_period_id, practice_code);


-- ============================================================
-- 4. Extend `documents` (the evidence)
-- ============================================================
-- NOTE ON DUPLICATION: `documents` already has gps_lat / gps_lng / taken_at,
-- actively written by the census document routes and read by the property
-- routes. The spec asks for captured_at / captured_lat / captured_lng, so both
-- now exist. The new columns are backfilled from the old ones in section 9 and
-- are the going-forward names; the old ones are kept because live code writes
-- them. Do NOT drop gps_lat/gps_lng/taken_at until those call sites are
-- migrated, and until then treat the old columns as the ones to keep in sync.

alter table documents
  -- Denormalized from the parent activity for query speed: the report reads
  -- every piece of evidence for a period without joining through activities.
  -- Kept truthful by the trigger below.
  add column if not exists report_period_id uuid
    references report_periods(id) on delete set null,
  -- Content-addressed dedupe (same photo uploaded twice from two devices).
  add column if not exists content_hash text,
  add column if not exists captured_at timestamptz,
  add column if not exists captured_lat numeric,
  add column if not exists captured_lng numeric,
  add column if not exists exif_raw jsonb,
  -- Before/during/after is what makes a photo set persuasive to an appraiser.
  add column if not exists phase text
    check (phase in ('before', 'during', 'after', 'standalone', 'unknown')),
  add column if not exists phase_source text
    check (phase_source in ('ai_proposed', 'user_confirmed')),
  add column if not exists caption text,
  add column if not exists caption_source text
    check (caption_source in ('ai_proposed', 'user_confirmed')),
  -- AI observations about the image. PROPOSAL ONLY — see CLAUDE.md
  -- "Propose, do not assert". Nothing here reaches a rendered PDF until a
  -- confirmation event exists.
  add column if not exists ai_confidence numeric
    check (ai_confidence is null or (ai_confidence >= 0 and ai_confidence <= 1)),
  add column if not exists ai_observations jsonb,
  add column if not exists ai_model_version text,
  -- e.g. {'too_dark','no_timestamp','duplicate','low_resolution'}
  add column if not exists usability_flags text[] not null default '{}',
  add column if not exists confirmed_by text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists exhibit_number text,
  -- Receipt extraction. Money is numeric(12,2), never float.
  add column if not exists vendor text,
  add column if not exists purchase_date date,
  add column if not exists subtotal numeric(12,2),
  add column if not exists tax numeric(12,2),
  add column if not exists total numeric(12,2),
  add column if not exists line_items jsonb,
  add column if not exists extraction_confidence numeric
    check (extraction_confidence is null
           or (extraction_confidence >= 0 and extraction_confidence <= 1)),
  add column if not exists extraction_raw jsonb;

-- A source column without its value is meaningless, and vice versa: an
-- ai_proposed caption that was later confirmed flips caption_source to
-- user_confirmed, it does not clear it.
alter table documents drop constraint if exists documents_caption_source_ck;
alter table documents add constraint documents_caption_source_ck
  check (caption_source is null or caption is not null);

alter table documents drop constraint if exists documents_phase_source_ck;
alter table documents add constraint documents_phase_source_ck
  check (phase_source is null or phase is not null);

-- Keep the denormalized report_period_id honest: whenever a document is
-- attached to an activity, it inherits that activity's period. Only documents
-- with no activity parent (land documents, census photos) keep an
-- independently-set period.
create or replace function documents_sync_report_period()
returns trigger language plpgsql as $$
begin
  if new.activity_id is not null then
    select a.report_period_id into new.report_period_id
      from activities a where a.id = new.activity_id;
  end if;
  return new;
end;
$$;

drop trigger if exists documents_sync_report_period_tg on documents;
create trigger documents_sync_report_period_tg
  before insert or update of activity_id, report_period_id on documents
  for each row execute function documents_sync_report_period();

-- ...and from the other direction: moving a container to a different period
-- must drag its evidence along, or the denormalized column goes stale silently.
create or replace function activities_cascade_report_period()
returns trigger language plpgsql as $$
begin
  if new.report_period_id is distinct from old.report_period_id then
    update documents
       set report_period_id = new.report_period_id
     where activity_id = new.id;
  end if;
  return null;
end;
$$;

drop trigger if exists activities_cascade_report_period_tg on activities;
create trigger activities_cascade_report_period_tg
  after update of report_period_id on activities
  for each row execute function activities_cascade_report_period();

create index if not exists documents_report_period_id_idx
  on documents (report_period_id);
create index if not exists documents_activity_id_idx
  on documents (activity_id);
create index if not exists documents_content_hash_idx
  on documents (content_hash) where content_hash is not null;
create index if not exists documents_captured_at_idx
  on documents (captured_at);


-- ============================================================
-- 5. report_questions — the adaptive questionnaire
-- ============================================================
-- One row per question actually asked of the landowner for a report period.
-- Questions are GENERATED by gap analysis, not authored by hand: a question
-- exists because something is missing.
--
-- proposed_answer / proposed_source are the "propose, do not assert" half:
-- an AI (or a heuristic, or last year's filing) may pre-fill the answer, and
-- the landowner taps to confirm. `answer` is only ever written by a human
-- action; `answered_at` + `answered_by` ARE the recorded confirmation event.
-- A row with proposed_answer set and answer null has been proposed and NOT
-- confirmed — it must not reach a rendered form.
create table if not exists report_questions (
  id uuid primary key default gen_random_uuid(),
  report_period_id uuid not null references report_periods(id) on delete cascade,
  -- Which container the question is about. Null = a period-level question
  -- (Part I owner info, Part III association membership).
  activity_id uuid references activities(id) on delete cascade,
  -- Which field_requirements.field_key this answers, when it maps to one.
  field_key text,
  question_text text not null,
  input_type text not null check (input_type in (
    'number', 'integer', 'text', 'longtext', 'date', 'date_range',
    'choice', 'multi_choice', 'boolean'
  )),
  unit text,
  choices jsonb,
  -- blocking     = the report cannot render without it
  -- compliance   = it renders, but the answer risks the three-of-seven rule
  -- strengthening = optional, makes the evidence more persuasive
  priority text not null default 'strengthening'
    check (priority in ('blocking', 'compliance', 'strengthening')),
  proposed_answer jsonb,
  proposed_source text,
  answer jsonb,
  answered_at timestamptz,
  answered_by text,
  skipped boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- An answer is a confirmation event: it must carry who and when.
  constraint report_questions_answer_attribution_ck check (
    answer is null or (answered_at is not null and answered_by is not null)
  ),
  -- Answered and skipped are mutually exclusive.
  constraint report_questions_skip_ck check (not (skipped and answer is not null))
);

create index if not exists report_questions_report_period_id_idx
  on report_questions (report_period_id);
create index if not exists report_questions_activity_id_idx
  on report_questions (activity_id);
-- The questionnaire's main read: unanswered questions worst-first.
create index if not exists report_questions_open_idx
  on report_questions (report_period_id, priority)
  where answer is null and not skipped;


-- ============================================================
-- 6. receipt_allocations — splitting one receipt across practices
-- ============================================================
-- A $900 feed-store receipt might be $600 supplemental food and $300 shelter.
-- The allocation is per practice, not per sub-activity: appraisers think in
-- practices, and a landowner should not have to split a receipt 6 ways.
create table if not exists receipt_allocations (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  practice_code text not null references practices(code) on delete restrict,
  amount numeric(12,2) not null check (amount >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_id, practice_code)
);

create index if not exists receipt_allocations_document_id_idx
  on receipt_allocations (document_id);
create index if not exists receipt_allocations_practice_code_idx
  on receipt_allocations (practice_code);

-- "Allocations per document sum to no more than the document total."
-- This cannot be a row-level CHECK (it aggregates across rows), so it is a
-- deferrable constraint trigger: a multi-row rewrite inside a transaction is
-- validated once at commit, not after each statement.
--
-- When documents.total is null the receipt has not been extracted yet and there
-- is nothing to validate against — allocations are allowed and will be
-- re-validated when a total is set (see the documents-side trigger below).
create or replace function receipt_allocations_check_total()
returns trigger language plpgsql as $$
declare
  doc_id uuid := coalesce(new.document_id, old.document_id);
  doc_total numeric(12,2);
  allocated numeric(12,2);
begin
  select d.total into doc_total from documents d where d.id = doc_id;
  if doc_total is null then
    return null;
  end if;
  select coalesce(sum(ra.amount), 0) into allocated
    from receipt_allocations ra where ra.document_id = doc_id;
  if allocated > doc_total then
    raise exception
      'receipt allocations for document % total %, which exceeds the document total of %',
      doc_id, allocated, doc_total;
  end if;
  return null;
end;
$$;

drop trigger if exists receipt_allocations_total_tg on receipt_allocations;
create constraint trigger receipt_allocations_total_tg
  after insert or update or delete on receipt_allocations
  deferrable initially deferred
  for each row execute function receipt_allocations_check_total();

-- The same invariant can be broken from the other side, by lowering a
-- document's total below what is already allocated.
create or replace function documents_check_allocation_total()
returns trigger language plpgsql as $$
declare
  allocated numeric(12,2);
begin
  -- `update of total` fires whenever the column is assigned, even to the same
  -- value; skip the aggregate when nothing actually moved.
  if new.total is null or new.total is not distinct from old.total then
    return null;
  end if;
  select coalesce(sum(ra.amount), 0) into allocated
    from receipt_allocations ra where ra.document_id = new.id;
  if allocated > new.total then
    raise exception
      'document % is allocated % across practices, which exceeds the new total of %',
      new.id, allocated, new.total;
  end if;
  return null;
end;
$$;

drop trigger if exists documents_allocation_total_tg on documents;
create constraint trigger documents_allocation_total_tg
  after update of total on documents
  deferrable initially deferred
  for each row execute function documents_check_allocation_total();


-- ============================================================
-- 7. audit_events — append-only
-- ============================================================
-- The audit trail IS the product: if a CAD asks how a value reached the form,
-- the answer must be "the owner confirmed it on this date". Every confirmation
-- event, status transition, AI proposal and render belongs here.
create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  report_period_id uuid not null references report_periods(id) on delete cascade,
  -- Loose reference on purpose: audit rows must outlive schema churn and must
  -- not be deleted by a cascade from the thing they describe.
  entity_type text not null,
  entity_id uuid,
  event_type text not null,
  -- Clerk user id, or a system identifier like 'system:gap-analysis'.
  actor text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_report_period_id_idx
  on audit_events (report_period_id);
create index if not exists audit_events_entity_idx
  on audit_events (entity_type, entity_id);
create index if not exists audit_events_created_at_idx
  on audit_events (created_at);

-- APPEND-ONLY, enforced two ways.
--
-- (1) RLS grants insert and select only — no update or delete policy exists, so
--     those are denied for anon/authenticated roles (see section 8).
-- (2) A trigger, because RLS alone is NOT enough here: this app talks to
--     Supabase with the SERVICE-ROLE key in API routes, and the service role
--     BYPASSES RLS entirely. Without the trigger, "append-only" would be a
--     property of clients we don't use. The trigger binds every role.
create or replace function audit_events_reject_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'audit_events is append-only: % is not permitted', tg_op;
end;
$$;

drop trigger if exists audit_events_no_update_tg on audit_events;
create trigger audit_events_no_update_tg
  before update or delete on audit_events
  for each row execute function audit_events_reject_mutation();


-- ============================================================
-- 8. Row Level Security
-- ============================================================
-- Matches the existing pattern exactly: RLS on, a permissive DB policy, and
-- real ownership enforcement in the API layer (service-role client + Clerk
-- userId + a properties.user_id join). None of these tables carries user_id,
-- for the same reason activities and documents don't: they authorize through
-- their property.

alter table practices          enable row level security;
alter table sub_activities     enable row level security;
alter table field_requirements enable row level security;
alter table report_periods     enable row level security;
alter table report_questions   enable row level security;
alter table receipt_allocations enable row level security;
alter table audit_events       enable row level security;

-- Reference data: readable by anyone, written only by migrations (service role
-- bypasses RLS, so no write policy is needed for seeding).
drop policy if exists "Anyone can read practices" on practices;
create policy "Anyone can read practices" on practices for select using (true);

drop policy if exists "Anyone can read sub activities" on sub_activities;
create policy "Anyone can read sub activities" on sub_activities for select using (true);

drop policy if exists "Anyone can read field requirements" on field_requirements;
create policy "Anyone can read field requirements" on field_requirements for select using (true);

-- Owner data: permissive at the DB layer, enforced in /api.
drop policy if exists "Users can manage report periods" on report_periods;
create policy "Users can manage report periods" on report_periods for all using (true);

drop policy if exists "Users can manage report questions" on report_questions;
create policy "Users can manage report questions" on report_questions for all using (true);

drop policy if exists "Users can manage receipt allocations" on receipt_allocations;
create policy "Users can manage receipt allocations" on receipt_allocations for all using (true);

-- audit_events: INSERT and SELECT only. Deliberately no update/delete policy.
drop policy if exists "Users can read audit events" on audit_events;
create policy "Users can read audit events" on audit_events for select using (true);

drop policy if exists "Users can append audit events" on audit_events;
create policy "Users can append audit events" on audit_events for insert with check (true);

revoke update, delete on audit_events from anon, authenticated;


-- ============================================================
-- 9. Reference data
-- ============================================================

-- >>> GENERATED FROM lib/sub-activities.ts — DO NOT EDIT BY HAND

insert into practices (code, name, description, form_section_number) values
  ('HC', 'Habitat Control', 'Grazing, burning, brush and range work that shapes habitat. Tax Code 23.51(7)(A)(i).', 1),
  ('EC', 'Erosion Control', 'Ponds, gullies, streambanks, levees and water diversions. Tax Code 23.51(7)(A)(ii).', 2),
  ('PC', 'Predator Control', 'Fire ants, nest parasites and mammalian predators. Tax Code 23.51(7)(A)(iii).', 3),
  ('SW', 'Providing Supplemental Water', 'Wetlands, wells, troughs, guzzlers and springs. Tax Code 23.51(7)(A)(iv).', 4),
  ('SF', 'Providing Supplemental Food', 'Food plots, feeders, minerals and pasture management. Tax Code 23.51(7)(A)(v).', 5),
  ('SH', 'Providing Supplemental Shelter', 'Nest boxes, brush piles, fence lines, snags and woody cover. Tax Code 23.51(7)(A)(vi).', 6),
  ('CE', 'Census', 'Counts and records that document your wildlife population. Tax Code 23.51(7)(A)(vii).', 7)
on conflict (code) do update set
      name = excluded.name,
      description = excluded.description,
      form_section_number = excluded.form_section_number;

insert into sub_activities (practice_code, code, name, slug, help_text, sort_order) values
  ('HC', 'HC-01', 'Grazing management', 'grazing-management', 'Edwards Plateau / Cross Timbers minimum intensity: deferment and/or rotational grazing.', 1),
  ('HC', 'HC-02', 'Prescribed burning', 'prescribed-burning', 'Edwards Plateau / Cross Timbers minimum intensity: at least 15% of the acreage burned over 7 years.', 2),
  ('HC', 'HC-03', 'Range enhancement (range reseeding)', 'range-enhancement', 'Edwards Plateau / Cross Timbers minimum intensity: 10% of the designated area or 10 acres annually, whichever is smaller, until the project is complete.', 3),
  ('HC', 'HC-04', 'Brush management', 'brush-management', 'Edwards Plateau / Cross Timbers minimum intensity: 10% of the designated area or 10 acres annually, whichever is smaller.', 4),
  ('HC', 'HC-05', 'Fence modification', 'fence-modification', 'Not part of the Edwards Plateau / Cross Timbers intensity standard — pronghorn and bighorn are Trans-Pecos and Panhandle species. Confirm this practice applies in your ecoregion before relying on it.', 5),
  ('HC', 'HC-06', 'Riparian management and enhancement', 'riparian-management', 'Edwards Plateau / Cross Timbers minimum intensity: fence, defer grazing or establish vegetation — 1 project every 10 years.', 6),
  ('HC', 'HC-07', 'Wetland enhancement', 'wetland-enhancement', 'Edwards Plateau / Cross Timbers minimum intensity: annual moist-soil management, or 1 new project per 10 years.', 7),
  ('HC', 'HC-08', 'Habitat protection for species of concern', 'habitat-protection', 'Edwards Plateau / Cross Timbers minimum intensity: maintain, restore or protect suitable habitat and reduce negative impacts — 1 new project every 10 years.', 8),
  ('HC', 'HC-09', 'Prescribed control of native, exotic and feral species', 'prescribed-control', 'Edwards Plateau / Cross Timbers minimum intensity: invasive plant control on 10% of the designated area or 10 acres, whichever is smaller.', 9),
  ('HC', 'HC-10', 'Wildlife restoration', 'wildlife-restoration', 'Edwards Plateau / Cross Timbers standard: native species reintroduction and management must be coordinated with TPWD to qualify.', 10),
  ('EC', 'EC-01', 'Pond construction and repair', 'pond-construction', 'Edwards Plateau / Cross Timbers minimum intensity: approved NRCS erosion control — 1 new project every 10 years.', 1),
  ('EC', 'EC-02', 'Gully shaping', 'gully-shaping', 'Edwards Plateau / Cross Timbers minimum intensity: grading and planting erodible areas — 1 new project every 10 years.', 2),
  ('EC', 'EC-03', 'Streamside, pond, and wetland revegetation', 'streamside-revegetation', 'Edwards Plateau / Cross Timbers minimum intensity: 1 new project every 10 years.', 3),
  ('EC', 'EC-04', 'Herbaceous and/or woody plant establishment on critical areas (erodible)', 'critical-area-planting', 'Edwards Plateau / Cross Timbers minimum intensity: a windbreak/shelterbelt of at least 4 rows in 120 ft width by 1/4 mile length, a field border over 30 yards wide, no-till, or CRP management.', 4),
  ('EC', 'EC-05', 'Dike/levee construction and management', 'dike-levee', 'Edwards Plateau / Cross Timbers minimum intensity: 1 new project completed and maintained every 10 years.', 5),
  ('EC', 'EC-06', 'Establish water diversion', 'water-diversion', 'Edwards Plateau / Cross Timbers minimum intensity: a diversion protecting erodible areas and recharging wetlands — 1 new project completed and maintained every 10 years.', 6),
  ('PC', 'PC-01', 'Imported red fire ant control', 'fire-ant-control', 'Edwards Plateau / Cross Timbers minimum intensity: treat 10 acres or 10% of the infested area. Verify the product is labeled for pasture use before applying.', 1),
  ('PC', 'PC-02', 'Control of cowbirds', 'cowbird-control', 'Edwards Plateau / Cross Timbers minimum intensity: remove 30 cowbirds annually.', 2),
  ('PC', 'PC-03', 'Grackle/starling/house sparrow control', 'grackle-starling-sparrow-control', null::text, 3),
  ('PC', 'PC-04', 'Mammal and other predator control', 'predator-control', null::text, 4),
  ('SW', 'SW-01', 'Marsh/wetland restoration or development', 'marsh-wetland-restoration', null::text, 1),
  ('SW', 'SW-02', 'Well/trough/windmill overflow/other wildlife watering facilities', 'watering-facilities', 'Edwards Plateau / Cross Timbers minimum intensity: one water source per 300 acres, dependable year-round and wildlife-accessible.', 2),
  ('SW', 'SW-03', 'Spring development and/or enhancement', 'spring-development', null::text, 3),
  ('SF', 'SF-01', 'Grazing management', 'grazing-management', 'The form prints this as a checkbox only. Its detail lives under Habitat Control > Grazing management.', 1),
  ('SF', 'SF-02', 'Prescribed burning', 'prescribed-burning', 'The form prints this as a checkbox only. Its detail lives under Habitat Control > Prescribed burning.', 2),
  ('SF', 'SF-03', 'Range enhancement', 'range-enhancement', 'The form prints this as a checkbox only. Its detail lives under Habitat Control > Range enhancement.', 3),
  ('SF', 'SF-04', 'Food plots', 'food-plots', 'Edwards Plateau / Cross Timbers minimum intensity: food plots on at least 1% of the habitat, in units of 1/2 acre or larger.', 4),
  ('SF', 'SF-05', 'Feeders and mineral supplementation', 'feeders-and-minerals', 'Edwards Plateau / Cross Timbers minimum intensity: one feeder per 320 acres, kept full year-round.', 5),
  ('SF', 'SF-06', 'Managing tame pasture, old fields and croplands', 'tame-pasture-management', null::text, 6),
  ('SF', 'SF-07', 'Transition management of tame grass monocultures', 'tame-grass-transition', null::text, 7),
  ('SH', 'SH-01', 'Nest boxes, bat boxes and raptor poles', 'nest-boxes', 'Edwards Plateau / Cross Timbers minimum intensity: one box per 20 acres, maintained annually.', 1),
  ('SH', 'SH-02', 'Brush piles and slash retention', 'brush-piles', null::text, 2),
  ('SH', 'SH-03', 'Fence line management', 'fence-line-management', null::text, 3),
  ('SH', 'SH-04', 'Hay meadow, pasture and cropland management for wildlife', 'hay-meadow-management', null::text, 4),
  ('SH', 'SH-05', 'Half-cutting trees or shrubs', 'half-cutting', null::text, 5),
  ('SH', 'SH-06', 'Woody plant/shrub establishment', 'woody-plant-establishment', null::text, 6),
  ('SH', 'SH-07', 'Natural cavity/snag development', 'snag-development', null::text, 7),
  ('CE', 'CE-01', 'Spotlight counts', 'spotlight-counts', 'The form requires three dates.', 1),
  ('CE', 'CE-02', 'Standardized incidental observations', 'incidental-observations', null::text, 2),
  ('CE', 'CE-03', 'Stand counts of deer', 'stand-counts', 'The form requires five one-hour counts per stand.', 3),
  ('CE', 'CE-04', 'Aerial counts', 'aerial-counts', null::text, 4),
  ('CE', 'CE-05', 'Track counts', 'track-counts', null::text, 5),
  ('CE', 'CE-06', 'Daylight deer herd/wildlife composition counts', 'daylight-composition-counts', null::text, 6),
  ('CE', 'CE-07', 'Harvest data collection/record keeping', 'harvest-records', null::text, 7),
  ('CE', 'CE-08', 'Browse utilization surveys', 'browse-utilization', 'The form prints this as a checkbox only, and requires thirty 12-foot circular plots.', 8),
  ('CE', 'CE-09', 'Census of endangered, threatened, or protected wildlife', 'endangered-species-census', null::text, 9),
  ('CE', 'CE-10', 'Census and monitoring of nongame wildlife species', 'nongame-census', null::text, 10),
  ('CE', 'CE-11', 'Miscellaneous counts', 'miscellaneous-counts', null::text, 11)
on conflict (code) do update set
      practice_code = excluded.practice_code,
      name = excluded.name,
      slug = excluded.slug,
      help_text = excluded.help_text,
      sort_order = excluded.sort_order;

insert into field_requirements
  (sub_activity_id, field_key, label, help_text, input_type, unit, choices,
   required_for_form, ai_extractable, sort_order)
select sa.id, v.field_key, v.label, v.help_text, v.input_type, v.unit,
       v.choices::jsonb, v.required_for_form::boolean, v.ai_extractable::boolean,
       v.sort_order::integer
from (values
  -- ===== HC-01 Grazing management =====
  ('HC-01', 'grazing_system', 'Grazing system used', 'On the form: "Check grazing system being utilized"', 'choice', null::text, '["1 herd/3 pasture","1 herd/4 pasture","1 herd/multiple pasture","High intensity/low frequency (HILF)","Short duration system","Other type of grazing system"]', 'true', 'false', '10'),
  ('HC-01', 'grazing_system_other', 'Other grazing system (describe)', null::text, 'text', null::text, null, 'false', 'false', '20'),
  -- ===== HC-02 Prescribed burning =====
  ('HC-02', 'acres_burned', 'Acres burned', null::text, 'number', 'acres', null, 'true', 'false', '10'),
  ('HC-02', 'burn_date', 'Date burned', null::text, 'date', null::text, null, 'true', 'false', '20'),
  -- ===== HC-03 Range enhancement (range reseeding) =====
  ('HC-03', 'acres_seeded', 'Acres seeded', null::text, 'number', 'acres', null, 'true', 'false', '10'),
  ('HC-03', 'seeding_date', 'Date seeded', null::text, 'date', null::text, null, 'true', 'false', '20'),
  ('HC-03', 'seeding_method', 'Seeding method', null::text, 'choice', null::text, '["Broadcast","Drilled","Native hay"]', 'true', 'false', '30'),
  ('HC-03', 'seed_mixture', 'Seeding mixture used', null::text, 'text', null::text, null, 'false', 'false', '40'),
  ('HC-03', 'fertilized', 'Fertilized', null::text, 'boolean', null::text, null, 'false', 'false', '50'),
  ('HC-03', 'weed_control', 'Weed control needed for establishment', null::text, 'boolean', null::text, null, 'false', 'false', '60'),
  -- ===== HC-04 Brush management =====
  ('HC-04', 'acres_treated', 'Acres treated', null::text, 'number', 'acres', null, 'true', 'false', '10'),
  ('HC-04', 'mechanical_method', 'Mechanical method', null::text, 'multi_choice', null::text, '["Grubber","Chain","Roller chopper/aerator","Rhome disc","Brush hog (shredder)","Dozer","Hand-cutting (chainsaw)","Hydraulic shears","Other"]', 'false', 'false', '20'),
  ('HC-04', 'mechanical_method_other', 'Other mechanical method (describe)', null::text, 'text', null::text, null, 'false', 'false', '30'),
  ('HC-04', 'chemical_kind', 'Chemical: kind', null::text, 'text', null::text, null, 'false', 'false', '40'),
  ('HC-04', 'chemical_rate', 'Chemical: rate', null::text, 'text', null::text, null, 'false', 'false', '50'),
  ('HC-04', 'design', 'Brush management design', null::text, 'choice', null::text, '["Block","Mosaic","Strips"]', 'false', 'false', '60'),
  ('HC-04', 'strip_width', 'Strip width', null::text, 'number', 'feet', null, 'false', 'false', '70'),
  ('HC-04', 'strip_length', 'Strip length', null::text, 'number', 'feet', null, 'false', 'false', '80'),
  -- ===== HC-05 Fence modification =====
  ('HC-05', 'target_species', 'Target species', null::text, 'multi_choice', null::text, '["Pronghorn antelope","Bighorn sheep"]', 'true', 'false', '10'),
  ('HC-05', 'technique', 'Technique', null::text, 'choice', null::text, '["Fold up bottom of net-wire","Replace sections of net-wire with barbed wire","Replace entire net-wire fence with barbed wire"]', 'true', 'false', '20'),
  ('HC-05', 'gap_width', 'Gap width', null::text, 'number', 'inches', null, 'false', 'false', '30'),
  ('HC-05', 'miles_modified', 'Miles of fencing modified', 'On the form: "Miles of fencing that will be modified"', 'number', 'miles', null, 'false', 'false', '40'),
  ('HC-05', 'miles_replaced', 'Miles replaced', null::text, 'number', 'miles', null, 'false', 'false', '50'),
  -- ===== HC-06 Riparian management and enhancement =====
  ('HC-06', 'fencing', 'Fencing of riparian area', null::text, 'choice', null::text, '["Complete fencing","Partial fencing"]', 'false', 'false', '10'),
  ('HC-06', 'deferment', 'Deferment from livestock grazing', null::text, 'choice', null::text, '["Complete deferment","Partial deferment"]', 'false', 'false', '20'),
  ('HC-06', 'season_deferred', 'Season deferred', null::text, 'text', null::text, null, 'false', 'false', '30'),
  ('HC-06', 'vegetation_trees', 'Vegetation established — trees (list species)', null::text, 'text', null::text, null, 'false', 'false', '40'),
  ('HC-06', 'vegetation_shrubs', 'Vegetation established — shrubs (list species)', null::text, 'text', null::text, null, 'false', 'false', '50'),
  ('HC-06', 'vegetation_herbaceous', 'Vegetation established — herbaceous species (list)', null::text, 'text', null::text, null, 'false', 'false', '60'),
  -- ===== HC-07 Wetland enhancement =====
  ('HC-07', 'enhancement', 'Enhancement performed', null::text, 'multi_choice', null::text, '["Provide seasonal water","Provide permanent water","Moist soil management","Other"]', 'true', 'false', '10'),
  ('HC-07', 'enhancement_other', 'Other enhancement (describe)', null::text, 'text', null::text, null, 'false', 'false', '20'),
  -- ===== HC-08 Habitat protection for species of concern =====
  ('HC-08', 'techniques', 'Protection techniques used', null::text, 'multi_choice', null::text, '["Fencing","Firebreaks","Prescribed burning","Control of nest parasites","Habitat manipulation (thinning, etc.)","Native/exotic ungulate control","Other"]', 'true', 'false', '10'),
  ('HC-08', 'techniques_other', 'Other technique (describe)', null::text, 'text', null::text, null, 'false', 'false', '20'),
  -- ===== HC-09 Prescribed control of native, exotic and feral species =====
  ('HC-09', 'control_target', 'What was controlled', null::text, 'multi_choice', null::text, '["Prescribed control of vegetation","Prescribed control of animal species"]', 'true', 'false', '10'),
  ('HC-09', 'species_controlled', 'Species being controlled', null::text, 'text', null::text, null, 'true', 'false', '20'),
  ('HC-09', 'control_method', 'Method of control', null::text, 'text', null::text, null, 'true', 'false', '30'),
  -- ===== HC-10 Wildlife restoration =====
  ('HC-10', 'restoration_type', 'Type of restoration', null::text, 'multi_choice', null::text, '["Habitat restoration","Wildlife restoration"]', 'true', 'false', '10'),
  ('HC-10', 'target_species', 'Target species', null::text, 'text', null::text, null, 'true', 'false', '20'),
  ('HC-10', 'restoration_method', 'Method of restoration', null::text, 'text', null::text, null, 'false', 'false', '30'),
  -- ===== EC-01 Pond construction and repair =====
  ('EC-01', 'surface_area', 'Surface area', null::text, 'number', 'acres', null, 'false', 'false', '10'),
  ('EC-01', 'cubic_yards', 'Cubic yards of soil displaced', 'On the form: "Number of cubic yards of soil displaced"', 'integer', 'cubic yards', null, 'false', 'false', '20'),
  ('EC-01', 'dam_length', 'Length of dam', null::text, 'number', 'feet', null, 'false', 'false', '30'),
  ('EC-01', 'construction_date', 'Date of construction', 'On the form: "Planned date of construction"', 'date', null::text, null, 'true', 'false', '40'),
  -- ===== EC-02 Gully shaping =====
  ('EC-02', 'total_acres', 'Total acres to be treated', null::text, 'number', 'acres', null, 'false', 'false', '10'),
  ('EC-02', 'acres_treated_annually', 'Acres treated annually', null::text, 'number', 'acres', null, 'true', 'false', '20'),
  ('EC-02', 'seed_mix', 'Seeding mix used for reestablishment of vegetation', null::text, 'text', null::text, null, 'false', 'false', '30'),
  ('EC-02', 'construction_date', 'Date of construction', 'On the form: "Planned date of construction"', 'date', null::text, null, 'true', 'false', '40'),
  -- ===== EC-03 Streamside, pond, and wetland revegetation =====
  ('EC-03', 'techniques', 'Techniques used', null::text, 'multi_choice', null::text, '["Native hay bales","Fencing","Filter strips","Seeding upland buffer","Rip-rap, etc.","Stream crossings","Other"]', 'true', 'false', '10'),
  ('EC-03', 'techniques_other', 'Other technique (describe)', null::text, 'text', null::text, null, 'false', 'false', '20'),
  ('EC-03', 'construction_date', 'Date of construction', 'On the form: "Planned date of construction"', 'date', null::text, null, 'true', 'false', '30'),
  -- ===== EC-04 Herbaceous and/or woody plant establishment on critical areas (erodible) =====
  ('EC-04', 'practices', 'Practices used', null::text, 'multi_choice', null::text, '["Establish windbreak","Establish shrub mottes","Improve plant diversity","Improve wildlife habitat","Conservation/no-till practices","Manage CRP cover"]', 'true', 'false', '10'),
  -- ===== EC-05 Dike/levee construction and management =====
  ('EC-05', 'activities', 'Work performed', null::text, 'multi_choice', null::text, '["Reshaping/repairing erosion damage","Revegetating/stabilize levee areas","Install water control structure","Fencing"]', 'true', 'false', '10'),
  -- ===== EC-06 Establish water diversion =====
  ('EC-06', 'diversion_type', 'Type', null::text, 'choice', null::text, '["Channel","Ridge"]', 'true', 'false', '10'),
  ('EC-06', 'slope', 'Slope', null::text, 'choice', null::text, '["Level","Graded"]', 'false', 'false', '20'),
  ('EC-06', 'length', 'Length', null::text, 'number', 'feet', null, 'false', 'false', '30'),
  ('EC-06', 'vegetated', 'Vegetated', null::text, 'boolean', null::text, null, 'false', 'false', '40'),
  ('EC-06', 'vegetation_native', 'If vegetated — native', null::text, 'text', null::text, null, 'false', 'false', '50'),
  ('EC-06', 'vegetation_crop', 'If vegetated — crop', null::text, 'text', null::text, null, 'false', 'false', '60'),
  -- ===== PC-01 Imported red fire ant control =====
  ('PC-01', 'methods', 'Method of control', null::text, 'multi_choice', null::text, '["Trapping","Shooting","Scare tactics"]', 'false', 'false', '10'),
  ('PC-01', 'scare_tactics_detail', 'Scare tactics (describe)', null::text, 'text', null::text, null, 'false', 'false', '20'),
  -- ===== PC-02 Control of cowbirds =====
  ('PC-02', 'methods', 'Method of control', null::text, 'multi_choice', null::text, '["Trapping","Shooting","Scare tactics"]', 'true', 'false', '10'),
  ('PC-02', 'scare_tactics_detail', 'Scare tactics (describe)', null::text, 'text', null::text, null, 'false', 'false', '20'),
  -- ===== PC-03 Grackle/starling/house sparrow control =====
  ('PC-03', 'methods', 'Method of control', null::text, 'multi_choice', null::text, '["Trapping","Shooting","Scare tactics"]', 'true', 'false', '10'),
  ('PC-03', 'scare_tactics_detail', 'Scare tactics (describe)', null::text, 'text', null::text, null, 'false', 'false', '20'),
  -- ===== PC-04 Mammal and other predator control =====
  ('PC-04', 'species', 'Species controlled', null::text, 'multi_choice', null::text, '["Coyotes","Feral hogs","Raccoon","Skunk","Bobcat","Mountain lion","Rat snakes","Feral cats/dogs"]', 'true', 'false', '10'),
  ('PC-04', 'methods', 'Method of control', null::text, 'multi_choice', null::text, '["Trapping","Shooting","M-44 (licensed applicators)","Poison collars (1080 certified, licensed applicator)","Other"]', 'true', 'false', '20'),
  ('PC-04', 'methods_other', 'Other method (describe)', null::text, 'text', null::text, null, 'false', 'false', '30'),
  -- ===== SW-01 Marsh/wetland restoration or development =====
  ('SW-01', 'types', 'Type of project', null::text, 'multi_choice', null::text, '["Greentree reservoirs","Shallow roost pond development","Seasonally flooded crops","Artificially created wetlands","Marsh restoration/development/protection","Prairie pothole restoration/development/protection","Moist soil management units"]', 'true', 'false', '10'),
  ('SW-01', 'construction_date', 'Date of construction', 'On the form: "Planned date of construction"', 'date', null::text, null, 'true', 'false', '20'),
  -- ===== SW-02 Well/trough/windmill overflow/other wildlife watering facilities =====
  ('SW-02', 'work', 'Work performed', null::text, 'multi_choice', null::text, '["Drill new well","Windmill","Pump","Pipeline","Modification(s) of existing water source","Fencing","Overflow","Trough modification"]', 'true', 'false', '10'),
  ('SW-02', 'well_depth', 'New well — depth', null::text, 'number', 'feet', null, 'false', 'false', '20'),
  ('SW-02', 'well_gpm', 'New well — gallons per minute', null::text, 'number', 'gpm', null, 'false', 'false', '30'),
  ('SW-02', 'pipeline_size', 'Pipeline — size', null::text, 'text', null::text, null, 'false', 'false', '40'),
  ('SW-02', 'pipeline_length', 'Pipeline — length', null::text, 'number', 'feet', null, 'false', 'false', '50'),
  ('SW-02', 'distance_between_sources', 'Distance between water sources (waterers)', null::text, 'text', null::text, null, 'false', 'false', '60'),
  ('SW-02', 'facility_pvc_pipe', 'PVC pipe facility — number', null::text, 'integer', null::text, null, 'false', 'false', '70'),
  ('SW-02', 'facility_drum', 'Drum with faucet or float — number', null::text, 'integer', null::text, null, 'false', 'false', '80'),
  ('SW-02', 'facility_small_game_guzzler', 'Small game guzzler — number', null::text, 'integer', null::text, null, 'false', 'false', '90'),
  ('SW-02', 'facility_dripper', 'Windmill supply pipe dripper — number', null::text, 'integer', null::text, null, 'false', 'false', '100'),
  ('SW-02', 'facility_plastic_container', 'Plastic container — number', null::text, 'integer', null::text, null, 'false', 'false', '110'),
  ('SW-02', 'facility_in_ground_bowl', 'In-ground bowl trough — number', null::text, 'integer', null::text, null, 'false', 'false', '120'),
  ('SW-02', 'facility_big_game_guzzler', 'Big game guzzler — number', null::text, 'integer', null::text, null, 'false', 'false', '130'),
  ('SW-02', 'facility_inverted_umbrella_guzzler', 'Inverted umbrella guzzler — number', null::text, 'integer', null::text, null, 'false', 'false', '140'),
  ('SW-02', 'facility_flying_saucer_guzzler', 'Flying saucer guzzler — number', null::text, 'integer', null::text, null, 'false', 'false', '150'),
  ('SW-02', 'facility_ranch_specialties_guzzler', 'Ranch Specialties guzzler — number', null::text, 'integer', null::text, null, 'false', 'false', '160'),
  ('SW-02', 'facility_other', 'Other facility type', null::text, 'text', null::text, null, 'false', 'false', '170'),
  -- ===== SW-03 Spring development and/or enhancement =====
  ('SW-03', 'work', 'Work performed', null::text, 'multi_choice', null::text, '["Fencing","Water diversion/pipeline","Brush removal","Spring clean out","Other"]', 'true', 'false', '10'),
  ('SW-03', 'work_other', 'Other work (describe)', null::text, 'text', null::text, null, 'false', 'false', '20'),
  -- ===== SF-04 Food plots =====
  ('SF-04', 'size', 'Size', null::text, 'number', 'acres', null, 'true', 'false', '10'),
  ('SF-04', 'fenced', 'Fenced', null::text, 'boolean', null::text, null, 'false', 'false', '20'),
  ('SF-04', 'irrigated', 'Irrigated', null::text, 'boolean', null::text, null, 'false', 'false', '30'),
  ('SF-04', 'cool_season_annual_crops', 'Plantings — cool season annual crops', null::text, 'text', null::text, null, 'false', 'false', '40'),
  ('SF-04', 'warm_season_annual_crops', 'Plantings — warm season annual crops', null::text, 'text', null::text, null, 'false', 'false', '50'),
  ('SF-04', 'annual_native_mix', 'Plantings — annual mix of native plants', null::text, 'text', null::text, null, 'false', 'false', '60'),
  ('SF-04', 'perennial_native_mix', 'Plantings — perennial mix of native plants', null::text, 'text', null::text, null, 'false', 'false', '70'),
  -- ===== SF-05 Feeders and mineral supplementation =====
  ('SF-05', 'purpose', 'Purpose', null::text, 'multi_choice', null::text, '["Supplementation","Harvesting of wildlife"]', 'true', 'false', '10'),
  ('SF-05', 'target_species', 'Targeted wildlife species', null::text, 'text', null::text, null, 'false', 'false', '20'),
  ('SF-05', 'feed_type', 'Feed type', null::text, 'text', null::text, null, 'false', 'false', '30'),
  ('SF-05', 'mineral_type', 'Mineral type', null::text, 'text', null::text, null, 'false', 'false', '40'),
  ('SF-05', 'feeder_type', 'Feeder type', null::text, 'text', null::text, null, 'false', 'false', '50'),
  ('SF-05', 'feeder_count', 'Number of feeders', null::text, 'integer', null::text, null, 'false', 'false', '60'),
  ('SF-05', 'mineral_dispensing_method', 'Method of mineral dispensing', null::text, 'text', null::text, null, 'false', 'false', '70'),
  ('SF-05', 'mineral_location_count', 'Number of mineral locations', null::text, 'integer', null::text, null, 'false', 'false', '80'),
  ('SF-05', 'year_round', 'Year round', null::text, 'boolean', null::text, null, 'false', 'false', '90'),
  ('SF-05', 'year_round_when', 'If not year round, state when', null::text, 'text', null::text, null, 'false', 'false', '100'),
  -- ===== SF-06 Managing tame pasture, old fields and croplands =====
  ('SF-06', 'practices', 'Practices used', null::text, 'multi_choice', null::text, '["Overseeding cool and/or warm season legumes and/or small grains","Periodic disturbance (discing)","Conservation/no-till"]', 'true', 'false', '10'),
  -- ===== SF-07 Transition management of tame grass monocultures =====
  ('SF-07', 'overseeded_25_percent', 'Overseeded 25% of tame grass pastures with locally adapted legumes', null::text, 'boolean', null::text, null, 'true', 'false', '10'),
  ('SF-07', 'species_planted', 'Species planted', null::text, 'multi_choice', null::text, '["Clover","Peas","Vetch","Other"]', 'false', 'false', '20'),
  ('SF-07', 'species_planted_other', 'Other species planted', null::text, 'text', null::text, null, 'false', 'false', '30'),
  -- ===== SH-01 Nest boxes, bat boxes and raptor poles =====
  ('SH-01', 'target_species', 'Target species', null::text, 'text', null::text, null, 'false', 'false', '10'),
  ('SH-01', 'cavity_type', 'Cavity type', null::text, 'text', null::text, null, 'false', 'false', '20'),
  ('SH-01', 'cavity_box_count', 'Cavity nest boxes — number', null::text, 'integer', null::text, null, 'false', 'false', '30'),
  ('SH-01', 'bat_box_count', 'Bat boxes — number', null::text, 'integer', null::text, null, 'false', 'false', '40'),
  ('SH-01', 'raptor_pole_count', 'Raptor poles — number', null::text, 'integer', null::text, null, 'false', 'false', '50'),
  -- ===== SH-02 Brush piles and slash retention =====
  ('SH-02', 'type', 'Type', null::text, 'multi_choice', null::text, '["Slash","Brush piles"]', 'true', 'false', '10'),
  ('SH-02', 'number_per_acre', 'Number per acre', null::text, 'number', null::text, null, 'false', 'false', '20'),
  -- ===== SH-03 Fence line management =====
  ('SH-03', 'length', 'Length', null::text, 'number', 'feet', null, 'false', 'false', '10'),
  ('SH-03', 'initial_establishment', 'Initial establishment', null::text, 'boolean', null::text, null, 'false', 'false', '20'),
  ('SH-03', 'plant_types', 'Plant type established', null::text, 'multi_choice', null::text, '["Trees","Shrubs","Forbs","Grasses"]', 'false', 'false', '30'),
  -- ===== SH-04 Hay meadow, pasture and cropland management for wildlife =====
  ('SH-04', 'acres_treated', 'Acres treated', null::text, 'number', 'acres', null, 'true', 'false', '10'),
  ('SH-04', 'shelter_establishment', 'Shelter establishment', null::text, 'multi_choice', null::text, '["Roadside management","Terrace/wind breaks","Field borders","Shelterbelts"]', 'false', 'false', '20'),
  ('SH-04', 'crp_management', 'Conservation Reserve Program lands management', null::text, 'boolean', null::text, null, 'false', 'false', '30'),
  ('SH-04', 'vegetation_type', 'Type of vegetation', null::text, 'choice', null::text, '["Annual","Perennial"]', 'false', 'false', '40'),
  ('SH-04', 'species_and_percent', 'Species and percent of mixture', null::text, 'text', null::text, null, 'false', 'false', '50'),
  ('SH-04', 'deferred_mowing', 'Deferred mowing', null::text, 'boolean', null::text, null, 'false', 'false', '60'),
  ('SH-04', 'deferment_period', 'Period of deferment', null::text, 'text', null::text, null, 'false', 'false', '70'),
  ('SH-04', 'mowing', 'Mowing', null::text, 'boolean', null::text, null, 'false', 'false', '80'),
  ('SH-04', 'acres_mowed_annually', 'Acres mowed annually', null::text, 'number', 'acres', null, 'false', 'false', '90'),
  ('SH-04', 'no_till', 'No till/minimum till', null::text, 'boolean', null::text, null, 'false', 'false', '100'),
  -- ===== SH-05 Half-cutting trees or shrubs =====
  ('SH-05', 'acres_treated_annually', 'Acreage treated annually', 'On the form: "Acreage to be treated annually"', 'number', 'acres', null, 'true', 'false', '10'),
  ('SH-05', 'half_cut_count', 'Number of half-cuts annually', null::text, 'integer', null::text, null, 'false', 'false', '20'),
  -- ===== SH-06 Woody plant/shrub establishment =====
  ('SH-06', 'pattern', 'Pattern', null::text, 'choice', null::text, '["Block","Mosaic","Strips"]', 'false', 'false', '10'),
  ('SH-06', 'strip_width', 'Strip width', null::text, 'number', 'feet', null, 'false', 'false', '20'),
  ('SH-06', 'strip_length', 'Strip length', null::text, 'number', 'feet', null, 'false', 'false', '30'),
  ('SH-06', 'acreage_or_length', 'Acreage or length established annually', null::text, 'text', null::text, null, 'true', 'false', '40'),
  ('SH-06', 'spacing', 'Spacing', null::text, 'text', null::text, null, 'false', 'false', '50'),
  ('SH-06', 'species_used', 'Shrub/tree species used', null::text, 'text', null::text, null, 'false', 'false', '60'),
  -- ===== SH-07 Natural cavity/snag development =====
  ('SH-07', 'snag_species', 'Species of snag', null::text, 'text', null::text, null, 'false', 'false', '10'),
  ('SH-07', 'snag_size', 'Size of snags', null::text, 'text', null::text, null, 'false', 'false', '20'),
  ('SH-07', 'number_per_acre', 'Number per acre', null::text, 'number', null::text, null, 'false', 'false', '30'),
  -- ===== CE-01 Spotlight counts =====
  ('CE-01', 'target_species', 'Targeted species', null::text, 'text', null::text, null, 'true', 'false', '10'),
  ('CE-01', 'route_length', 'Length of route', null::text, 'number', 'miles', null, 'false', 'false', '20'),
  ('CE-01', 'route_visibility', 'Visibility of route', null::text, 'text', null::text, null, 'false', 'false', '30'),
  ('CE-01', 'date_a', 'Date A', null::text, 'date', null::text, null, 'true', 'false', '40'),
  ('CE-01', 'date_b', 'Date B', null::text, 'date', null::text, null, 'true', 'false', '50'),
  ('CE-01', 'date_c', 'Date C', null::text, 'date', null::text, null, 'true', 'false', '60'),
  -- ===== CE-02 Standardized incidental observations =====
  ('CE-02', 'target_species', 'Targeted species', null::text, 'text', null::text, null, 'true', 'false', '10'),
  ('CE-02', 'observed_from', 'Observations from', null::text, 'multi_choice', null::text, '["Feeders","Food plots","Blinds","Vehicle","Other"]', 'true', 'false', '20'),
  ('CE-02', 'observed_from_other', 'Other observation point (describe)', null::text, 'text', null::text, null, 'false', 'false', '30'),
  ('CE-02', 'dates', 'Dates', 'The form prints one line — list the dates you observed.', 'text', null::text, null, 'true', 'false', '40'),
  -- ===== CE-03 Stand counts of deer =====
  ('CE-03', 'stand_count', 'Number of stands', null::text, 'integer', null::text, null, 'true', 'false', '10'),
  ('CE-03', 'dates', 'Dates', 'The form prints one line — list the count dates.', 'text', null::text, null, 'true', 'false', '20'),
  -- ===== CE-04 Aerial counts =====
  ('CE-04', 'species_counted', 'Species counted', null::text, 'text', null::text, null, 'true', 'false', '10'),
  ('CE-04', 'survey_type', 'Type of survey', null::text, 'choice', null::text, '["Helicopter","Fixed-wing"]', 'true', 'false', '20'),
  ('CE-04', 'percent_surveyed', 'Percent of area surveyed', null::text, 'choice', null::text, '["Total","50%","Other"]', 'false', 'false', '30'),
  ('CE-04', 'percent_surveyed_other', 'Other percent surveyed', null::text, 'text', null::text, null, 'false', 'false', '40'),
  -- ===== CE-05 Track counts =====
  ('CE-05', 'categories', 'Counted', null::text, 'multi_choice', null::text, '["Predators","Furbearers","Deer","Other"]', 'true', 'false', '10'),
  ('CE-05', 'categories_other', 'Other (describe)', null::text, 'text', null::text, null, 'false', 'false', '20'),
  -- ===== CE-06 Daylight deer herd/wildlife composition counts =====
  ('CE-06', 'species', 'Species', null::text, 'multi_choice', null::text, '["Deer","Turkey","Dove","Quail","Other"]', 'true', 'false', '10'),
  ('CE-06', 'species_other', 'Other species', null::text, 'text', null::text, null, 'false', 'false', '20'),
  -- ===== CE-07 Harvest data collection/record keeping =====
  ('CE-07', 'groups', 'Harvest recorded for', null::text, 'multi_choice', null::text, '["Deer","Game birds"]', 'true', 'false', '10'),
  ('CE-07', 'data_recorded', 'Data recorded', null::text, 'multi_choice', null::text, '["Age","Weight","Sex","Antler data","Harvest date"]', 'true', 'false', '20'),
  -- ===== CE-09 Census of endangered, threatened, or protected wildlife =====
  ('CE-09', 'species', 'Species', null::text, 'text', null::text, null, 'true', 'false', '10'),
  ('CE-09', 'method_and_dates', 'Method and dates', null::text, 'longtext', null::text, null, 'true', 'false', '20'),
  -- ===== CE-10 Census and monitoring of nongame wildlife species =====
  ('CE-10', 'species', 'Species', null::text, 'text', null::text, null, 'true', 'false', '10'),
  ('CE-10', 'method_and_dates', 'Method and dates', null::text, 'longtext', null::text, null, 'true', 'false', '20'),
  -- ===== CE-11 Miscellaneous counts =====
  ('CE-11', 'species_counted', 'Species being counted', null::text, 'text', null::text, null, 'true', 'false', '10'),
  ('CE-11', 'methods', 'Method', null::text, 'multi_choice', null::text, '["Remote detection (i.e. cameras)","Hahn (walking) line","Roost counts","Booming ground counts","Time/area counts","Songbird transects and counts","Quail call and covey counts","Point counts","Small mammal traps","Drift fences and pitfall traps","Bat departures","Dove call counts","Chachalaca counts","Turkey hen/poult counts","Waterfowl/water bird counts","Other"]', 'true', 'false', '20'),
  ('CE-11', 'methods_other', 'Other method (describe)', null::text, 'text', null::text, null, 'false', 'false', '30')
) as v(sub_code, field_key, label, help_text, input_type, unit, choices,
       required_for_form, ai_extractable, sort_order)
join sub_activities sa on sa.code = v.sub_code
on conflict (sub_activity_id, field_key) do update set
      label = excluded.label,
      help_text = excluded.help_text,
      input_type = excluded.input_type,
      unit = excluded.unit,
      choices = excluded.choices,
      required_for_form = excluded.required_for_form,
      ai_extractable = excluded.ai_extractable,
      sort_order = excluded.sort_order;

-- <<< END GENERATED


-- ============================================================
-- 10. Backfill
-- ============================================================
-- Assigns every existing activity and document to a report period, and maps
-- legacy activities.type values onto practice codes using the friendly-name
-- mapping documented in CLAUDE.md > "Annual Report Domain Model" > section 3.
--
-- Year selection:
--   * activities  -> year of created_at (the row's own upload/entry year;
--                    activities have no reliable performed-on date yet).
--   * documents   -> INHERIT the parent activity's period when activity_id is
--                    set, because documents.report_period_id is defined as
--                    "denormalized from activity". Only parentless documents
--                    (land documents, census photos) fall back to their own
--                    uploaded_at year.
--
-- Nothing is deleted and nothing is overwritten: every update is guarded by
-- `where <column> is null`, so re-running is a no-op and any classification a
-- human has already made wins.

do $$
declare
  periods_created integer;
  acts_total integer;
  acts_periodized integer;
  acts_mapped integer;
  acts_unmapped integer;
  acts_sub_mapped integer;
  docs_total integer;
  docs_periodized integer;
  docs_unperiodized integer;
  unmapped_types text;
begin
  -- --- 10a. Create a report period for every (property, year) in play --------
  with wanted as (
    -- from activities
    select a.property_id, extract(year from a.created_at)::integer as tax_year
      from activities a
     where a.property_id is not null
    union
    -- from documents that hang off a property directly
    select d.property_id, extract(year from d.uploaded_at)::integer
      from documents d
     where d.property_id is not null
       and d.activity_id is null
    union
    -- from census photos, via their observation
    select co.property_id, extract(year from d.uploaded_at)::integer
      from documents d
      join census_observations co on co.id = d.observation_id
     where d.activity_id is null
       and d.property_id is null
  ),
  inserted as (
    insert into report_periods (property_id, tax_year, status)
    select w.property_id, w.tax_year, 'draft'
      from wanted w
      join properties p on p.id = w.property_id   -- skip orphans defensively
     where w.tax_year is not null
    on conflict (property_id, tax_year) do nothing
    returning 1
  )
  select count(*) into periods_created from inserted;

  -- --- 10b. Attach activities to their period -------------------------------
  update activities a
     set report_period_id = rp.id
    from report_periods rp
   where a.report_period_id is null
     and rp.property_id = a.property_id
     and rp.tax_year = extract(year from a.created_at)::integer;

  -- --- 10c. Map legacy activities.type -> practice_code ---------------------
  -- The friendly-name mapping from CLAUDE.md. Types that map to a single
  -- unambiguous sub-activity get that too; erosion_control and census name a
  -- whole practice, so their sub_activity stays null for a human to pick.
  update activities a
     set practice_code = m.practice_code,
         sub_activity_id = sa.id
    from (values
      ('birdhouses',         'SH', 'SH-01'),
      ('feeders',            'SF', 'SF-05'),
      ('water_sources',      'SW', 'SW-02'),
      ('brush_management',   'HC', 'HC-04'),
      ('native_planting',    'HC', 'HC-03'),
      ('predator_management','PC', 'PC-04'),
      ('predator_control',   'PC', 'PC-04'),
      ('erosion_control',    'EC', null),
      ('census',             'CE', null)
    ) as m(type, practice_code, sub_code)
    left join sub_activities sa on sa.code = m.sub_code
   where a.practice_code is null
     and lower(trim(a.type)) = m.type;

  -- --- 10d. Attach documents to a period ------------------------------------
  -- Inherit from the parent activity first (the definition of this column).
  update documents d
     set report_period_id = a.report_period_id
    from activities a
   where d.report_period_id is null
     and d.activity_id = a.id
     and a.report_period_id is not null;

  -- Parentless documents fall back to their own upload year.
  update documents d
     set report_period_id = rp.id
    from report_periods rp
   where d.report_period_id is null
     and d.activity_id is null
     and d.property_id is not null
     and rp.property_id = d.property_id
     and rp.tax_year = extract(year from d.uploaded_at)::integer;

  -- Census photos reach a property through their observation.
  update documents d
     set report_period_id = rp.id
    from census_observations co
    join report_periods rp on rp.property_id = co.property_id
   where d.report_period_id is null
     and d.activity_id is null
     and d.property_id is null
     and d.observation_id = co.id
     and rp.tax_year = extract(year from d.uploaded_at)::integer;

  -- --- 10e. Carry existing EXIF-ish columns onto the new names --------------
  -- gps_lat/gps_lng/taken_at are kept (live code writes them); this just makes
  -- the new canonical columns non-empty for existing rows.
  update documents
     set captured_at  = coalesce(captured_at, taken_at),
         captured_lat = coalesce(captured_lat, gps_lat),
         captured_lng = coalesce(captured_lng, gps_lng)
   where taken_at is not null or gps_lat is not null or gps_lng is not null;

  -- Receipts get a phase of their own; photos we cannot classify are 'unknown'
  -- rather than a guess. NOTHING here is an AI inference, so phase_source stays
  -- null: these are structural facts, not proposals.
  update documents
     set phase = case when type = 'receipt' then 'standalone' else 'unknown' end
   where phase is null;

  -- --- 10f. Report ----------------------------------------------------------
  select count(*) into acts_total from activities;
  select count(*) into acts_periodized from activities where report_period_id is not null;
  select count(*) into acts_mapped from activities where practice_code is not null;
  select count(*) into acts_sub_mapped from activities where sub_activity_id is not null;
  acts_unmapped := acts_total - acts_mapped;

  select count(*) into docs_total from documents;
  select count(*) into docs_periodized from documents where report_period_id is not null;
  docs_unperiodized := docs_total - docs_periodized;

  select coalesce(string_agg(distinct coalesce(type, '<null>'), ', '), '(none)')
    into unmapped_types
    from activities where practice_code is null;

  raise notice '--- Annual Report backfill ------------------------------';
  raise notice 'report_periods created:            %', periods_created;
  raise notice 'activities total:                  %', acts_total;
  raise notice '  assigned to a report period:     %', acts_periodized;
  raise notice '  mapped to a practice_code:       %', acts_mapped;
  raise notice '  mapped to a sub_activity:        %', acts_sub_mapped;
  raise notice '  COULD NOT MAP to a practice:     %', acts_unmapped;
  raise notice '  unmapped activities.type values: %', unmapped_types;
  raise notice 'documents total:                   %', docs_total;
  raise notice '  assigned to a report period:     %', docs_periodized;
  raise notice '  COULD NOT ASSIGN a period:       %', docs_unperiodized;
  raise notice '---------------------------------------------------------';
  raise notice 'Unmapped rows are left NULL on purpose. They are not lost:';
  raise notice 'a human picks the practice/sub-activity. Never infer it.';
end $$;
