import React from "react";
import { cn } from "@/app/components/ui/utils";

export type NotificationFilter =
  | "all"
  | "unread"
  | "success"
  | "pending"
  | "failed"
  | "info";

const FILTERS: Array<{ id: NotificationFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "success", label: "Success" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
  { id: "info", label: "Info" },
];

export function NotificationFilters({
  value,
  onChange,
}: {
  value: NotificationFilter;
  onChange: (value: NotificationFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={cn(
              "h-9 px-4 rounded-full border text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-foreground border-border hover:bg-secondary/70",
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
