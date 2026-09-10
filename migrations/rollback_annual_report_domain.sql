-- ============================================================================
-- ROLLBACK for add_annual_report_domain.sql
--
-- Reverses the schema change completely: drops the seven new tables, the added
-- columns on `activities` and `documents`, and every trigger/function/constraint
-- the forward migration created.
--
-- *** THIS IS DESTRUCTIVE. *** Dropping a column drops its data. Specifically
-- you will lose:
--   * every report period, questionnaire answer, receipt allocation and audit
--     event (the whole annual-report feature's data),
--   * every practice / sub-activity classification on existing activities,
--   * all AI proposals, captions, phases, confirmations, exhibit numbers and
--     extracted receipt totals on documents.
--
-- What you will NOT lose: every row and every column that existed before the
-- forward migration. `activities` and `documents` keep all their original
-- columns (type, name, status, gps_lat, gps_lng, taken_at, ...) and all their
-- rows. That is the point of extending rather than replacing.
--
-- Take a backup first:
--   pg_dump --data-only --table=activities --table=documents ... > before.sql
--
-- Safe to re-run. Ordered so foreign keys never block a drop.
-- ============================================================================


-- --- 1. Triggers and their functions ---------------------------------------
-- Dropped before the tables/columns they reference.

drop trigger if exists audit_events_no_update_tg on audit_events;
drop function if exists audit_events_reject_mutation();

drop trigger if exists receipt_allocations_total_tg on receipt_allocations;
drop function if exists receipt_allocations_check_total();

drop trigger if exists documents_allocation_total_tg on documents;
drop function if exists documents_check_allocation_total();

drop trigger if exists documents_sync_report_period_tg on documents;
drop function if exists documents_sync_report_period();

drop trigger if exists activities_cascade_report_period_tg on activities;
drop function if exists activities_cascade_report_period();

drop trigger if exists activities_sub_activity_practice_tg on activities;
drop function if exists activities_check_sub_activity_practice();


-- --- 2. Constraints added to existing tables --------------------------------
-- Explicit, because a constraint added with ALTER TABLE ... ADD CONSTRAINT is
-- not removed by dropping an unrelated column.

alter table activities drop constraint if exists activities_performed_range_ck;
alter table documents  drop constraint if exists documents_caption_source_ck;
alter table documents  drop constraint if exists documents_phase_source_ck;


-- --- 3. New tables ----------------------------------------------------------
-- Child-first. `cascade` is not used: if something outside this migration has
-- come to depend on these tables, the drop SHOULD fail loudly rather than take
-- that dependency with it.

drop table if exists audit_events;
drop table if exists receipt_allocations;
drop table if exists report_questions;
-- report_periods is referenced by activities.report_period_id and
-- documents.report_period_id; those columns go in section 4, so this table has
-- to be dropped after them. Deferred to section 5.
drop table if exists field_requirements;
-- sub_activities is referenced by activities.sub_activity_id — also section 5.


-- --- 4. Columns added to existing tables ------------------------------------
-- This is where the data loss happens. Original columns are untouched.

alter table activities
  drop column if exists practice_code,
  drop column if exists sub_activity_id,
  drop column if exists report_period_id,
  drop column if exists performed_on,
  drop column if exists performed_through,
  drop column if exists location_label,
  drop column if exists location_lat,
  drop column if exists location_lng,
  drop column if exists performed_by,
  drop column if exists field_values,
  drop column if exists narrative,
  drop column if exists narrative_source,
  drop column if exists exhibit_range;

alter table documents
  drop column if exists report_period_id,
  drop column if exists content_hash,
  drop column if exists captured_at,
  drop column if exists captured_lat,
  drop column if exists captured_lng,
  drop column if exists exif_raw,
  drop column if exists phase,
  drop column if exists phase_source,
  drop column if exists caption,
  drop column if exists caption_source,
  drop column if exists ai_confidence,
  drop column if exists ai_observations,
  drop column if exists ai_model_version,
  drop column if exists usability_flags,
  drop column if exists confirmed_by,
  drop column if exists confirmed_at,
  drop column if exists exhibit_number,
  drop column if exists vendor,
  drop column if exists purchase_date,
  drop column if exists subtotal,
  drop column if exists tax,
  drop column if exists total,
  drop column if exists line_items,
  drop column if exists extraction_confidence,
  drop column if exists extraction_raw;

-- NOTE: gps_lat, gps_lng and taken_at are deliberately NOT dropped. They
-- predate this migration and are still written by the census document routes.


-- --- 5. Remaining tables, now unreferenced ----------------------------------

drop table if exists report_periods;
drop table if exists sub_activities;
drop table if exists practices;


-- --- 6. Indexes -------------------------------------------------------------
-- Indexes on dropped columns and dropped tables went with them. Only this one
-- sits on a column that survives the rollback, so it is dropped explicitly.

drop index if exists documents_activity_id_idx;
