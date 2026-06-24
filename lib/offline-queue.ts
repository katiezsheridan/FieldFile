// Offline capture queue, backed by IndexedDB. When a field-log entry can't be
// uploaded (no signal, or a transient server error), we stash the metadata +
// the photo Blob here and flush it when connectivity returns. IndexedDB is used
// rather than localStorage because it stores binary Blobs natively and has room
// for many full-resolution field photos.
//
// No external dependency — a thin promise wrapper over the raw IDB API.

const DB_NAME = "fieldfile-offline";
const DB_VERSION = 1;
const STORE = "field-log-queue";

// Broadcast so the sync provider / list view can re-read the queue immediately
// after an enqueue or a successful flush.
export const QUEUE_CHANGED_EVENT = "fieldfile:queue-changed";

export type QueuedEntry = {
  localId: string;
  propertyId: string;
  // The same JSON metadata the POST route expects under the `payload` field.
  payload: Record<string, unknown>;
  // The processed (HEIC-converted/compressed) photo, or null for a pin-only entry.
  photo: File | null;
  queuedAt: string; // ISO — when it went into the queue
};

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "localId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

function notifyChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
  }
}

export async function enqueueEntry(
  entry: Omit<QueuedEntry, "localId" | "queuedAt">
): Promise<QueuedEntry> {
  if (!hasIndexedDb()) throw new Error("Offline storage unavailable");
  const record: QueuedEntry = {
    ...entry,
    localId:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `q_${Date.now()}_${Math.round(Math.random() * 1e9)}`,
    queuedAt: new Date().toISOString(),
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const r = tx(db, "readwrite").add(record);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
  db.close();
  notifyChanged();
  return record;
}

export async function getQueuedEntries(propertyId?: string): Promise<QueuedEntry[]> {
  if (!hasIndexedDb()) return [];
  const db = await openDb();
  const all = await new Promise<QueuedEntry[]>((resolve, reject) => {
    const r = tx(db, "readonly").getAll();
    r.onsuccess = () => resolve((r.result as QueuedEntry[]) || []);
    r.onerror = () => reject(r.error);
  });
  db.close();
  const filtered = propertyId
    ? all.filter((e) => e.propertyId === propertyId)
    : all;
  // Newest first, matching the server list order.
  return filtered.sort((a, b) => (a.queuedAt < b.queuedAt ? 1 : -1));
}

export async function removeQueued(localId: string): Promise<void> {
  if (!hasIndexedDb()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const r = tx(db, "readwrite").delete(localId);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
  db.close();
  notifyChanged();
}

export async function countQueued(): Promise<number> {
  if (!hasIndexedDb()) return 0;
  const db = await openDb();
  const n = await new Promise<number>((resolve, reject) => {
    const r = tx(db, "readonly").count();
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  db.close();
  return n;
}
