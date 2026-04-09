import Link from "next/link";
import Image from "next/image";
import ReCaptchaProvider from "@/components/ReCaptchaProvider";
import MarketingHeader from "@/components/layout/MarketingHeader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReCaptchaProvider>
    <div className="min-h-screen bg-field-cream flex flex-col">
      <MarketingHeader />

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-field-wheat/50 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="mb-3">
                <Image
                  src="/images/logo/fieldfile-logo.png"
                  alt="FieldFile"
                  width={120}
                  height={30}
                />
              </div>
              <p className="text-sm text-field-ink/60">
                Simplifying wildlife tax exemption filing for Texas landowners.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-medium text-field-ink mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-field-ink/60">
                <li>
                  <Link href="/services" className="hover:text-field-ink">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-field-ink">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-field-ink">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-field-ink">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-field-ink">
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-medium text-field-ink mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-field-ink/60">
                <li>
                  <a href="mailto:katie@fieldfile.com" className="hover:text-field-ink">
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-field-ink">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium text-field-ink mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-field-ink/60">
                <li>
                  <Link href="/privacy" className="hover:text-field-ink">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-field-ink">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-field-wheat/50 text-center text-sm text-field-ink/50">
            &copy; {new Date().getFullYear()} FieldFile. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
    </ReCaptchaProvider>
  );
}
