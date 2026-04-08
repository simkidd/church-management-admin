"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, CheckCircle } from "lucide-react";
import {
  useCertificateTemplates,
  useActivateCertificateTemplate,
  useDeleteCertificateTemplate,
} from "@/hooks/use-certificates";
import CertificateTemplateForm from "./CertificateTemplateForm";

export function CertificateTemplateManagement() {
  const { data, isLoading, isError } = useCertificateTemplates();
  const activateMutation = useActivateCertificateTemplate();
  const deleteMutation = useDeleteCertificateTemplate();

  const templates = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          Failed to load certificate templates.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No certificate templates created yet.
          </CardContent>
        </Card>
      ) : (
        templates.map((template) => (
          <Card key={template._id}>
            <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{template.name}</h3>
                  {template.isActive && <Badge>Active</Badge>}
                </div>

                <p className="text-sm text-muted-foreground">
                  {template.churchName}
                </p>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {template.signerName && (
                    <span>Signer: {template.signerName}</span>
                  )}
                  {template.signerTitle && (
                    <span>Title: {template.signerTitle}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(template.backgroundUrl, "_blank")}
                >
                  <Eye className="h-4 w-4" />
                  Preview Background
                </Button>

                <CertificateTemplateForm isEdit={true} initialValues={template}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </CertificateTemplateForm>

                {!template.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => activateMutation.mutate(template._id)}
                    disabled={activateMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Activate
                  </Button>
                )}

                {!template.isActive && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(template._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
