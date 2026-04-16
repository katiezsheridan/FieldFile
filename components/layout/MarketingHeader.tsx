"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export default function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="py-4 px-6 border-b border-field-wheat/50 bg-field-cream">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/images/logo/fieldfile-logo.png"
            alt="FieldFile"
            width={140}
            height={35}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-field-ink/70 hover:text-field-ink hover:bg-field-wheat/40 px-3 py-1.5 rounded-full text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="border border-field-forest text-field-forest px-4 py-2 rounded-lg text-sm font-medium hover:bg-field-forest/10 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-field-forest text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-field-forest/90 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile CTAs + hamburger */}
        <div className="lg:hidden flex items-center gap-3">
          <Link
            href="/sign-in"
            className="border border-field-forest text-field-forest px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-field-forest/10 transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-field-ink transition-transform duration-200 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-field-ink transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-field-ink transition-transform duration-200 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden mt-4 pb-2 border-t border-field-wheat/50 pt-4">
          <nav className="flex flex-col gap-1 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-field-ink/70 hover:text-field-ink hover:bg-field-wheat/40 px-3 py-2.5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 px-3">
            <Link
              href="/sign-in"
              onClick={() => setMenuOpen(false)}
              className="text-field-ink/70 hover:text-field-ink py-2.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="bg-field-forest text-white px-4 py-2.5 rounded-lg font-medium hover:bg-field-forest/90 transition-colors text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
