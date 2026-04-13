"use client";

import dynamic from "next/dynamic";

const CensusLocationPicker = dynamic(() => import("./CensusLocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full flex items-center justify-center bg-field-mist rounded-lg border border-field-wheat">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-field-forest mx-auto mb-2"></div>
        <p className="text-field-ink/60 text-xs">Loading map…</p>
      </div>
    </div>
  ),
});

export default CensusLocationPicker;
