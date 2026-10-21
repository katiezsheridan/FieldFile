-- ============================================================
-- user_settings + reminder_log — opt-in annual report deadline reminders
-- ============================================================
-- user_settings: one row per Clerk user. email_reminders defaults to FALSE:
-- nobody is emailed until they turn it on in Settings.
--
-- reminder_log: one row per reminder actually sent, so the daily job never
-- sends the same one twice. Keyed by (user, property, kind, tax year, step).
--   kind 'activities' — work for tax_year must be done by Dec 31 of tax_year
--   kind 'report'     — the tax_year report is due to the county by Apr 30
--                       of tax_year + 1
--
-- Both are accessed only through API routes with the service-role key; RLS is
-- enabled with no policies, so the anon key cannot read them.
-- Additive and idempotent. Rollback: rollback_add_user_settings_and_reminders.sql

create table if not exists user_settings (
  user_id text primary key,
  email_reminders boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table user_settings enable row level security;

create table if not exists reminder_log (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  property_id uuid not null references properties(id) on delete cascade,
  kind text not null check (kind in ('activities', 'report')),
  tax_year integer not null,
  step text not null,
  sent_at timestamptz not null default now(),
  unique (user_id, property_id, kind, tax_year, step)
);
alter table reminder_log enable row level security;

notify pgrst, 'reload schema';
