-- ============================================================================
-- Fold field_log_entries into the activity container model.
--
-- THE ACTIVITY IS THE CONTAINER (CLAUDE.md > "Annual Report Domain Model" > 3).
-- A field log entry was a single-evidence container of its own: a fence line
-- photographed in six spots on one day became six unrelated rows the report
-- would have to re-group by heuristic. Now every entry hangs off an activity,
-- and same-day work on the same sub-activity lands in one.
--
-- Two new columns, both nullable:
--   * sub_activity_code — what the landowner tapped in the field. The capture
--     UI reads the catalog from lib/sub-activities.ts, which is static
--     TypeScript and therefore available offline; the client never needs a
--     server round-trip to classify.
--   * activity_id — the container, assigned SERVER-SIDE on arrival by
--     find-or-create on (property_id, sub_activity_id, performed_on). The
--     offline queue can flush an entry captured days earlier and still land in
--     the right container, because the key is the capture date, not now().
--
-- Nothing is dropped. practice_category stays as written and is still the
-- check-constrained storage format; sub_activity_code is the finer grain.
--
-- Safe to re-run: if-not-exists / on-conflict guarded throughout, and the
-- backfill only ever fills nulls.
-- ============================================================================

alter table field_log_entries
  -- References the unique `code`, not the uuid pk: the client speaks in codes
  -- (HC-04) and they are the stable identifier the catalog is keyed on.
  add column if not exists sub_activity_code text
    references sub_activities(code) on delete restrict,
  add column if not exists activity_id uuid
    references activities(id) on delete set null;

create index if not exists field_log_entries_activity_id_idx
  on field_log_entries (activity_id);

-- The lookup the find-or-create performs on every capture.
create index if not exists activities_property_sub_performed_idx
  on activities (property_id, sub_activity_id, performed_on);


-- ============================================================
-- Backfill: give every existing entry a container
-- ============================================================
-- Each existing entry becomes its own activity carrying the practice the
-- landowner actually chose. sub_activity_id stays NULL — the entry predates
-- sub-activity capture, and inferring which of a practice's items it was is
-- exactly the guesswork the container model exists to avoid. A human picks it
-- from the activity's edit form.
--
-- Because sub_activity_id is null here, these are NOT grouped with each other:
-- grouping keys on the sub-activity, and two unclassified entries are not
-- known to be the same work.

do $$
declare
  entries_total integer;
  activities_made integer := 0;
  entry record;
  new_activity_id uuid;
  period_id uuid;
begin
  select count(*) into entries_total from field_log_entries;

  for entry in
    select fle.id, fle.property_id, fle.practice_category, fle.note,
           fle.captured_at, fle.created_at
      from field_log_entries fle
     where fle.activity_id is null
     order by fle.created_at
  loop
    -- The period the work counts toward: the capture date's year, not today's.
    insert into report_periods (property_id, tax_year, status)
    values (entry.property_id,
            extract(year from coalesce(entry.captured_at, entry.created_at))::integer,
            'draft')
    on conflict (property_id, tax_year) do nothing;

    select rp.id into period_id
      from report_periods rp
     where rp.property_id = entry.property_id
       and rp.tax_year = extract(year from coalesce(entry.captured_at, entry.created_at))::integer;

    insert into activities (
      property_id, type, name, description, status,
      practice_code, sub_activity_id, report_period_id,
      performed_on, completed_date, due_date, notes,
      required_evidence, locations
    ) values (
      entry.property_id,
      -- Legacy activities.type, the coarse mapping the annual-report backfill
      -- already uses. Superseded by practice_code + sub_activity_id.
      case entry.practice_category
        when 'habitat_control'      then 'brush_management'
        when 'erosion_control'      then 'erosion_control'
        when 'predator_control'     then 'predator_management'
        when 'supplemental_water'   then 'water_sources'
        when 'supplemental_food'    then 'feeders'
        when 'supplemental_shelter' then 'birdhouses'
        when 'census'               then 'census'
      end,
      'Field log entry',
      'Captured in the field. Pick the specific activity to finish classifying it.',
      'in_progress',
      case entry.practice_category
        when 'habitat_control'      then 'HC'
        when 'erosion_control'      then 'EC'
        when 'predator_control'     then 'PC'
        when 'supplemental_water'   then 'SW'
        when 'supplemental_food'    then 'SF'
        when 'supplemental_shelter' then 'SH'
        when 'census'               then 'CE'
      end,
      null,
      period_id,
      coalesce(entry.captured_at, entry.created_at)::date,
      coalesce(entry.captured_at, entry.created_at)::date,
      coalesce(entry.captured_at, entry.created_at)::date,
      entry.note,
      '[]'::jsonb,
      '[]'::jsonb
    )
    returning id into new_activity_id;

    update field_log_entries
       set activity_id = new_activity_id
     where id = entry.id;

    activities_made := activities_made + 1;
  end loop;

  raise notice '--- Field log container backfill ---------------------';
  raise notice 'field_log_entries total:        %', entries_total;
  raise notice 'containers created:             %', activities_made;
  raise notice 'entries still without activity: %',
    (select count(*) from field_log_entries where activity_id is null);
  raise notice '------------------------------------------------------';
  raise notice 'These containers carry the practice the landowner chose';
  raise notice 'and NO sub-activity. A human picks that; never infer it.';
end $$;
