import { enqueueEntry, removeQueued, getQueuedEntries } from "@/lib/offline-queue";
import type { QueuedEntry } from "@/lib/offline-queue";

// Shared submit path for both capture flows (photo evidence + drop a pin).
// Online → POST to the existing field-log route (reuses the Supabase Storage /
// Clerk upload path, no new server code). Offline or transient failure → queue
// to IndexedDB so the user's photo and note are never lost in the field.

export type SubmitResult = { status: "synced" | "queued" };

function buildForm(payload: Record<string, unknown>, photo: File | null): FormData {
  const form = new FormData();
  form.append("payload", JSON.stringify(payload));
  if (photo) form.append("photo", photo, photo.name);
  return form;
}

// 408/429 and 5xx are worth retrying later; other 4xx are real rejections
// (e.g. bad category, property not found) that requeuing would never fix.
function isTransient(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

async function postEntry(
  propertyId: string,
  payload: Record<string, unknown>,
  photo: File | null
): Promise<Response> {
  return fetch(`/api/properties/${propertyId}/field-log`, {
    method: "POST",
    body: buildForm(payload, photo),
  });
}

export async function submitFieldLogEntry(
  propertyId: string,
  payload: Record<string, unknown>,
  photo: File | null
): Promise<SubmitResult> {
  // Obviously offline — don't even attempt; queue straight away.
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    await enqueueEntry({ propertyId, payload, photo });
    return { status: "queued" };
  }

  let res: Response;
  try {
    res = await postEntry(propertyId, payload, photo);
  } catch {
    // Network failure (lost signal mid-request) — queue and move on.
    await enqueueEntry({ propertyId, payload, photo });
    return { status: "queued" };
  }

  if (res.ok) return { status: "synced" };

  if (isTransient(res.status)) {
    await enqueueEntry({ propertyId, payload, photo });
    return { status: "queued" };
  }

  // Permanent rejection — surface it to the UI rather than silently queueing
  // something that will never upload.
  const message =
    (await res.json().catch(() => null))?.error || "Failed to save entry";
  throw new Error(message);
}

// Attempt to upload everything in the queue, oldest first. Stops on the first
// transient failure (will retry on the next online/visibility event); drops
// permanently-rejected items so one bad row can't wedge the queue forever.
// Returns the number of entries successfully synced.
export async function flushQueue(): Promise<number> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return 0;

  const items = await getQueuedEntries();
  // Oldest first so entries upload in the order they were captured.
  items.reverse();

  let synced = 0;
  for (const item of items as QueuedEntry[]) {
    let res: Response;
    try {
      res = await postEntry(item.propertyId, item.payload, item.photo);
    } catch {
      break; // network died — stop, retry later
    }

    if (res.ok) {
      await removeQueued(item.localId);
      synced += 1;
    } else if (isTransient(res.status)) {
      break; // transient server issue — leave queued, stop for now
    } else {
      // Permanent rejection: drop it so it can't block the rest of the queue.
      // eslint-disable-next-line no-console
      console.warn(
        `Dropping un-syncable field-log entry ${item.localId} (HTTP ${res.status})`
      );
      await removeQueued(item.localId);
    }
  }
  return synced;
}
