"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import PropertySwitcher from "./PropertySwitcher";
import Image from "next/image";
import { useProperties } from "@/lib/hooks";
import { Property } from "@/lib/types";

export default function Header() {
  const { user } = useUser();
  const { properties } = useProperties(user?.id);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (properties.length > 0 && !currentProperty) {
      setCurrentProperty(properties[0]);
    }
  }, [properties, currentProperty]);

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
            onPropertyChange={setCurrentProperty}
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
