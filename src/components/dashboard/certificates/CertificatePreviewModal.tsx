"use client";

import { useEffect, useState } from "react";
import { Loader2, FileWarning } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { certificateApi } from "@/lib/api/certificate.api";
import type { ICertificateTemplate } from "@/interfaces/certificate.interface";

function CertificatePreviewModal({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ICertificateTemplate | null;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      if (!open || !template?._id) return;

      setIsLoading(true);
      setHasError(false);

      try {
        const blob = await certificateApi.previewTemplate(template._id);
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch {
        setHasError(true);
        setPreviewUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setPreviewUrl(null);
    };
  }, [open, template?._id]);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl! p-0 overflow-hidden">
        <div className="flex h-[90vh] flex-col">
          <DialogHeader className="border-b px-6 py-4 text-left">
            <DialogTitle>{template.name} Preview</DialogTitle>
            <DialogDescription>
              This is a rendered certificate preview using sample learner data.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 bg-muted/30 p-4">
            <div className="h-full overflow-hidden rounded-xl border bg-background">
              {isLoading ? (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Rendering certificate preview...
                  </p>
                </div>
              ) : hasError ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <FileWarning className="h-8 w-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium">Preview could not be loaded</p>
                    <p className="text-sm text-muted-foreground">
                      The template preview failed to render. Check the template
                      assets and try again.
                    </p>
                  </div>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="h-full w-full"
                  title={`${template.name} certificate preview`}
                />
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
            {previewUrl && (
              <Button asChild variant="outline">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in new tab
                </a>
              </Button>
            )}

            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CertificatePreviewModal;