// src/hooks/use-certificate.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { certificateApi } from "@/lib/api/certificate.api";
import { toast } from "sonner";
import {
  CreateCertificateTemplateDTO,
  UpdateCertificateTemplateDTO,
} from "@/interfaces/certificate.interface";

export const certificateKeys = {
  all: ["certificates"] as const,
  detail: (id: string) => ["certificates", id] as const,
  templates: ["certificate-templates"] as const,
  template: (id: string) => ["certificate-templates", id] as const,
  activeTemplate: ["certificate-templates", "active"] as const,
};

export const useCertificates = () => {
  return useQuery({
    queryKey: certificateKeys.all,
    queryFn: certificateApi.getCertificates,
  });
};

export const useCertificate = (certificateId: string) => {
  return useQuery({
    queryKey: certificateKeys.detail(certificateId),
    queryFn: () => certificateApi.getCertificateById(certificateId),
    enabled: !!certificateId,
  });
};

export const useCertificateTemplates = () => {
  return useQuery({
    queryKey: certificateKeys.templates,
    queryFn: certificateApi.getTemplates,
  });
};

export const useActiveCertificateTemplate = () => {
  return useQuery({
    queryKey: certificateKeys.activeTemplate,
    queryFn: certificateApi.getActiveTemplate,
  });
};

export const useCreateCertificateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) =>
      certificateApi.createTemplate(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Template created successfully");
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates });
      queryClient.invalidateQueries({
        queryKey: certificateKeys.activeTemplate,
      });
    },
  });
};

export const useUpdateCertificateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: FormData;
    }) => certificateApi.updateTemplate(templateId, payload),
    onSuccess: (response) => {
      toast.success(response.message || "Template updated successfully");
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates });
      queryClient.invalidateQueries({
        queryKey: certificateKeys.activeTemplate,
      });
    },
  });
};

export const useActivateCertificateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      certificateApi.activateTemplate(templateId),
    onSuccess: (response) => {
      toast.success(response.message || "Template activated successfully");
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates });
      queryClient.invalidateQueries({
        queryKey: certificateKeys.activeTemplate,
      });
    },
  });
};

export const useDeleteCertificateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      certificateApi.deleteTemplate(templateId),
    onSuccess: (response) => {
      toast.success(response.message || "Template deleted successfully");
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates });
      queryClient.invalidateQueries({
        queryKey: certificateKeys.activeTemplate,
      });
    },
  });
};
