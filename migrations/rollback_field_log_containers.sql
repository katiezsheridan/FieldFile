-- Rollback for add_field_log_containers.sql.
--
-- Deletes ONLY the containers that backfill created — activities named
-- 'Field log entry' that still have no sub-activity and are referenced by a
-- field log entry. Anything a human has since classified or renamed is left
-- alone: it is real work now, not an artifact of the migration.

begin;

delete from activities a
 where a.name = 'Field log entry'
   and a.sub_activity_id is null
   and exists (
     select 1 from field_log_entries f where f.activity_id = a.id
   );

drop index if exists activities_property_sub_performed_idx;
drop index if exists field_log_entries_activity_id_idx;

alter table field_log_entries
  drop column if exists activity_id,
  drop column if exists sub_activity_code;

commit;
