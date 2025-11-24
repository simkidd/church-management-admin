// hooks/useSermonView.ts
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { sermonsApi } from "@/lib/api/sermon.api";
import { useEffect, useRef } from "react";

export const useSermonView = (sermonId: string) => {
  const queryClient = useQueryClient();
  const hasTrackedRef = useRef(false);

  const trackViewMutation = useMutation({
    mutationFn: () => sermonsApi.trackView(sermonId), // Uses POST
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["sermon", sermonId] });
      queryClient.invalidateQueries({ queryKey: ["allSermons"] });
      queryClient.invalidateQueries({ queryKey: ["popularSermons"] });
    },
  });

  useEffect(() => {
    // Only run once per component mount
    if (hasTrackedRef.current) return;

    const viewKey = `viewed-${sermonId}`;
    const hasViewed = localStorage.getItem(viewKey);

    if (!hasViewed) {
      hasTrackedRef.current = true;
      trackViewMutation.mutate();
      localStorage.setItem(viewKey, "true");
    }
  }, [sermonId, trackViewMutation]);

  return { isTracking: trackViewMutation.isPending };
};