"use client";

import { useState, useRef, useEffect } from "react";
import { Property } from "@/lib/types";

interface PropertySwitcherProps {
  properties: Property[];
  currentProperty: Property;
  onPropertyChange: (property: Property) => void;
}

export default function PropertySwitcher({
  properties,
  currentProperty,
  onPropertyChange,
}: PropertySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-field-wheat rounded-lg hover:border-field-sage transition-colors"
      >
        <div className="text-right">
          <div className="text-sm font-medium text-field-ink">
            {currentProperty.name}
          </div>
          <div className="text-xs text-field-ink/60">
            {currentProperty.county} County
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-field-ink/60 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-field-wheat rounded-lg shadow-lg z-50">
          <ul className="py-2">
            {properties.map((property) => (
              <li key={property.id}>
                <button
                  onClick={() => {
                    onPropertyChange(property);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-field-wheat/30 transition-colors ${
                    property.id === currentProperty.id
                      ? "bg-field-forest/10"
                      : ""
                  }`}
                >
                  <div className="text-sm font-medium text-field-ink">
                    {property.name}
                  </div>
                  <div className="text-xs text-field-ink/60">
                    {property.county} County - {property.acreage} acres
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
