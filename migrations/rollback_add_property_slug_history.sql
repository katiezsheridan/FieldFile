-- Rollback for add_property_slug_history.sql. Old slugs stop resolving; the
-- app falls back to current slugs only (it tolerates the table being absent).
drop table if exists property_slug_history;
notify pgrst, 'reload schema';
