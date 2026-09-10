/**
 * Supabase rejects with a plain `PostgrestError` object, not an `Error`, so
 * `err instanceof Error` is false and a naive catch shows only its fallback
 * message. That turns a fixable "column does not exist" into "Something went
 * wrong" — which is how a missing migration looked like a broken app.
 */
type PostgrestLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

export function describeError(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;

  if (err && typeof err === "object") {
    const e = err as PostgrestLike;
    const parts = [e.message, e.details, e.hint].filter(
      (p): p is string => typeof p === "string" && p.length > 0
    );
    if (parts.length > 0) {
      const body = parts.join(" — ");
      return e.code ? `${body} (${e.code})` : body;
    }
  }

  if (typeof err === "string" && err) return err;
  return fallback;
}

/**
 * True when the failure is the annual-report migration not being applied to
 * this database. PGRST204 = no such column in the schema cache, 42703 =
 * undefined column, PGRST205 = no such table.
 */
export function isMissingSchemaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as PostgrestLike;
  if (e.code && ["PGRST204", "PGRST205", "42703", "42P01"].includes(e.code)) {
    return true;
  }
  const text = `${e.message ?? ""} ${e.details ?? ""}`.toLowerCase();
  return (
    text.includes("schema cache") ||
    (text.includes("column") && text.includes("does not exist"))
  );
}

export const MIGRATION_HINT =
  "This database is missing the annual-report tables. Apply " +
  "migrations/add_annual_report_domain.sql in the Supabase SQL editor, then try again.";
