-- Add slug column to properties, unique per user
alter table properties add column if not exists slug text;

create unique index if not exists properties_user_slug_unique
  on properties (user_id, slug);

-- Backfill slugs from name for any existing rows
update properties
set slug = regexp_replace(
             regexp_replace(lower(trim(name)), '[^a-z0-9\s-]', '', 'g'),
             '\s+', '-', 'g'
           )
where slug is null;
