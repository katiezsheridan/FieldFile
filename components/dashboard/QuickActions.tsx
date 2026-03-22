"use client";

export function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-field-wheat p-6">
      <h3 className="text-sm font-medium text-field-earth mb-4">Quick Actions</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          className="flex-1 px-4 py-3 bg-field-forest text-white font-medium rounded-lg hover:bg-field-forest/90 transition-colors focus:outline-none focus:ring-2 focus:ring-field-forest/40 focus:ring-offset-2"
        >
          Upload Evidence
        </button>
        <button
          type="button"
          className="flex-1 px-4 py-3 bg-field-hero text-white font-medium rounded-lg hover:bg-field-hero/90 transition-colors focus:outline-none focus:ring-2 focus:ring-field-hero/40 focus:ring-offset-2"
        >
          Get Help
        </button>
      </div>
    </div>
  );
}
