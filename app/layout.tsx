import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "./providers";
import "./globals.css";

// Google tag (gtag.js). IDs come from the environment — never hardcode them.
// GA4 measurement ID (G-XXXXXXXXXX) loads the library; the Google Ads
// conversion ID (AW-XXXXXXXXXX) is additionally configured so trackConversion()
// in lib/analytics.ts can report Ads conversions.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GOOGLE_ADS_CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fieldfile.com"),
  title: "FieldFile - Wildlife Tax Exemption Filing",
  description:
    "Simplify your wildlife tax exemption filing for Texas landowners",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FieldFile",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#495336",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-field-cream text-field-ink antialiased">
          {(GA_MEASUREMENT_ID || GOOGLE_ADS_CONVERSION_ID) && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${
                  GA_MEASUREMENT_ID || GOOGLE_ADS_CONVERSION_ID
                }`}
                strategy="afterInteractive"
              />
              <Script id="gtag-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ""}
                  ${GOOGLE_ADS_CONVERSION_ID ? `gtag('config', '${GOOGLE_ADS_CONVERSION_ID}');` : ""}
                `}
              </Script>
            </>
          )}
          <Providers>{children}</Providers>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
