import { apiRequest } from "./client";

export interface Table {
  tableId: string;
  tableName: string;
  location: string;
  segment: string;
  capacity: number;
  isAvailable?: boolean;
}

export interface TableReservation {
  reservationId: string;
  userId: string;
  tableNumber: number;
  date: string;
  timeSlot: string;
  guests: number;
  location: string;
  segment: string;
  userName: string;
  userPhone: string;
  status: "Confirmed" | "Pending";
}

export interface WaitingQueueEntry {
  queueId: string;
  userId: string;
  date: string;
  timeSlot: string;
  guests: number;
  position: number;
  estimatedWait: string;
}

export async function fetchTables(): Promise<Table[]> {
  const res = await apiRequest<{ tables: Table[] }>("/api/tables");
  return res.tables;
}

export async function fetchReservations(userId?: string): Promise<TableReservation[]> {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const res = await apiRequest<{ reservations: TableReservation[] }>(`/api/reservations${qs}`);
  return res.reservations;
}

export async function createReservation(reservation: TableReservation): Promise<TableReservation> {
  return apiRequest<TableReservation>("/api/reservations", { method: "POST", body: reservation });
}

export async function deleteReservation(reservationId: string): Promise<void> {
  await apiRequest<{ ok: true }>(`/api/reservations/${encodeURIComponent(reservationId)}`, { method: "DELETE" });
}

export async function fetchReservationAvailability(params: {
  date: string;
  timeSlot: string;
  guests: number;
  location?: string;
  segment?: string;
}): Promise<{ tables: Table[]; showWaitingQueueOption: boolean }> {
  const qs = new URLSearchParams({
    date: params.date,
    timeSlot: params.timeSlot,
    guests: String(params.guests),
    location: params.location ?? "any",
    segment: params.segment ?? "any",
  });

  return apiRequest<{ tables: Table[]; showWaitingQueueOption: boolean }>(`/api/reservations/availability?${qs.toString()}`);
}

export async function fetchWaitingQueueEntries(userId?: string): Promise<WaitingQueueEntry[]> {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const res = await apiRequest<{ entries: WaitingQueueEntry[] }>(`/api/reservation-waiting-queue${qs}`);
  return res.entries;
}

export async function joinWaitingQueue(entry: {
  queueId: string;
  userId: string;
  date: string;
  timeSlot: string;
  guests: number;
}): Promise<WaitingQueueEntry> {
  return apiRequest<WaitingQueueEntry>("/api/reservation-waiting-queue", { method: "POST", body: entry });
}

export async function deleteWaitingQueueEntry(queueId: string): Promise<void> {
  await apiRequest<{ ok: true }>(`/api/reservation-waiting-queue/${encodeURIComponent(queueId)}`, { method: "DELETE" });
}
