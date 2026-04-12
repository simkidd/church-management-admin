import { Button } from "@/components/ui/button";
import courseApi from "@/lib/api/course.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MaterialForm from "./MaterialForm";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Edit2,
  Eye,
  FileIcon,
  FileText,
  ImageIcon,
  Link2,
  Pencil,
  Trash,
  Trash2,
  DownloadIcon,
} from "lucide-react";
import { ILessonMaterial } from "@/interfaces/course.interface";

const LessonMaterials = ({
  lessonId,
  open,
}: {
  lessonId: string;
  open: boolean;
}) => {
  const { data, isPending } = useQuery({
    queryKey: ["lesson-materials", lessonId],
    queryFn: () => courseApi.getLessonMaterials(lessonId),
    enabled: open,
  });

  const materials = data?.data ?? [];

  return (
    <div className="rounded-xl border bg-muted/30 p-3 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Materials</p>

        <MaterialForm lessonId={lessonId}>
          <Button size="sm" variant="outline">
            Add Material
          </Button>
        </MaterialForm>
      </div>

      {/* Loading Skeleton */}
      {isPending && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="space-y-1">
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-2 w-20 bg-muted rounded" />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isPending && materials.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No materials yet.
          <br />
          <span className="text-xs">
            Upload PDFs, links, or files for this lesson
          </span>
        </div>
      )}

      {/* List */}
      {!isPending && materials.length > 0 && (
        <div className="space-y-2">
          {materials.map((mat) => (
            <MaterialItem key={mat._id} mat={mat} lessonId={lessonId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonMaterials;

const MaterialItem = ({
  mat,
  lessonId,
}: {
  mat: ILessonMaterial;
  lessonId: string;
}) => {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-background p-3 hover:shadow-sm transition">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="h-4 w-4 text-blue-500" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{mat.title}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {mat.file?.url && (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => window.open(mat.file?.url, "_blank")}
            >
              <Eye className="h-4 w-4" />
            </Button>

            {mat.isDownloadable && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => window.open(mat.file?.url, "_blank")}
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        <MaterialForm lessonId={lessonId} initialValues={mat}>
          <Button size="icon" variant="ghost">
            <Edit2 className="h-4 w-4" />
          </Button>
        </MaterialForm>

        <DeleteMaterial materialId={mat._id} lessonId={lessonId} />
      </div>
    </div>
  );
};

const DeleteMaterial = ({
  materialId,
  lessonId,
}: {
  materialId: string;
  lessonId: string;
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => courseApi.deleteMaterial(materialId),
    onSuccess: () => {
      toast.success("Material deleted");
      queryClient.invalidateQueries({
        queryKey: ["lesson-materials", lessonId],
      });
      queryClient.invalidateQueries({ queryKey: ["course-modules"] });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Material?</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
