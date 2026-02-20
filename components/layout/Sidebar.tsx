"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  // Extract property ID from path if on a property page
  const propertyMatch = pathname.match(/\/properties\/([^/]+)/);
  const currentPropertyId = propertyMatch ? propertyMatch[1] : "prop-1";

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: `/properties/${currentPropertyId}`, label: "Activities" },
    { href: `/properties/${currentPropertyId}/documents`, label: "Documents" },
    { href: `/properties/${currentPropertyId}/map`, label: "Property Map" },
    { href: `/properties/${currentPropertyId}/filing`, label: "Filing Status" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-field-wheat/50 flex flex-col h-screen">
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-field-forest/10 text-field-forest"
                      : "text-field-ink hover:bg-field-wheat/30 hover:text-field-forest"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-field-wheat/50">
        <button className="w-full px-4 py-3 bg-field-forest text-white rounded-lg text-sm font-medium hover:bg-field-forest/90 transition-colors">
          Get Help from FieldFile
        </button>
      </div>
    </aside>
  );
}
