"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import PropertySwitcher from "./PropertySwitcher";
import Image from "next/image";
import { useProperties } from "@/lib/hooks";
import { Property } from "@/lib/types";

export default function Header() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { properties } = useProperties(user?.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Prefer the property in the current URL; fall back to selection or first property.
  const urlIdOrSlug = useMemo(() => {
    const match = pathname?.match(/\/properties\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  const currentProperty: Property | null = useMemo(() => {
    if (properties.length === 0) return null;
    if (urlIdOrSlug) {
      const fromUrl = properties.find(
        (p) => p.id === urlIdOrSlug || p.slug === urlIdOrSlug
      );
      if (fromUrl) return fromUrl;
    }
    if (selectedId) {
      const fromState = properties.find((p) => p.id === selectedId);
      if (fromState) return fromState;
    }
    return properties[0];
  }, [properties, urlIdOrSlug, selectedId]);

  useEffect(() => {
    if (currentProperty && currentProperty.id !== selectedId) {
      setSelectedId(currentProperty.id);
    }
  }, [currentProperty, selectedId]);

  function handlePropertyChange(property: Property) {
    setSelectedId(property.id);
    const handle = property.slug || property.id;
    if (urlIdOrSlug) {
      // Swap the property handle in the current path so we stay on the same sub-page.
      const nextPath = pathname!.replace(
        /\/properties\/[^/]+/,
        `/properties/${handle}`
      );
      router.push(nextPath);
    } else {
      router.push(`/properties/${handle}`);
    }
  }

  return (
    <header className="h-16 bg-white border-b border-field-wheat/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Image
          src="/images/logo/fieldfile-icon-round.png"
          alt="FieldFile"
          width={32}
          height={32}
        />
        <span className="text-xl font-semibold text-field-ink">
          FieldFile
        </span>
      </div>

      <div className="flex items-center gap-4">
        {properties.length > 0 && currentProperty && (
          <PropertySwitcher
            properties={properties}
            currentProperty={currentProperty}
            onPropertyChange={handlePropertyChange}
          />
        )}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
            },
          }}
        />
      </div>
    </header>
  );
}
