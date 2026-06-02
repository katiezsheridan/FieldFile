export async function verifyRecaptcha(token: string): Promise<boolean> {
  // Local dev bypass: the reCAPTCHA key isn't registered for localhost, so
  // siteverify returns "browser-error". Skip verification in development only.
  // Vercel preview/prod run as production, so the real check is unaffected there.
  if (process.env.NODE_ENV === "development") {
    return true;
  }

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
