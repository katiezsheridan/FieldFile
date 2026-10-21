-- ============================================================
-- activity_visits — the work log inside an activity
-- ============================================================
-- An activity (the container) is one line item on PWD-888 Part IV for one tax
-- year: "Feeders and mineral supplementation, 2026". Work like refilling a
-- feeder is done many times; each time is a visit — its own date, notes,
-- time, cost, amount and who did it, with photos attached to it.
--
-- The container's dates are DERIVED from its visits (performed_on = first
-- visit, performed_through = last, completed_date = last), kept in step by the
-- API (lib/activity-visits-server.ts). Visits must fall in the container's
-- tax year; next year's work goes in next year's activity.
--
-- documents.visit_id ties a photo or receipt to the visit it shows. It is
-- optional: evidence still belongs to the activity (documents.activity_id)
-- and is counted there, so nothing in the three-of-seven count changes.
--
-- Accessed through API routes with the service-role key; RLS enabled with no
-- policies. Additive and idempotent.
-- Rollback: rollback_add_activity_visits.sql

create table if not exists activity_visits (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  visited_on date not null,
  notes text,
  time_spent text,     -- free text: "2 hours", "30 min"
  cost numeric(10, 2), -- dollars
  amount text,         -- free text with unit: "175 lbs", "305 gallons"
  performed_by text,   -- "Self", a contractor, a ranch hand
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activity_visits_activity_id_idx
  on activity_visits (activity_id, visited_on);

alter table activity_visits enable row level security;

alter table documents
  add column if not exists visit_id uuid references activity_visits(id) on delete set null;

create index if not exists documents_visit_id_idx on documents (visit_id);

notify pgrst, 'reload schema';
