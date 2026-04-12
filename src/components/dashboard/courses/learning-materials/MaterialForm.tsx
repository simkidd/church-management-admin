"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ApiErrorResponse } from "@/interfaces/response.interface";
import { ILessonMaterial } from "@/interfaces/course.interface";
import z from "zod";
import courseApi from "@/lib/api/course.api";

interface MaterialFormProps {
  lessonId: string;
  children: React.ReactNode;
  initialValues?: ILessonMaterial;
}

const materialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  isDownloadable: z.boolean(),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;

const MaterialForm = ({
  lessonId,
  children,
  initialValues,
}: MaterialFormProps) => {
  const isEdit = !!initialValues;

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: "",
      isDownloadable: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.reset({
          title: initialValues.title,
          isDownloadable: initialValues.isDownloadable,
        });
      } else {
        form.reset({
          title: "",
          isDownloadable: false,
        });
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFile(null);
    }
  }, [initialValues, open]);

  // ✅ DROPZONE
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: MaterialFormValues) => {
      const formData = new FormData();

      formData.append("lesson", lessonId);
      formData.append("title", values.title);
      formData.append("isDownloadable", String(values.isDownloadable));

      if (file) formData.append("file", file);

      if (isEdit) {
        return courseApi.updateMaterial(initialValues._id, formData);
      }

      return courseApi.createMaterial(formData);
    },

    onSuccess: () => {
      toast.success(isEdit ? "Material updated" : "Material created");

      queryClient.invalidateQueries({
        queryKey: ["lesson-materials", lessonId],
      });

      queryClient.invalidateQueries({ queryKey: ["course-modules"] });

      setOpen(false);
      setFile(null);
      form.reset();
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed", {
        description: error.response?.data?.message,
      });
    },
  });

  const onSubmit = (values: MaterialFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Material" : "Add Material"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* TITLE */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              {/* Existing file */}
              {isEdit && initialValues?.file?.url && !file && (
                <div className="text-xs text-muted-foreground">
                  Current file:{" "}
                  <button
                    type="button"
                    className="underline"
                    onClick={() =>
                      window.open(initialValues.file!.url, "_blank")
                    }
                  >
                    View file
                  </button>
                </div>
              )}

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className="border-dashed border rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition"
              >
                <input {...getInputProps()} />

                {file ? (
                  <p className="text-sm font-medium">{file.name}</p>
                ) : isDragActive ? (
                  <p>Drop file here...</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Drag & drop file, or click to upload
                  </p>
                )}
              </div>
            </div>

            {/* DOWNLOAD */}
            <FormField
              control={form.control}
              name="isDownloadable"
              render={({ field }) => (
                <FormItem className="flex justify-between items-center border p-3 rounded">
                  <FormLabel>Allow Download</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit">
              {mutation.isPending
                ? "Saving..."
                : isEdit
                  ? "Update Material"
                  : "Create Material"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialForm;
