-- Wildlife Plan (Session 1): plan + plan_practices schema foundation.
--
-- A "plan" is a landowner's wildlife management plan for one property for one
-- year. It owns the land description, the target species, and the selection of
-- qualifying practices. In later sessions the activities table is seeded from
-- the practices a user selects here, so the plan (not the setup wizard) becomes
-- the single place practices are chosen.
--
-- One plan per property per year (mirrors the filings table's unique constraint).
-- A plan can be saved at any completeness as 'draft', advanced to 'ready' once
-- all required blocks are 100%, and 'submitted' once the landowner files.
--
-- RLS note: permissive at the DB layer, matching every other table in this app
-- (properties, activities, documents, census_*, field_log_entries). Row
-- ownership is enforced in the API layer (service-role key + Clerk userId + a
-- property.user_id join). There is no Clerk->Supabase JWT bridge, so true
-- per-user Postgres RLS is intentionally not attempted here. user_id is the
-- Clerk id stored as TEXT, not a UUID.

create table plans (
  id uuid default gen_random_uuid() primary key,
  property_id uuid not null references properties(id) on delete cascade,
  user_id text not null,                       -- Clerk ID (TEXT, not UUID)
  year integer not null,
  status text not null default 'draft'
    check (status in ('draft', 'ready', 'submitted')),
  -- Target species: which wildlife the plan is managed for.
  target_species text[] default '{}',
  -- Land description block.
  habitat_types text[] default '{}',
  property_description text,
  water_sources text[] default '{}',
  wildlife_species text[] default '{}',
  current_land_use text,
  land_history text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (property_id, year)
);

create index plans_property_id_idx on plans (property_id);
create index plans_user_id_idx     on plans (user_id);

-- One row per qualifying practice considered for a plan. `selected` marks the
-- practices the landowner is committing to (minimum 3 for a valid plan); the
-- documentation jsonb holds the practice's sub-form (description, planned
-- activities, dates, locations, notes).
--
-- practice_type uses TPWD's seven recognized practices, the same canonical set
-- and spellings as field_log_entries.practice_category and the PracticeCategory
-- TypeScript type, so practices map cleanly to seeded activities later.
create table plan_practices (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid not null references plans(id) on delete cascade,
  practice_type text not null
    check (practice_type in (
      'habitat_control',
      'erosion_control',
      'predator_control',
      'supplemental_water',
      'supplemental_food',
      'supplemental_shelter',
      'census'
    )),
  selected boolean not null default false,
  documentation jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (plan_id, practice_type)
);

create index plan_practices_plan_id_idx on plan_practices (plan_id);

alter table plans enable row level security;
alter table plan_practices enable row level security;

-- Permissive DB policies (match existing pattern; real enforcement is in /api).
create policy "Users can manage plans"
  on plans for all using (true);
create policy "Users can manage plan practices"
  on plan_practices for all using (true);
