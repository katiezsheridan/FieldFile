"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { WILDLIFE_COUNTIES, searchCounties } from "@/lib/wildlife-counties";
import { cn } from "@/lib/utils";

const COUNTY_SLUGS = new Set<string>(WILDLIFE_COUNTIES.map((c) => c.slug));
const HIGHLIGHT_MS = 2000;

/**
 * Open a county card (a server-rendered <details id={slug}>), scroll to it,
 * flash a highlight, and move focus to its summary so keyboard users land
 * where they asked to go.
 */
function revealCounty(slug: string, { instant = false } = {}) {
  const card = document.getElementById(slug);
  if (!(card instanceof HTMLDetailsElement)) return;
  card.open = true;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  card.scrollIntoView({
    behavior: instant || reduceMotion ? "auto" : "smooth",
    block: "start",
  });
  card.querySelector("summary")?.focus({ preventScroll: true });
  card.dataset.highlight = "true";
  window.setTimeout(() => {
    delete card.dataset.highlight;
  }, HIGHLIGHT_MS);
}

/**
 * "Find your county" typeahead for the wildlife requirements post. ARIA 1.2
 * combobox with a listbox popup. The popup is absolutely positioned so opening
 * it never shifts the page. Also owns two page-level behaviors that need the
 * client: honoring #county hashes, and expanding every card before printing.
 */
export function CountySearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (i: number) => `${baseId}-option-${i}`;

  const results = searchCounties(query);
  const hasQuery = query.trim().length > 0;
  const showPopup = open && hasQuery;

  const select = useCallback((slug: string) => {
    const county = WILDLIFE_COUNTIES.find((c) => c.slug === slug);
    if (county) setQuery(county.name);
    setOpen(false);
    setActive(-1);
    // replaceState does not fire hashchange, so reveal directly.
    history.replaceState(null, "", `#${slug}`);
    revealCounty(slug);
  }, []);

  // Deep links: honor the hash on load and on in-page anchor changes
  // (the comparison table links to #hays etc.).
  useEffect(() => {
    function fromHash(instant: boolean) {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (COUNTY_SLUGS.has(slug)) revealCounty(slug, { instant });
    }
    // On load, jump without animating: a smooth scroll started while the
    // page is still settling (fonts, hydration) stops short of the card.
    const frame = requestAnimationFrame(() => fromHash(true));
    const onHashChange = () => fromHash(false);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  // Print every county card, even ones the reader collapsed. The print
  // stylesheet covers browsers that support ::details-content; this covers
  // the rest.
  useEffect(() => {
    function expandAll() {
      document
        .querySelectorAll<HTMLDetailsElement>("details[data-print-expand]")
        .forEach((d) => {
          d.open = true;
        });
    }
    window.addEventListener("beforeprint", expandAll);
    return () => window.removeEventListener("beforeprint", expandAll);
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!hasQuery) return;
        setOpen(true);
        setActive((i) => (results.length ? (i + 1) % results.length : -1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!hasQuery) return;
        setOpen(true);
        setActive((i) =>
          results.length ? (i <= 0 ? results.length - 1 : i - 1) : -1
        );
        break;
      case "Enter": {
        if (!showPopup || results.length === 0) return;
        e.preventDefault();
        select(results[active >= 0 ? active : 0].slug);
        break;
      }
      case "Escape":
        e.preventDefault();
        if (showPopup) {
          setOpen(false);
          setActive(-1);
        } else {
          setQuery("");
        }
        break;
    }
  }

  const statusText = !hasQuery
    ? ""
    : results.length === 0
      ? "No matching county. We have not covered that county yet."
      : `${results.length} ${results.length === 1 ? "county" : "counties"} found. Use the arrow keys to choose.`;

  return (
    <section
      aria-labelledby={`${baseId}-label`}
      className="rounded-2xl border border-field-wheat bg-white p-5 md:p-6 print:hidden"
    >
      <label
        id={`${baseId}-label`}
        htmlFor={`${baseId}-input`}
        className="block text-lg font-semibold text-field-ink"
      >
        Find your county
      </label>

      <div className="relative mt-3">
        <input
          ref={inputRef}
          id={`${baseId}-input`}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPopup}
          aria-controls={listboxId}
          aria-activedescendant={
            showPopup && active >= 0 ? optionId(active) : undefined
          }
          autoComplete="off"
          spellCheck={false}
          placeholder="Start typing: Hays, Blanco, Llano, Comal"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border border-field-wheat bg-field-cream px-4 py-3 text-base text-field-ink placeholder:text-field-earth focus:border-field-forest focus:outline-none focus:ring-2 focus:ring-field-forest/40"
        />

        {/* Kept mounted so aria-controls always points at a real element. */}
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Counties"
          hidden={!showPopup || results.length === 0}
          className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-field-wheat bg-white shadow-lg"
        >
          {results.map((c, i) => (
            <li
              key={c.slug}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              // mousedown, not click, so the input does not blur first.
              onMouseDown={(e) => {
                e.preventDefault();
                select(c.slug);
              }}
              onMouseMove={() => setActive(i)}
              className={cn(
                "cursor-pointer px-4 py-3",
                i === active ? "bg-field-mist" : "bg-white"
              )}
            >
              <span className="block font-medium text-field-ink">
                {c.name}
              </span>
              <span className="block text-sm text-field-earth">
                {c.cadName}
              </span>
            </li>
          ))}
        </ul>

        {showPopup && results.length === 0 && (
          <div
            // Keep the popup clickable without blurring the input first.
            onMouseDown={(e) => e.preventDefault()}
            className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-field-wheat bg-white p-4 shadow-lg"
          >
            <p className="font-medium text-field-ink">
              We have not covered that county yet.
            </p>
            <p className="mt-1 text-sm text-field-ink/80">
              Tell us where your land is and we will let you know when we add
              it.
            </p>
            <Link
              href="/request-availability"
              className="mt-3 inline-block rounded-lg bg-field-forest px-4 py-2 text-sm font-medium text-white hover:bg-field-forest/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-field-forest focus-visible:ring-offset-2"
            >
              Request your county
            </Link>
          </div>
        )}

        <p role="status" aria-live="polite" className="sr-only">
          {statusText}
        </p>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Jump to a county">
        {WILDLIFE_COUNTIES.map((c) => (
          <li key={c.slug}>
            <a
              href={`#${c.slug}`}
              onClick={(e) => {
                e.preventDefault();
                select(c.slug);
              }}
              className="inline-block rounded-full border border-field-forest/40 bg-field-cream px-3 py-1.5 text-sm font-medium text-field-forest hover:bg-field-forest/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-field-forest"
            >
              {c.name.replace(" County", "")}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
