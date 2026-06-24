"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { countQueued, QUEUE_CHANGED_EVENT } from "@/lib/offline-queue";
import { flushQueue } from "@/lib/field-log-submit";

type OfflineSyncState = {
  online: boolean;
  pending: number;
  flush: () => void;
};

const OfflineSyncContext = createContext<OfflineSyncState>({
  online: true,
  pending: 0,
  flush: () => {},
});

export const useOfflineSync = () => useContext(OfflineSyncContext);

// Owns the offline/online + pending-count state and drains the capture queue
// whenever connectivity returns or the app regains focus. Sync runs in the
// foreground (not the Background Sync API, which iOS Safari lacks), so it's
// reliable across the iPhones landowners actually carry.
export function OfflineSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const flushingRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      setPending(await countQueued());
    } catch {
      /* IndexedDB unavailable — leave count as-is */
    }
  }, []);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    flushingRef.current = true;
    try {
      await flushQueue();
    } catch {
      /* swallow — items stay queued for the next attempt */
    } finally {
      flushingRef.current = false;
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    setOnline(navigator.onLine);
    refresh();
    flush();

    const onOnline = () => {
      setOnline(true);
      flush();
    };
    const onOffline = () => setOnline(false);
    const onQueueChanged = () => refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refresh();
        flush();
      }
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener(QUEUE_CHANGED_EVENT, onQueueChanged);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener(QUEUE_CHANGED_EVENT, onQueueChanged);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [flush, refresh]);

  return (
    <OfflineSyncContext.Provider value={{ online, pending, flush }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}
