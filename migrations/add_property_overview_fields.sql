-- Property Overview feature: extend the existing `properties` table.
--
-- This is an ALTER, not a new table. `properties` already exists and is
-- referenced by activities, documents, filings, and census_observations, plus
-- the /api/properties handlers and the /properties/[id] UI. Creating a second
-- table would split the source of truth, so we add to this one.
--
-- RLS note: the table already has RLS enabled with permissive policies. Row
-- ownership is enforced in the API layer (service-role key + Clerk userId via
-- `.eq("user_id", userId)`), matching the rest of the app. No RLS change here.

-- 1. New columns for the Overview snapshot.
alter table properties
  add column if not exists exemption_status text
    check (exemption_status in ('active', 'pending', 'at_risk')),
  add column if not exists photo_url text;

-- 2. Widen exemption_type to allow 'none' (kept full words so existing rows and
--    the Property type's 'wildlife' | 'agriculture' values stay valid).
alter table properties drop constraint if exists properties_exemption_type_check;
alter table properties
  add constraint properties_exemption_type_check
    check (exemption_type in ('wildlife', 'agriculture', 'none'));

-- 3. Relax NOT NULL on detail columns the lightweight Overview create flow does
--    not collect yet. A property can be created from the snapshot first and have
--    its address/coordinates filled in later from the map page.
--    (`state` keeps its existing default of 'TX'.)
alter table properties alter column address drop not null;
alter table properties alter column lat drop not null;
alter table properties alter column lng drop not null;
