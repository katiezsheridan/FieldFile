import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "FieldFile - Wildlife Tax Exemption Filing",
  description:
    "Simplify your wildlife tax exemption filing for Texas landowners",
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
