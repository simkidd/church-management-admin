export interface ICertificate {
  _id: string;
  user:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };
  course:
    | string
    | {
        _id: string;
        title?: string;
      };
  enrollment: string;
  recipientName: string;
  courseTitle: string;
  certificateNumber: string;
  verificationCode: string;
  certificateUrl?: string | null;
  status: "issued" | "revoked";
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICertificateTemplate {
  _id: string;
  name: string;
  churchName: string;
  backgroundUrl: string;
  signatureUrl: string | null;
  signerName: string | null;
  signerTitle: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificateTemplateDTO {
  name: string;
  churchName: string;
  backgroundUrl: string;
  signatureUrl?: string | null;
  signerName?: string | null;
  signerTitle?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateCertificateTemplateDTO extends Partial<CreateCertificateTemplateDTO> {
  _id?: string;
}
