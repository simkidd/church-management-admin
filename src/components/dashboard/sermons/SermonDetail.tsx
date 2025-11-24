"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorResponse, ApiResponse } from "@/interfaces/response.interface";
import { ISermon } from "@/interfaces/sermon.interface";
import { sermonsApi } from "@/lib/api/sermon.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  BookOpenCheckIcon,
  Calendar,
  Edit,
  Eye,
  MicIcon,
  Play,
  Trash2,
  User,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteSermonDialog } from "./DeleteSermonDialog";

interface SermonDetailProps {
  sermonId: string;
}

export function SermonDetail({ sermonId }: SermonDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery<ApiResponse<ISermon>>({
    queryKey: ["sermon", sermonId],
    queryFn: () => sermonsApi.getSermonById(sermonId),
    enabled: !!sermonId,
  });

  const sermon = data?.data;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sermonsApi.deleteSermon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSermons"] });
      toast.success("Success", {
        description: "Sermon deleted successfully",
      });
      router.push("/dashboard/sermons");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to delete sermon",
      });
    },
  });

  const handleBack = () => {
    router.push("/dashboard/sermons");
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sermon) {
      deleteMutation.mutate(sermon._id);
    }
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return <SermonDetailSkeleton />;
  }

  if (!sermon || error) {
    return (
      <EmptyState
        icon={MicIcon}
        title="Sermon Not Found"
        description="The sermon you're looking for doesn't exist."
        action={<Button onClick={handleBack}>Back to Sermons</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              {sermon.title}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Sermon details and information
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-end sm:justify-start">
          <Button asChild variant="outline">
            <Link href={`/dashboard/sermons/${sermonId}/edit`}>
              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Edit Sermon
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card>
            <CardHeader>
              <CardTitle>Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {sermon.video?.url ? (
                  <video
                    src={sermon.video.url}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No video available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {sermon.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {sermon.thumbnail?.url && !imageError ? (
                  <Image
                    src={sermon.thumbnail.url}
                    alt={sermon.title}
                    className="w-full h-full object-cover"
                    width={400}
                    height={225}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No thumbnail
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sermon Information */}
          <Card>
            <CardHeader>
              <CardTitle>Sermon Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Preacher</span>
                </div>
                <p className="font-medium">
                  {sermon.preacher.firstName} {sermon.preacher.lastName}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date Preached</span>
                </div>
                <p className="font-medium">
                  {format(new Date(sermon.datePreached), "MMMM dd, yyyy")}
                </p>
              </div>

              {sermon.scripture && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span> Scripture</span>
                  </div>
                  <p className="font-medium capitalize">{sermon.scripture}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Views</span>
                </div>
                <p className="font-medium">{sermon.views.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Status</span>
                </div>
                <Badge variant={sermon.isPublished ? "default" : "secondary"}>
                  {sermon.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {sermon.tags && sermon.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sermon.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(sermon.video?.url, "_blank")}
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Video
              </Button>

              {sermon.audioUrl && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(sermon.audioUrl!, "_blank")}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Listen to Audio
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteSermonDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        sermon={sermon}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function SermonDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-video w-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Description Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Thumbnail Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-video w-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Information Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
