export type EventStatus = "past" | "draft" | "upcoming";

export const EVENT_STATUS_META: Record<
  EventStatus,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  past: {
    label: "Past",
    className: "bg-muted/40 text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  draft: {
    label: "Draft",
    className:
      "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-500",
  },
  upcoming: {
    label: "Upcoming",
    className:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15",
    dot: "bg-primary",
  },
};
