import React, { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { NotificationCard } from "@/components/NotificationCard";
import { NotificationFilters, type NotificationFilter } from "@/components/NotificationFilters";
import { useNotifications } from "@/context/NotificationsContext";

function matchesFilter(filter: NotificationFilter, n: { type: string; isRead: boolean }) {
  switch (filter) {
    case "all":
      return true;
    case "unread":
      return !n.isRead;
    case "success":
    case "pending":
    case "failed":
    case "info":
      return n.type === filter;
    default:
      return true;
  }
}

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const unreadCount = getUnreadCount();

  const filtered = useMemo(() => {
    return [...notifications]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .filter((n) => matchesFilter(filter, n));
  }, [notifications, filter]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center border">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount} new notification{unreadCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="h-11 px-5 rounded-xl"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-7">
        <NotificationFilters value={filter} onChange={setFilter} />
      </div>

      {/* List */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="border rounded-xl bg-card p-10 text-center">
            <p className="text-lg font-semibold">No notifications</p>
            <p className="text-muted-foreground mt-1">You’re all caught up.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <NotificationCard key={n.id} notification={n} onMarkAsRead={markAsRead} />
          ))
        )}
      </div>
    </div>
  );
}
