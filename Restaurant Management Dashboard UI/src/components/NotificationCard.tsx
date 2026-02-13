import React, { useMemo } from "react";
import { CheckCircle2, Clock3, Info, XCircle } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { cn } from "@/app/components/ui/utils";
import type { AppNotification, NotificationType } from "@/context/NotificationsContext";

function typeLabel(type: NotificationType) {
  switch (type) {
    case "success":
      return "Success";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "info":
    default:
      return "Info";
  }
}

function typeIcon(type: NotificationType) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    case "pending":
      return <Clock3 className="w-5 h-5 text-amber-600" />;
    case "failed":
      return <XCircle className="w-5 h-5 text-destructive" />;
    case "info":
    default:
      return <Info className="w-5 h-5 text-muted-foreground" />;
  }
}

function typeBadgeClass(type: NotificationType) {
  switch (type) {
    case "success":
      return "bg-emerald-600 text-white border-transparent";
    case "pending":
      return "bg-amber-500 text-white border-transparent";
    case "failed":
      return "bg-destructive text-white border-transparent";
    case "info":
    default:
      return "bg-secondary text-foreground border-transparent";
  }
}

export function NotificationCard({
  notification,
  onMarkAsRead,
}: {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
}) {
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNowStrict(notification.createdAt, { addSuffix: true });
    } catch {
      return "";
    }
  }, [notification.createdAt]);

  const handleClick = () => {
    if (!notification.isRead) onMarkAsRead(notification.id);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "p-5 transition-colors cursor-pointer",
        notification.isRead ? "bg-card" : "bg-muted/40 border-primary/30",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="relative mt-0.5">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            notification.type === "success" && "bg-emerald-600/10",
            notification.type === "pending" && "bg-amber-500/10",
            notification.type === "failed" && "bg-destructive/10",
            notification.type === "info" && "bg-secondary",
          )}>
            {typeIcon(notification.type)}
          </div>
          {!notification.isRead && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary ring-2 ring-background" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cn("text-base font-semibold truncate", notification.isRead ? "text-foreground" : "text-foreground")}>
                {notification.title}
              </p>
              <p className={cn("text-sm mt-1", notification.isRead ? "text-muted-foreground" : "text-foreground/80")}>
                {notification.message}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={cn("rounded-full px-3 py-1", typeBadgeClass(notification.type))}>
                {typeLabel(notification.type)}
              </Badge>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground truncate">
              {notification.referenceId ? (
                <span className="truncate">{notification.referenceId}</span>
              ) : (
                <span className="truncate">&nbsp;</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground flex-shrink-0">{timeAgo}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
