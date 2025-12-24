"use client";

import { z } from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { ISeries } from "@/interfaces/series.interface";
import { seriesApi } from "@/lib/api/series.api";
import { ArrowLeft, ImageIcon, Loader2, Upload, X } from "lucide-react";

const seriesSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

type SeriesFormValues = z.infer<typeof seriesSchema>;

interface SeriesFormProps {
  series?: ISeries;
  isEdit?: boolean;
}

export default function SeriesForm({
  series,
  isEdit = false,
}: SeriesFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      title: "",
      description: "",
      isPublished: true,
      isFeatured: false,
    },
  });

  /* ---------------- Populate Edit Mode ---------------- */
  useEffect(() => {
    if (series && isEdit) {
      form.reset({
        title: series.title,
        description: series.description || "",
        isPublished: series.isPublished,
        isFeatured: series.isFeatured,
      });

      if (series.thumbnail?.url) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThumbnailPreview(series.thumbnail.url);
      }
    }
  }, [series, isEdit, form]);

  /* ---------------- Thumbnail Upload ---------------- */
  const onThumbnailDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", {
        description: "Please upload a valid image",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Thumbnail must be under 10MB",
      });
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }, []);

  const thumbnailDropzone = useDropzone({
    onDrop: onThumbnailDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  /* ---------------- Mutations ---------------- */
  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      seriesApi.createSeries(data, (e) => {
        if (e.total) {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      }),
    onSuccess: () => {
      toast.success("Series created successfully");
      queryClient.invalidateQueries({ queryKey: ["allSeries"] });
      router.push("/dashboard/series");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to create series");
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      seriesApi.updateSeries(id, data),
    onSuccess: () => {
      toast.success("Series updated successfully");
      queryClient.invalidateQueries({ queryKey: ["allSeries"] });
      queryClient.invalidateQueries({ queryKey: ["series", series?._id] });
      router.push(`/dashboard/series/${series?._id}`);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update series");
    },
  });

  /* ---------------- Submit ---------------- */
  const onSubmit = async (values: SeriesFormValues) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    if (isEdit && series && !thumbnailFile && !thumbnailPreview) {
      formData.append("removeThumbnail", "true");
    }

    setIsUploading(true);

    if (isEdit && series) {
      await updateMutation.mutateAsync({ id: series._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Series" : "Create Series"}
          </h1>
          <p className="text-muted-foreground">
            Manage sermon series information
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main */}
            <Card className="lg:col-span-2">
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Series title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Series description"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Sidebar */}
            <Card>
              <CardContent className="space-y-6">
                {/* Thumbnail */}
                <div className="space-y-2">
                  <FormLabel>Thumbnail</FormLabel>
                  <div
                    {...thumbnailDropzone.getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 cursor-pointer",
                      thumbnailPreview && "border-primary"
                    )}
                  >
                    <input {...thumbnailDropzone.getInputProps()} />
                    {thumbnailPreview ? (
                      <div className="space-y-2">
                        <Image
                          src={thumbnailPreview}
                          alt="Thumbnail"
                          width={400}
                          height={300}
                          className="rounded object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setThumbnailFile(null);
                            setThumbnailPreview("");
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <p className="text-sm mt-2">
                          Drag & drop or click to upload
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-xs text-muted-foreground text-center">
                      Uploading...
                    </p>
                  </div>
                )}

                {/* Settings */}
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex justify-between border p-4 rounded-lg">
                      <div>
                        <FormLabel>Published</FormLabel>
                        <FormDescription>Make series visible</FormDescription>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex justify-between border p-4 rounded-lg">
                      <div>
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>Highlight this series</FormDescription>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Series"
              ) : (
                "Create Series"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
