/**
 * Calendar dates in Texas time.
 *
 * Every date that decides which tax year work belongs to — an activity's
 * performed_on, a census's observed_on, a field capture's day — is a Texas
 * calendar date. `new Date().toISOString().slice(0, 10)` is the UTC date,
 * which in Texas turns over at 6-7pm: a photo taken on the evening of
 * December 31 would otherwise be filed under the next tax year.
 */

/** YYYY-MM-DD for `at` (default now) in America/Chicago. Works server- and client-side. */
export function texasDate(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(at);
}
