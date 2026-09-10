## Summary

<!-- 1-3 bullets: what changed and why -->

## Test plan

- [ ] Tested locally
- [ ] Checked on Vercel preview deploy

## Migrations

- [ ] No schema changes, OR
- [ ] Migration added to `/migrations`, with a matching `rollback_*.sql`
- [ ] Additive and idempotent — there is only ONE Supabase project and it is
      production, so this runs against live data on its first execution
- [ ] Run in the Supabase SQL editor, then `notify pgrst, 'reload schema';`
- [ ] Verified from the app, not just the SQL editor (PostgREST caches the schema)
