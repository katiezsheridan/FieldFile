-- Rollback for update_pwd888_catalog_2026_10.sql — restores the previous
-- choices and the SH-01 cavity_type row. Idempotent.

update field_requirements fr set choices = '["Drill new well","Windmill","Pump","Pipeline","Modification(s) of existing water source","Fencing","Overflow","Trough modification"]'::jsonb
  from sub_activities sa where fr.sub_activity_id = sa.id and sa.code = 'SW-02' and fr.field_key = 'work';

update field_requirements fr set choices = '["Remote detection (i.e. cameras)","Hahn (walking) line","Roost counts","Booming ground counts","Time/area counts","Songbird transects and counts","Quail call and covey counts","Point counts","Small mammal traps","Drift fences and pitfall traps","Bat departures","Dove call counts","Chachalaca counts","Turkey hen/poult counts","Waterfowl/water bird counts","Other"]'::jsonb
  from sub_activities sa where fr.sub_activity_id = sa.id and sa.code = 'CE-11' and fr.field_key = 'methods';

insert into field_requirements (sub_activity_id, field_key, label, input_type, required_for_form, ai_extractable, sort_order)
select sa.id, 'cavity_type', 'Cavity type', 'text', false, false, 20
  from sub_activities sa where sa.code = 'SH-01'
on conflict (sub_activity_id, field_key) do nothing;

update field_requirements fr
   set sort_order = case fr.field_key
     when 'cavity_box_count' then 30 when 'bat_box_count' then 40 when 'raptor_pole_count' then 50 end
  from sub_activities sa
 where fr.sub_activity_id = sa.id and sa.code = 'SH-01'
   and fr.field_key in ('cavity_box_count', 'bat_box_count', 'raptor_pole_count');

notify pgrst, 'reload schema';
