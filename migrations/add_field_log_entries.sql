-- Mobile field-logging feature (Session 1: data model + storage foundation).
--
-- A field log entry = one piece of evidence a landowner captures while standing
-- on their property: either a geotagged photo of a wildlife-management practice
-- ("photo_evidence") or a dropped map pin marking an activity ("pin_activity").
--
-- RLS note: permissive at the DB layer, matching every other table in this app
-- (properties, activities, documents, census_*). Row ownership is enforced in
-- the API layer (service-role key + Clerk userId + a property.user_id join),
-- exactly like the census documents and property-overview handlers. There is no
-- Clerk->Supabase JWT bridge, so true per-user Postgres RLS is intentionally not
-- attempted here.

create table field_log_entries (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,                       -- Clerk ID (TEXT, not UUID)
  property_id uuid not null references properties(id) on delete cascade,
  entry_type text not null
    check (entry_type in ('photo_evidence', 'pin_activity')),
  -- TPWD's seven recognized wildlife-management practices. Audit-facing: each
  -- entry maps to a practice a county appraiser recognizes.
  practice_category text not null
    check (practice_category in (
      'habitat_control',
      'erosion_control',
      'predator_control',
      'supplemental_water',
      'supplemental_food',
      'supplemental_shelter',
      'census'
    )),
  note text,
  latitude numeric,
  longitude numeric,
  gps_accuracy_meters numeric,
  gps_source text
    check (gps_source in ('device_live', 'photo_exif', 'manual_pin')),
  captured_at timestamp with time zone,        -- when the activity actually happened
  created_at timestamp with time zone default now(),
  -- Path in the private 'field-log' Storage bucket. Nullable: pin_activity
  -- entries may have no photo, and photo_evidence rows are inserted before the
  -- upload completes (path uses the row id), then patched. See bucket note below.
  photo_path text
);

create index field_log_entries_property_id_idx on field_log_entries (property_id);
create index field_log_entries_user_id_idx     on field_log_entries (user_id);
create index field_log_entries_captured_at_idx on field_log_entries (captured_at);

alter table field_log_entries enable row level security;

-- Permissive DB policy (matches existing pattern; real enforcement is in /api).
create policy "Users can manage field log entries"
  on field_log_entries for all using (true);

-- ============================================================
-- Private Storage bucket for field-log photos
-- ============================================================
-- Unlike the existing public 'documents' bucket, field evidence is private:
-- photos carry embedded GPS, so they are served only via short-lived signed
-- URLs generated server-side (supabase.storage.createSignedUrl) in /api routes.
--
-- Create via Dashboard > Storage > New Bucket (Public OFF), or run the insert
-- below. No anon storage RLS policies are added on purpose: all reads/writes go
-- through the service-role key in API routes, which bypasses storage RLS.
--
-- insert into storage.buckets (id, name, public)
--   values ('field-log', 'field-log', false);
--
-- Object path convention: {user_id}/{property_id}/{entry_id}.jpg
