import { apiRequest } from "./client";

export interface QueueEntry {
  id: string;
  name: string;
  guests: number;
  notificationMethod: "sms" | "email";
  contact: string;
  hall: "AC" | "Main" | "VIP" | "Any";
  segment: "Front" | "Middle" | "Back" | "Any";
  position: number;
  estimatedWaitMinutes: number;
  joinedAt: Date;
  queueDate: string;
  notifiedAt5Min: boolean;
}

type QueueEntryWire = Omit<QueueEntry, "joinedAt"> & { joinedAt: string };

function fromWire(entry: QueueEntryWire): QueueEntry {
  return {
    ...entry,
    joinedAt: new Date(entry.joinedAt),
  };
}

function toWire(entry: QueueEntry): Omit<QueueEntryWire, "joinedAt"> {
  // backend sets joinedAt server-side; we omit it.
  const { joinedAt: _joinedAt, ...rest } = entry;
  return rest;
}

export async function fetchQueueEntries(queueDate?: string): Promise<QueueEntry[]> {
  const qs = queueDate ? `?queueDate=${encodeURIComponent(queueDate)}` : "";
  const res = await apiRequest<{ entries: QueueEntryWire[] }>(`/api/queue${qs}`);
  return res.entries.map(fromWire);
}

export async function joinQueue(entry: QueueEntry): Promise<QueueEntry> {
  const created = await apiRequest<QueueEntryWire>("/api/queue/join", {
    method: "POST",
    body: toWire(entry),
  });
  return fromWire(created);
}

export async function cancelQueueEntry(entryId: string): Promise<void> {
  await apiRequest<{ ok: true }>(`/api/queue/${encodeURIComponent(entryId)}`, { method: "DELETE" });
}

export async function updateQueueEntry(
  entryId: string,
  patch: { notifiedAt5Min?: boolean; estimatedWaitMinutes?: number },
): Promise<QueueEntry> {
  const updated = await apiRequest<QueueEntryWire>(`/api/queue/${encodeURIComponent(entryId)}`, {
    method: "PATCH",
    body: patch,
  });
  return fromWire(updated);
}
