"use client";

import { useEffect } from "react";

// Registers the service worker so the app is installable and the shell loads
// offline. Production-only: a SW in `next dev` serves stale chunks and fights
// hot-reload. To exercise it locally, run `npm run build && npm start`.
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration is best-effort — the app still works without it */
      });
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
