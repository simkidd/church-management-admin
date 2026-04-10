"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useActivateCertificateTemplate,
  useCertificateTemplates,
  useDeleteCertificateTemplate,
} from "@/hooks/use-certificates";
import type { ICertificateTemplate } from "@/interfaces/certificate.interface";
import {
  CheckCircle,
  Eye,
  LayoutTemplate,
  Pencil,
  Trash2
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import CertificatePreviewModal from "./CertificatePreviewModal";
import CertificateTemplateForm from "./CertificateTemplateForm";

function TemplateCard({
  template,
  onPreview,
  onActivate,
  onDelete,
  isActivating,
  isDeleting,
}: {
  template: ICertificateTemplate;
  onPreview: (template: ICertificateTemplate) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  isActivating: boolean;
  isDeleting: boolean;
}) {
  const meta = useMemo(() => {
    const items = [];

    if (template.signerName) items.push(`Signer: ${template.signerName}`);
    if (template.signerTitle) items.push(`Title: ${template.signerTitle}`);
    if (template.logoUrl) items.push("Logo attached");
    if (template.signatureUrl) items.push("Signature attached");

    return items;
  }, [template]);

  return (
    <Card className="overflow-hidden border-border/60 transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
          <div className="border-b bg-muted/20 p-4 lg:border-b-0 lg:border-r">
            <div
              className="group relative aspect-[1.414/1] overflow-hidden rounded-xl border bg-background"
              role="button"
              tabIndex={0}
              onClick={() => onPreview(template)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onPreview(template);
              }}
            >
              <Image
                src={template.backgroundUrl}
                alt={template.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <Badge
                  variant={template.isActive ? "default" : "secondary"}
                  className="backdrop-blur-sm"
                >
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(template);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-5">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">{template.name}</h3>
                    {template.isActive && (
                      <Badge className="gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.churchName}
                  </p>
                </div>
              </div>

              {meta.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {meta.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No extra assets or signer details attached yet.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(template)}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>

              <CertificateTemplateForm isEdit initialValues={template}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </CertificateTemplateForm>

              {!template.isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onActivate(template._id)}
                  disabled={isActivating}
                >
                  <CheckCircle className="h-4 w-4" />
                  Activate
                </Button>
              )}

              {!template.isActive && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(template._id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CertificateTemplateManagement() {
  const { data, isLoading, isError } = useCertificateTemplates();
  const activateMutation = useActivateCertificateTemplate();
  const deleteMutation = useDeleteCertificateTemplate();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ICertificateTemplate | null>(null);

  const templates = data?.data ?? [];

  const handlePreview = (template: ICertificateTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Failed to load certificate templates.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-5">
        {templates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-14 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <LayoutTemplate className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    No certificate templates yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first certificate template to start issuing
                    branded course certificates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <TemplateCard
              key={template._id}
              template={template}
              onPreview={handlePreview}
              onActivate={(id) => activateMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
              isActivating={activateMutation.isPending}
              isDeleting={deleteMutation.isPending}
            />
          ))
        )}
      </div>

      <CertificatePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        template={selectedTemplate}
      />
    </>
  );
}
