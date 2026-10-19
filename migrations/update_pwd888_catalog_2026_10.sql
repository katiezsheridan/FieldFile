-- ============================================================
-- PWD-888 catalog corrections, found while rendering the form (2026-10)
-- ============================================================
-- lib/sub-activities.ts is the source of truth and the app reads the catalog
-- from it, not from this table. This keeps the database mirror
-- (field_requirements) in step with the regenerated seed in
-- add_annual_report_domain.sql without re-running that whole migration.
--
--   * SW-02 work: the form prints "pipeline" twice (new well; modification of
--     an existing source). Adds the second as its own choice.
--   * CE-11 methods: adds "Alligator nest/census counts", printed on the form
--     but missing from the catalog.
--   * SH-01 cavity_type: removed. The form's "Cavity type" is a checkbox
--     label ("Cavity type. Number: ___"), not a blank. No activity holds a
--     value for it (checked 2026-10-19).
--
-- Idempotent: safe to run twice. Rollback: rollback_update_pwd888_catalog_2026_10.sql

update field_requirements fr
   set choices = '["Drill new well","Windmill","Pump","Pipeline","Modification(s) of existing water source","Fencing","Overflow","Trough modification","Pipeline (modification of existing source)"]'::jsonb
  from sub_activities sa
 where fr.sub_activity_id = sa.id and sa.code = 'SW-02' and fr.field_key = 'work';

update field_requirements fr
   set choices = '["Remote detection (i.e. cameras)","Hahn (walking) line","Roost counts","Booming ground counts","Time/area counts","Songbird transects and counts","Quail call and covey counts","Point counts","Small mammal traps","Drift fences and pitfall traps","Bat departures","Dove call counts","Chachalaca counts","Turkey hen/poult counts","Waterfowl/water bird counts","Alligator nest/census counts","Other"]'::jsonb
  from sub_activities sa
 where fr.sub_activity_id = sa.id and sa.code = 'CE-11' and fr.field_key = 'methods';

delete from field_requirements fr
 using sub_activities sa
 where fr.sub_activity_id = sa.id and sa.code = 'SH-01' and fr.field_key = 'cavity_type';

update field_requirements fr
   set sort_order = case fr.field_key
     when 'cavity_box_count' then 20 when 'bat_box_count' then 30 when 'raptor_pole_count' then 40 end
  from sub_activities sa
 where fr.sub_activity_id = sa.id and sa.code = 'SH-01'
   and fr.field_key in ('cavity_box_count', 'bat_box_count', 'raptor_pole_count');

notify pgrst, 'reload schema';
