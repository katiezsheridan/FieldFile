-- Rollback for add_activity_visits.sql. Visits and the photo-to-visit links
-- are lost; activities keep their last derived dates and all their evidence.
alter table documents drop column if exists visit_id;
drop table if exists activity_visits;
notify pgrst, 'reload schema';
