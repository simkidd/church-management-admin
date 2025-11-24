"use client";

import { ApiResponse } from "@/interfaces/response.interface";
import { ISermon } from "@/interfaces/sermon.interface";
import { sermonsApi } from "@/lib/api/sermon.api";
import { useQuery } from "@tanstack/react-query";
import { SermonForm } from "./SermonForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { MicIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const SermonEditComp = ({ sermonId }: { sermonId: string }) => {
  const router = useRouter();

  const { data, isLoading, error } = useQuery<ApiResponse<ISermon>>({
    queryKey: ["sermon", sermonId],
    queryFn: () => sermonsApi.getSermonById(sermonId),
    enabled: !!sermonId,
  });

  const sermon = data?.data;

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!sermon || error) {
    return (
      <EmptyState
        icon={MicIcon}
        title="Sermon Not Found"
        description="The sermon you're looking for doesn't exist."
        action={<Button onClick={() => router.back()}>Go Back</Button>}
      />
    );
  }

  return <SermonForm sermon={sermon} isEdit={true} />;
};

export default SermonEditComp;
