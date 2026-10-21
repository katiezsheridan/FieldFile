-- ============================================================
-- property_slug_history — old property URLs keep working after a rename
-- ============================================================
-- A property's slug follows its name (app/api/properties/[id] PATCH), so a
-- rename changes /properties/<slug>. Each slug a property gives up is kept
-- here; lookups try current slugs first, then this table, and the property
-- pages redirect an old slug to the current one.
--
-- Slugs are unique per user, not globally, so the key is (user_id, slug).
-- Accessed only through API routes with the service-role key; RLS is enabled
-- with no policies, so the anon key cannot read it.
--
-- Additive and idempotent. Renames made before this migration were not
-- recorded and cannot be recovered.
-- Rollback: rollback_add_property_slug_history.sql

create table if not exists property_slug_history (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  user_id text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists property_slug_history_property_id_idx
  on property_slug_history (property_id);

alter table property_slug_history enable row level security;

notify pgrst, 'reload schema';
