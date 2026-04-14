-- Allow documents to attach directly to a property (land documents),
-- separate from activity evidence (activity_id) and census photos (observation_id).
alter table documents
  add column if not exists property_id uuid references properties(id) on delete cascade;

create index if not exists documents_property_id_idx
  on documents (property_id);

-- Sanity: a document should be tied to at least one parent.
-- (Permissive — enforced going forward; existing rows untouched.)
-- alter table documents add constraint documents_has_parent
--   check (activity_id is not null or observation_id is not null or property_id is not null)
--   not valid;
