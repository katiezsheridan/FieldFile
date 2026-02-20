"use client";

import { useState } from "react";
import PropertySwitcher from "./PropertySwitcher";
import { demoProperties } from "@/lib/demo-data";
import { Property } from "@/lib/types";

export default function Header() {
  const [currentProperty, setCurrentProperty] = useState<Property>(
    demoProperties[0]
  );

  return (
    <header className="h-16 bg-white border-b border-field-wheat/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-field-forest">
          FieldFile
        </span>
      </div>

      <PropertySwitcher
        properties={demoProperties}
        currentProperty={currentProperty}
        onPropertyChange={setCurrentProperty}
      />
    </header>
  );
}
