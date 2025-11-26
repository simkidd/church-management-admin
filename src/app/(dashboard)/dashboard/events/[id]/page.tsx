import { EventDetail } from "@/components/dashboard/events/EventDetail";
import React from "react";

const EventPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <div>
      <EventDetail id={id} />
    </div>
  );
};

export default EventPage;
