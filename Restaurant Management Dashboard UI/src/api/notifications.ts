import { apiRequest } from "@/api/client";
import type { AppNotification } from "@/context/NotificationsContext";

type ApiNotification = Omit<AppNotification, "createdAt"> & { createdAt: string };

function mapNotification(n: ApiNotification): AppNotification {
  return {
    ...n,
    createdAt: new Date(n.createdAt),
  };
}

export async function fetchNotifications(userId?: string): Promise<AppNotification[]> {
  const sp = new URLSearchParams();
  if (userId) sp.set("userId", userId);
  const res = await apiRequest<{ notifications: ApiNotification[] }>(
    `/api/notifications${sp.toString() ? `?${sp.toString()}` : ""}`,
  );
  return (res.notifications ?? []).map(mapNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiRequest<{ ok: boolean }>("/api/notifications/mark-read", {
    method: "POST",
    body: { id },
  });
}

export async function markAllNotificationsRead(userId?: string): Promise<void> {
  const sp = new URLSearchParams();
  if (userId) sp.set("userId", userId);
  await apiRequest<{ ok: boolean }>(
    `/api/notifications/mark-all-read${sp.toString() ? `?${sp.toString()}` : ""}`,
    {
      method: "POST",
    },
  );
}
