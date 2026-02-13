import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@/api/notifications";

export type NotificationType = "success" | "pending" | "failed" | "info";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  createdAt: Date;
  isRead: boolean;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const STORAGE_KEY = "notifications.v1";

type PersistedNotification = Omit<AppNotification, "createdAt"> & { createdAt: string };

function isNotificationType(value: unknown): value is NotificationType {
  return value === "success" || value === "pending" || value === "failed" || value === "info";
}

function parsePersistedNotifications(raw: string | null): AppNotification[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;

    const result: AppNotification[] = [];
    for (const item of parsed) {
      const n = item as Partial<PersistedNotification>;
      if (typeof n.id !== "string") continue;
      if (!isNotificationType(n.type)) continue;
      if (typeof n.title !== "string") continue;
      if (typeof n.message !== "string") continue;
      if (typeof n.createdAt !== "string") continue;
      if (typeof n.isRead !== "boolean") continue;
      if (typeof n.referenceId !== "undefined" && typeof n.referenceId !== "string") continue;

      const date = new Date(n.createdAt);
      if (Number.isNaN(date.getTime())) continue;

      result.push({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        referenceId: n.referenceId,
        createdAt: date,
        isRead: n.isRead,
      });
    }

    return result;
  } catch {
    return null;
  }
}

function serializeNotifications(notifications: AppNotification[]): PersistedNotification[] {
  return notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function seedMockNotifications(): AppNotification[] {
  return [
    {
      id: "n-001",
      type: "pending",
      title: "Order Placed",
      message: "Your order has been placed and is awaiting confirmation.",
      referenceId: "ORD-1042",
      createdAt: hoursAgo(2),
      isRead: false,
    },
    {
      id: "n-002",
      type: "pending",
      title: "Order Being Prepared",
      message: "The kitchen has started preparing your order.",
      referenceId: "ORD-1042",
      createdAt: hoursAgo(1),
      isRead: false,
    },
    {
      id: "n-003",
      type: "success",
      title: "Out for Delivery",
      message: "Your order is out for delivery and will arrive soon.",
      referenceId: "ORD-1038",
      createdAt: hoursAgo(5),
      isRead: true,
    },
    {
      id: "n-004",
      type: "success",
      title: "Payment Successful",
      message: "Your payment was completed successfully.",
      referenceId: "PAY-7781",
      createdAt: hoursAgo(6),
      isRead: true,
    },
    {
      id: "n-005",
      type: "failed",
      title: "Payment Failed",
      message: "Payment failed. Please try again or use a different method.",
      referenceId: "PAY-7790",
      createdAt: hoursAgo(3),
      isRead: false,
    },
    {
      id: "n-006",
      type: "info",
      title: "Reservation Confirmed",
      message: "Your table reservation has been confirmed.",
      referenceId: "RES-2401 (Alex Johnson)",
      createdAt: hoursAgo(10),
      isRead: true,
    },
    {
      id: "n-007",
      type: "info",
      title: "Upcoming Reservation",
      message: "Reminder: You have a reservation scheduled for today.",
      referenceId: "RES-2405 (Alex Johnson)",
      createdAt: hoursAgo(0.5),
      isRead: false,
    },
  ];
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const stored = parsePersistedNotifications(localStorage.getItem(STORAGE_KEY));
    return stored && stored.length > 0 ? stored : seedMockNotifications();
  });

  useEffect(() => {
    let cancelled = false;
    fetchNotifications()
      .then((items) => {
        if (cancelled) return;
        if (items.length > 0) setNotifications(items);
      })
      .catch(() => {
        // keep local seed/storage if backend isn't running
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeNotifications(notifications)));
    } catch {
      // ignore storage errors (quota/private mode)
    }
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    markNotificationRead(id).catch(() => {
      // ignore; UI stays responsive
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markAllNotificationsRead().catch(() => {
      // ignore; UI stays responsive
    });
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0);
  }, [notifications]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      markAsRead,
      markAllAsRead,
      getUnreadCount,
    }),
    [notifications, markAsRead, markAllAsRead, getUnreadCount],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
