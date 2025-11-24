import SermonEditComp from "@/components/dashboard/sermons/SermonEditComp";
import { SermonForm } from "@/components/dashboard/sermons/SermonForm";
import { sermonsApi } from "@/lib/api/sermon.api";
import React from "react";

const EditSermonPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <div>
      <SermonEditComp sermonId={id} />
    </div>
  );
};

export default EditSermonPage;
