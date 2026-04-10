/* eslint-disable react-hooks/set-state-in-effect */
// src/components/dashboard/certificates/CertificateTemplateForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { certificateApi } from "@/lib/api/certificate.api";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  ImageIcon,
  Loader2,
  Upload,
  X,
  PenTool,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ICertificateTemplate } from "@/interfaces/certificate.interface";

const templateFormSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  churchName: z.string().min(1, "Church name is required"),
  signerName: z.string().optional(),
  signerTitle: z.string().optional(),
  isActive: z.boolean(),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface CertificateTemplateFormProps {
  initialValues?: Partial<ICertificateTemplate>;
  children?: React.ReactNode;
  isEdit?: boolean;
}

const CertificateTemplateForm = ({
  children,
  initialValues,
  isEdit = false,
}: CertificateTemplateFormProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [headingFontFile, setHeadingFontFile] = useState<File | null>(null);
  const [bodyFontFile, setBodyFontFile] = useState<File | null>(null);
  const [nameFontFile, setNameFontFile] = useState<File | null>(null);

  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
    initialValues?.backgroundUrl || null,
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialValues?.logoUrl || null,
  );
  const [signaturePreview, setSignaturePreview] = useState<string | null>(
    initialValues?.signatureUrl || null,
  );

  const [removeBackground, setRemoveBackground] = useState(false);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeSignature, setRemoveSignature] = useState(false);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: initialValues?.name || "",
      churchName: initialValues?.churchName || "",
      signerName: initialValues?.signerName || "",
      signerTitle: initialValues?.signerTitle || "",
      isActive: initialValues?.isActive || false,
    },
  });

  const {
    getRootProps: getBackgroundRootProps,
    getInputProps: getBackgroundInputProps,
    isDragActive: isBackgroundDragActive,
  } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        toast.error(
          "Invalid background image. Use PNG, JPG, or WEBP up to 10MB.",
        );
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setBackgroundFile(file);
        setRemoveBackground(false);
      }
    },
  });

  const {
    getRootProps: getLogoRootProps,
    getInputProps: getLogoInputProps,
    isDragActive: isLogoDragActive,
  } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        toast.error("Invalid logo image. Use PNG, JPG, or WEBP up to 5MB.");
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setLogoFile(file);
        setRemoveLogo(false);
      }
    },
  });

  const {
    getRootProps: getSignatureRootProps,
    getInputProps: getSignatureInputProps,
    isDragActive: isSignatureDragActive,
  } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        toast.error(
          "Invalid signature image. Use PNG, JPG, or WEBP up to 5MB.",
        );
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setSignatureFile(file);
        setRemoveSignature(false);
      }
    },
  });

  const backgroundObjectUrl = useMemo(
    () => (backgroundFile ? URL.createObjectURL(backgroundFile) : null),
    [backgroundFile],
  );

  const logoObjectUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile],
  );

  const signatureObjectUrl = useMemo(
    () => (signatureFile ? URL.createObjectURL(signatureFile) : null),
    [signatureFile],
  );

  useEffect(() => {
    if (backgroundObjectUrl) {
      setBackgroundPreview(backgroundObjectUrl);
    } else if (!removeBackground) {
      setBackgroundPreview(initialValues?.backgroundUrl || null);
    } else {
      setBackgroundPreview(null);
    }

    return () => {
      if (backgroundObjectUrl) URL.revokeObjectURL(backgroundObjectUrl);
    };
  }, [backgroundObjectUrl, removeBackground, initialValues?.backgroundUrl]);

  useEffect(() => {
    if (logoObjectUrl) {
      setLogoPreview(logoObjectUrl);
    } else if (!removeLogo) {
      setLogoPreview(initialValues?.logoUrl || null);
    } else {
      setLogoPreview(null);
    }

    return () => {
      if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl);
    };
  }, [logoObjectUrl, removeLogo, initialValues?.logoUrl]);

  useEffect(() => {
    if (signatureObjectUrl) {
      setSignaturePreview(signatureObjectUrl);
    } else if (!removeSignature) {
      setSignaturePreview(initialValues?.signatureUrl || null);
    } else {
      setSignaturePreview(null);
    }

    return () => {
      if (signatureObjectUrl) URL.revokeObjectURL(signatureObjectUrl);
    };
  }, [signatureObjectUrl, removeSignature, initialValues?.signatureUrl]);

  const handleClose = () => {
    form.reset({
      name: initialValues?.name || "",
      churchName: initialValues?.churchName || "",
      signerName: initialValues?.signerName || "",
      signerTitle: initialValues?.signerTitle || "",
      isActive: initialValues?.isActive || false,
    });

    setBackgroundFile(null);
    setLogoFile(null);
    setSignatureFile(null);
    setBackgroundPreview(initialValues?.backgroundUrl || null);
    setLogoPreview(initialValues?.logoUrl || null);
    setSignaturePreview(initialValues?.signatureUrl || null);
    setHeadingFontFile(null);
    setBodyFontFile(null);
    setNameFontFile(null);
    setRemoveBackground(false);
    setRemoveLogo(false);
    setRemoveSignature(false);
    setOpen(false);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: FormData) =>
      certificateApi.createTemplate(payload),
    onSuccess: () => {
      toast.success("Certificate template created successfully");
      queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to create template", {
        description: error.response?.data?.message || "Please try again.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: FormData) =>
      certificateApi.updateTemplate(initialValues?._id as string, payload),
    onSuccess: () => {
      toast.success("Certificate template updated successfully");
      queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
      queryClient.invalidateQueries({
        queryKey: ["certificate-templates", "active"],
      });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to update template", {
        description: error.response?.data?.message || "Please try again.",
      });
    },
  });

  const onSubmit = (values: TemplateFormData) => {
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("churchName", values.churchName);
    formData.append("signerName", values.signerName || "");
    formData.append("signerTitle", values.signerTitle || "");
    formData.append("isActive", String(values.isActive));

    if (backgroundFile) {
      formData.append("background", backgroundFile);
    }

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    if (signatureFile) {
      formData.append("signature", signatureFile);
    }

    if (headingFontFile) {
      formData.append("headingFont", headingFontFile);
    }

    if (bodyFontFile) {
      formData.append("bodyFont", bodyFontFile);
    }

    if (nameFontFile) {
      formData.append("nameFont", nameFontFile);
    }

    if (isEdit && removeBackground) {
      formData.append("removeBackground", "true");
    }

    if (isEdit && removeLogo) {
      formData.append("removeLogo", "true");
    }

    if (isEdit && removeSignature) {
      formData.append("removeSignature", "true");
    }

    if (isEdit && initialValues?._id) {
      updateMutation.mutate(formData);
    } else {
      updateMutation.reset();
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (!value ? handleClose() : setOpen(value))}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className="sm:max-w-4xl! max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit Certificate Template"
              : "Create Certificate Template"}
          </DialogTitle>
          <DialogDescription>
            Upload the design assets used to render learner certificates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  Certificate Background
                </FieldLabel>

                {backgroundPreview ? (
                  <div className="relative aspect-[1.414/1] overflow-hidden rounded-lg border-2 border-dashed">
                    <Image
                      src={backgroundPreview}
                      alt="Certificate background preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7"
                      onClick={() => {
                        setBackgroundFile(null);
                        setBackgroundPreview(null);
                        if (isEdit && initialValues?.backgroundUrl) {
                          setRemoveBackground(true);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    {...getBackgroundRootProps()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      isBackgroundDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input {...getBackgroundInputProps()} />
                    <div className="flex aspect-[1.414/1] flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Upload background
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </Field>

              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Logo
                </FieldLabel>

                {logoPreview ? (
                  <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-dashed">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      className="object-contain p-4"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                        if (isEdit && initialValues?.logoUrl) {
                          setRemoveLogo(true);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    {...getLogoRootProps()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      isLogoDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input {...getLogoInputProps()} />
                    <div className="flex aspect-square flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Upload logo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </Field>

              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Signature
                </FieldLabel>

                {signaturePreview ? (
                  <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-dashed">
                    <Image
                      src={signaturePreview}
                      alt="Signature preview"
                      fill
                      className="object-contain p-4"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7"
                      onClick={() => {
                        setSignatureFile(null);
                        setSignaturePreview(null);
                        if (isEdit && initialValues?.signatureUrl) {
                          setRemoveSignature(true);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    {...getSignatureRootProps()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      isSignatureDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input {...getSignatureInputProps()} />
                    <div className="flex aspect-square flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Upload signature
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </Field>
            </div>

            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Template Name</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Classic Completion Certificate"
                    disabled={isLoading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="churchName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="churchName">Church Name</FieldLabel>
                  <Input
                    {...field}
                    id="churchName"
                    placeholder="Dominion City"
                    disabled={isLoading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="signerName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signerName">Signer Name</FieldLabel>
                    <Input
                      {...field}
                      id="signerName"
                      placeholder="Dr John Doe"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="signerTitle"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signerTitle">Signer Title</FieldLabel>
                    <Input
                      {...field}
                      id="signerTitle"
                      placeholder="Lead Pastor"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Heading Font */}
              <Field>
                <FieldLabel>Heading Font</FieldLabel>
                <Input
                  type="file"
                  accept=".ttf,.otf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setHeadingFontFile(file);
                  }}
                />
                <p className="text-xs text-muted-foreground">TTF or OTF</p>
              </Field>

              {/* Body Font */}
              <Field>
                <FieldLabel>Body Font</FieldLabel>
                <Input
                  type="file"
                  accept=".ttf,.otf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setBodyFontFile(file);
                  }}
                />
                <p className="text-xs text-muted-foreground">TTF or OTF</p>
              </Field>

              {/* Name Font */}
              <Field>
                <FieldLabel>Name (Script) Font</FieldLabel>
                <Input
                  type="file"
                  accept=".ttf,.otf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setNameFontFile(file);
                  }}
                />
                <p className="text-xs text-muted-foreground">TTF or OTF</p>
              </Field>
            </div>

            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
                  <Checkbox
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="isActive"
                      className="cursor-pointer text-sm font-semibold leading-none"
                    >
                      Set as active template
                    </label>
                    <p className="text-xs text-muted-foreground">
                      This template will be used for new certificate generation.
                    </p>
                  </div>
                </div>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Update Template" : "Create Template"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateTemplateForm;
