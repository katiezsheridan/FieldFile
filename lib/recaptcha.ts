export async function verifyRecaptcha(token: string): Promise<boolean> {
  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY!,
        response: token,
      }),
    }
  );

  const data = await response.json();
  // Score ranges from 0.0 (bot) to 1.0 (human). 0.5 is Google's recommended threshold.
  return data.success && data.score >= 0.5;
}
