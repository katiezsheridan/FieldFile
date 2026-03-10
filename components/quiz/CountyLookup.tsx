"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { lookupLocation, regionLabels, type CountyResult } from "@/lib/quiz-data";

interface CountyLookupProps {
  value: string | undefined; // stored as "county|region" e.g. "Travis|central"
  onSelect: (value: string) => void;
}

export default function CountyLookup({ value, onSelect }: CountyLookupProps) {
  const [input, setInput] = useState(() => {
    // Restore display text from stored value
    if (!value) return "";
    const [county] = value.split("|");
    return county || "";
  });
  const [result, setResult] = useState<CountyResult | null>(() => {
    if (!value) return null;
    const [county, region] = value.split("|");
    if (county && region) return { county, region: region as CountyResult["region"] };
    return null;
  });
  const [error, setError] = useState("");

  function handleLookup() {
    if (!input.trim()) {
      setError("Please enter a zip code or city name.");
      return;
    }
    const found = lookupLocation(input);
    if (found) {
      setResult(found);
      setError("");
      onSelect(`${found.county}|${found.region}`);
    } else {
      setResult(null);
      setError(
        "We couldn't find that location. Try a 5-digit Texas zip code or a major city name."
      );
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLookup();
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-field-ink">
          Where is your property located?
        </h2>
        <p className="mt-2 text-field-ink/70 text-base">
          Enter a Texas zip code or city name so we can identify your county and
          provide region-specific guidance.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 78701 or Austin"
            className="flex-1 px-4 py-3 rounded-lg border border-field-wheat bg-white text-field-ink placeholder:text-field-ink/40 focus:outline-none focus:ring-2 focus:ring-field-green/30 focus:border-field-green transition-colors"
          />
          <button
            onClick={handleLookup}
            type="button"
            className="px-6 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors flex-shrink-0"
          >
            Look up
          </button>
        </div>

        {error && (
          <p className="text-sm text-field-red">{error}</p>
        )}

        {result && (
          <div
            className={cn(
              "rounded-lg border-2 border-field-green bg-field-green/5 p-5",
              "animate-in"
            )}
            style={{ animation: "slideDown 200ms ease-out" }}
          >
            <style jsx>{`
              @keyframes slideDown {
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-field-green flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-field-ink">
                  {result.county} County
                </p>
                <p className="text-sm text-field-ink/70">
                  Region: {regionLabels[result.region]}
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-field-ink/50">
          We support all 254 Texas counties. Your county determines which
          appraisal district handles your filings.
        </p>
      </div>
    </div>
  );
}
