import EventEditComp from "@/components/dashboard/events/EventEditComp";
import React from "react";

const EventEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return <EventEditComp eventId={id} />;
};

export default EventEditPage;
