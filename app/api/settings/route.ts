/**
 * GET / PATCH /api/settings — the signed-in user's own preferences.
 *
 *   { emailReminders: boolean }   default false: nobody is emailed until they
 *                                 turn reminders on here.
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { describeError, isMissingSchemaError } from "@/lib/errors";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NOT_MIGRATED =
  "Settings aren't available yet: apply migrations/add_user_settings_and_reminders.sql in the Supabase SQL editor.";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await db
    .from("user_settings")
    .select("email_reminders")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    if (isMissingSchemaError(error)) {
      return NextResponse.json({ emailReminders: false, available: false, note: NOT_MIGRATED });
    }
    return NextResponse.json({ error: describeError(error, "Could not load settings") }, { status: 500 });
  }
  return NextResponse.json({ emailReminders: data?.email_reminders ?? false, available: true });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { emailReminders?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.emailReminders !== "boolean") {
    return NextResponse.json({ error: "emailReminders must be true or false" }, { status: 400 });
  }
  const { error } = await db.from("user_settings").upsert(
    { user_id: userId, email_reminders: body.emailReminders, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  if (error) {
    const msg = isMissingSchemaError(error) ? NOT_MIGRATED : describeError(error, "Could not save");
    return NextResponse.json({ error: msg }, { status: isMissingSchemaError(error) ? 503 : 500 });
  }
  return NextResponse.json({ emailReminders: body.emailReminders, available: true });
}
