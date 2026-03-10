import Link from "next/link";
import Image from "next/image";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-field-cream flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 border-b border-field-wheat/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo/fieldfile-logo.png"
              alt="FieldFile"
              width={160}
              height={40}
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/services"
              className="text-field-ink/70 hover:text-field-ink transition-colors"
            >
              Services
            </Link>
            <Link
              href="/pricing"
              className="text-field-ink/70 hover:text-field-ink transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/how-it-works"
              className="text-field-ink/70 hover:text-field-ink transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/faq"
              className="text-field-ink/70 hover:text-field-ink transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-field-ink/70 hover:text-field-ink transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-field-forest text-white px-4 py-2 rounded-lg font-medium hover:bg-field-forest/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

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
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-medium text-field-ink mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-field-ink/60">
                <li>
                  <a href="mailto:support@fieldfile.com" className="hover:text-field-ink">
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
  );
}
