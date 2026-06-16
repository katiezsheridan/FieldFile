-- Allow 'applying' as an exemption_status.
--
-- Used when a property has no exemption yet but the landowner is in the process
-- of applying for one. Pairs with exemption_type = 'none' in the UI. The
-- original constraint was added inline in add_property_overview_fields.sql and
-- auto-named properties_exemption_status_check.

alter table properties drop constraint if exists properties_exemption_status_check;
alter table properties
  add constraint properties_exemption_status_check
    check (exemption_status in ('active', 'pending', 'at_risk', 'applying'));
