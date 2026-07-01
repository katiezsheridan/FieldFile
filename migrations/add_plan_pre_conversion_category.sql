-- Wildlife plan: capture the agricultural land-use category that preceded
-- conversion to wildlife management (Form 50-129, Section 5, Q2 —
-- "category of use prior to conversion"). The wildlife plan is the single
-- source for this on the 1-d-1 application; buildPayload reads it from here.
--
-- Additive and nullable. The plan wizard populates it in a later UI session;
-- until then it is null and buildPayload reports it as a gap.
alter table plans
  add column if not exists pre_conversion_category text;
