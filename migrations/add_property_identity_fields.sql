-- Wildlife Plan (Session 1): two missing property-identity fields.
--
-- A wildlife management plan needs the property's legal description and the
-- county appraisal district account number to be complete. These live on the
-- existing `properties` row (the single source of truth that activities,
-- documents, filings, census, field-log, and now plans all reference) rather
-- than on the plan, because they describe the property itself and don't change
-- year to year.
--
-- Both are nullable and optional: the lightweight create flows (setup wizard,
-- Add Property modal, POST /api/properties) do not require them to save. They
-- become required only for a plan to reach 100% completion / "ready to file".
--
-- RLS note: `properties` already has RLS enabled with permissive policies; row
-- ownership is enforced in the API layer (service-role key + Clerk userId via
-- `.eq("user_id", userId)`). No RLS change here. Additive ALTER only.

alter table properties
  add column if not exists legal_description text,
  add column if not exists appraisal_account text;
