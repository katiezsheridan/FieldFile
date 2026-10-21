"use client";

import { useEffect, type ReactNode } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Params already confirmed current this session — no need to ask again. */
const current = new Set<string>();

/**
 * Keeps old property URLs working. A rename changes a property's slug; the old
 * slug is kept in property_slug_history, and here any page under
 * /properties/<old-slug>/... is replaced with /properties/<current-slug>/...
 * The page renders meanwhile — its API calls resolve the old slug too — so the
 * swap only tidies the address bar and future bookmarks.
 */
export default function PropertyLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const param = params.id as string;

  useEffect(() => {
    if (!param || UUID_RE.test(param) || current.has(param)) return;
    let active = true;
    fetch(`/api/properties/${encodeURIComponent(param)}/resolve`)
      .then((r) => (r.ok ? r.json() : null))
      .then((ref: { slug: string | null } | null) => {
        if (!active || !ref?.slug) return;
        if (ref.slug === param) {
          current.add(param);
          return;
        }
        const prefix = `/properties/${param}`;
        const rest = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "";
        const qs = search.toString();
        router.replace(`/properties/${ref.slug}${rest}${qs ? `?${qs}` : ""}`);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [param, pathname, search, router]);

  return <>{children}</>;
}
