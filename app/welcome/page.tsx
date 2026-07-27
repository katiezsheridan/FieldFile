"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { trackConversion } from "@/lib/analytics";

// Post-signup redirect handler. Clerk sends a *newly created* account here
// (see forceRedirectUrl on the SignUp component). We fire the account_created
// conversion exactly once, then forward to the dashboard.
//
// Why an interstitial instead of firing on /dashboard: a gtag conversion has to
// run client-side, and /dashboard renders on every visit/refresh — it would
// double-count. This route is only ever hit once, right after signup, and we
// immediately replace the URL with /dashboard, so a refresh reloads /dashboard
// (not this page) and cannot re-fire. A sessionStorage flag guards against the
// rare in-flight refresh and React strict-mode double-invocation.
const TRACKED_KEY = "ff_account_created_tracked";

export default function WelcomePage() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (sessionStorage.getItem(TRACKED_KEY)) {
      router.replace("/dashboard");
      return;
    }

    // gtag.js is loaded afterInteractive, so on this fresh navigation it may not
    // be ready the instant we mount. Poll briefly (up to ~2s) so the conversion
    // isn't dropped, then fire once, dedupe, and forward.
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const fireAndForward = () => {
      const gtagReady =
        typeof (window as unknown as { gtag?: unknown }).gtag === "function";

      if (gtagReady || attempts >= 10) {
        trackConversion("account_created", 50);
        sessionStorage.setItem(TRACKED_KEY, "1");
        timer = setTimeout(() => router.replace("/dashboard"), 150);
        return;
      }

      attempts += 1;
      timer = setTimeout(fireAndForward, 200);
    };

    fireAndForward();
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-field-cream flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 bg-field-forest rounded-xl flex items-center justify-center mb-4">
        <span className="text-white font-bold text-lg">FF</span>
      </div>
      <h1 className="text-xl font-semibold text-field-ink">
        Welcome to FieldFile
      </h1>
      <p className="mt-1 text-sm text-field-earth">Setting up your account&hellip;</p>
    </div>
  );
}
