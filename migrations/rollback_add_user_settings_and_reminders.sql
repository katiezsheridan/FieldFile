-- Rollback for add_user_settings_and_reminders.sql. Reminder preferences and
-- the sent log are lost; the app treats a missing table as "reminders off".
drop table if exists reminder_log;
drop table if exists user_settings;
notify pgrst, 'reload schema';
