"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useProperties } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const dashboardIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { properties } = useProperties(user?.id);
  const [expanded, setExpanded] = useState(false);

  // The property handle in the current URL, if we're on a property page.
  const currentHandle = pathname.match(/\/properties\/([^/]+)/)?.[1] ?? null;
  const dashboardActive = pathname === "/dashboard";

  return (
    // The wrapper reserves the collapsed rail width in the flex row so the
    // expanded panel overlays the content instead of pushing it.
    <div className="relative w-16 shrink-0 h-screen">
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          "absolute inset-y-0 left-0 z-40 h-screen bg-white border-r border-field-wheat/50",
          "flex flex-col overflow-hidden transition-all duration-300",
          expanded ? "w-64 shadow-lg" : "w-16"
        )}
      >
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            title="Dashboard"
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              dashboardActive
                ? "bg-field-forest/10 text-field-forest"
                : "text-field-earth hover:bg-field-mist hover:text-field-ink"
            )}
          >
            <span
              className={cn(
                "shrink-0",
                dashboardActive ? "text-field-forest" : "text-field-earth"
              )}
            >
              {dashboardIcon}
            </span>
            <span
              className={cn(
                "whitespace-nowrap transition-opacity duration-200",
                expanded ? "opacity-100" : "opacity-0"
              )}
            >
              Dashboard
            </span>
          </Link>

          {/* Properties */}
          {properties.length > 0 && (
            <div className="mt-6">
              <p
                className={cn(
                  "px-4 mb-1 text-xs font-semibold uppercase tracking-wide text-field-earth/60 transition-opacity duration-200",
                  expanded ? "opacity-100" : "opacity-0"
                )}
              >
                Properties
              </p>
              <ul className="space-y-0.5">
                {properties.map((property) => {
                  const handle = property.slug || property.id;
                  const isActive =
                    currentHandle === property.slug ||
                    currentHandle === property.id;
                  return (
                    <li key={property.id}>
                      <Link
                        href={`/properties/${handle}`}
                        title={property.name}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-field-forest/10 text-field-forest"
                            : "text-field-earth hover:bg-field-mist hover:text-field-ink"
                        )}
                      >
                        <span
                          className={cn(
                            "shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs font-semibold uppercase",
                            isActive
                              ? "bg-field-forest text-white"
                              : "bg-field-mist text-field-earth"
                          )}
                        >
                          {property.name.charAt(0)}
                        </span>
                        <span
                          className={cn(
                            "whitespace-nowrap truncate transition-opacity duration-200",
                            expanded ? "opacity-100" : "opacity-0"
                          )}
                        >
                          {property.name}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>
      </aside>
    </div>
  );
}
