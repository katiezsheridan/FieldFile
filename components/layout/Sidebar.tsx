"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useProperties } from "@/lib/hooks";

const navIcons: Record<string, JSX.Element> = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  Activities: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Documents: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  "Property Map": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { properties } = useProperties(user?.id);

  // Extract property ID from path if on a property page, otherwise use first real property
  const propertyMatch = pathname.match(/\/properties\/([^/]+)/);
  const firstProperty = properties && properties.length > 0 ? properties[0] : null;
  const currentPropertyId =
    propertyMatch?.[1] || (firstProperty ? firstProperty.slug || firstProperty.id : null);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    ...(currentPropertyId
      ? [
          { href: `/properties/${currentPropertyId}`, label: "Activities" },
          { href: `/properties/${currentPropertyId}/documents`, label: "Documents" },
          { href: `/properties/${currentPropertyId}/map`, label: "Property Map" },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-white border-r border-field-wheat/50 flex flex-col h-screen">
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.label !== "Dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-field-forest/10 text-field-forest"
                      : "text-field-earth hover:bg-field-mist hover:text-field-ink"
                  }`}
                >
                  <span className={isActive ? "text-field-forest" : "text-field-earth"}>
                    {navIcons[item.label]}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-field-wheat/50">
        <button className="w-full px-4 py-2.5 bg-field-hero text-white rounded-lg text-sm font-medium hover:bg-field-hero/90 transition-colors">
          Get Help
        </button>
      </div>
    </aside>
  );
}
