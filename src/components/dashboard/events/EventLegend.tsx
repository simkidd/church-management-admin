"use client";

import { EVENT_STATUS_META } from "@/utils/event-colors";

export function EventLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      {Object.entries(EVENT_STATUS_META).map(([key, meta]) => (
        <div key={key} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
          <span className="text-muted-foreground">{meta.label}</span>
        </div>
      ))}
    </div>
  );
}
