// Thin, typed wrapper around Google Ads conversion tracking (gtag.js).
//
// The gtag.js library itself is loaded sitewide in app/layout.tsx. This helper
// only *reports* conversions, and is written so it can be imported and called
// from anywhere (client components, event handlers) without ever throwing:
// if gtag hasn't loaded — no measurement IDs configured, an ad blocker, SSR,
// or a test environment — every call is a silent no-op.

/**
 * The conversion actions we track. Each maps to a Google Ads conversion-action
 * label supplied via env (never hardcoded). Add a new action by extending this
 * union and adding the matching NEXT_PUBLIC_GADS_LABEL_* entry below.
 */
export type ConversionLabel = "account_created" | "email_captured" | "pricing_view";

// NEXT_PUBLIC_* vars are statically inlined by Next.js at build time, so they
// must be referenced by literal name — a computed `process.env[key]` lookup
// would not be replaced. Hence the explicit map.
const CONVERSION_LABELS: Record<ConversionLabel, string | undefined> = {
  account_created: process.env.NEXT_PUBLIC_GADS_LABEL_ACCOUNT_CREATED,
  email_captured: process.env.NEXT_PUBLIC_GADS_LABEL_EMAIL_CAPTURED,
  pricing_view: process.env.NEXT_PUBLIC_GADS_LABEL_PRICING_VIEW,
};

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

type GtagFn = (
  command: "event",
  action: string,
  params?: Record<string, unknown>
) => void;

/**
 * Fire a Google Ads conversion for the given action.
 *
 * @param label  Which conversion action to report.
 * @param value  Optional monetary value for the conversion (USD).
 *
 * No-ops (and never throws) when gtag is unavailable or the Ads ID / label
 * env vars aren't configured.
 */
export function trackConversion(label: ConversionLabel, value?: number): void {
  if (typeof window === "undefined") return;

  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (typeof gtag !== "function") return;

  const conversionLabel = CONVERSION_LABELS[label];
  if (!GOOGLE_ADS_ID || !conversionLabel) return;

  const params: Record<string, unknown> = {
    send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
  };
  if (typeof value === "number") {
    params.value = value;
    params.currency = "USD";
  }

  gtag("event", "conversion", params);
}
