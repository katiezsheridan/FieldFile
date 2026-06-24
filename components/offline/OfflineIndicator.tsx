"use client";

import { useOfflineSync } from "./OfflineSyncProvider";

// A small fixed status pill so the user always knows whether they're offline or
// have entries still waiting to upload — the trust signal the spec calls for.
// Renders nothing when online with an empty queue.
export function OfflineIndicator() {
  const { online, pending } = useOfflineSync();

  if (online && pending === 0) return null;

  const offline = !online;
  const label = offline
    ? pending > 0
      ? `Offline · ${pending} waiting to sync`
      : "Offline · changes saved on this device"
    : `Syncing ${pending} ${pending === 1 ? "entry" : "entries"}…`;

  return (
    <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={
          "pointer-events-auto flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-md border " +
          (offline
            ? "bg-field-ink text-field-cream border-field-ink"
            : "bg-white text-field-forest border-field-wheat")
        }
      >
        <span
          className={
            "inline-block h-2 w-2 rounded-full " +
            (offline ? "bg-field-gold" : "bg-field-forest animate-pulse")
          }
        />
        {label}
      </div>
    </div>
  );
}
