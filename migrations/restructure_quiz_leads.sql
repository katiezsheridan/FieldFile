-- Restructure quiz_leads for the reworked 5-question eligibility quiz.
-- The flat, typed columns make leads queryable for segmentation/routing.
-- The raw `answers` jsonb column is kept for safety and debugging.
-- `name`, `phone`, `survey_url`, and `survey_path` are no longer written by the
-- quiz (no name/phone/upload in the new flow) but are left in place for history.

alter table quiz_leads add column if not exists q1_situation text;     -- own | buying | inherited
alter table quiz_leads add column if not exists zip_raw text;          -- 5-digit string
alter table quiz_leads add column if not exists county text;           -- derived from zip (null if unknown)
alter table quiz_leads add column if not exists in_target_county boolean default false;
alter table quiz_leads add column if not exists q3_valuation text;     -- ag | wildlife | market | unsure
alter table quiz_leads add column if not exists q4_acreage text;       -- lt10 | 10_50 | 50_100 | 100_500 | 500plus
alter table quiz_leads add column if not exists q5_goal text;          -- maintain_wildlife | convert_to_wildlife | new_valuation | exploring
alter table quiz_leads add column if not exists segment text;          -- computed segment
alter table quiz_leads add column if not exists lead_temp text;        -- hot | warm | nurture

-- Helpful indexes for triaging incoming leads.
create index if not exists quiz_leads_lead_temp_idx on quiz_leads (lead_temp);
create index if not exists quiz_leads_in_target_county_idx on quiz_leads (in_target_county);
