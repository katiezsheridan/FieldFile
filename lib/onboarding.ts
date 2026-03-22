import { supabase } from "./supabase";

/**
 * Links quiz_leads records to a user by adding the user_id.
 * Called during signup when the user's email matches a previous quiz submission.
 */
export async function linkQuizLeadToUser(
  email: string,
  userId: string
): Promise<void> {
  if (!email || !userId) return;

  const { error } = await supabase
    .from("quiz_leads")
    .update({ user_id: userId })
    .ilike("email", email.trim());

  if (error) {
    // Non-critical — log but don't throw
    console.error("Failed to link quiz leads:", error);
  }
}
