import CertificateTemplateForm from "@/components/dashboard/certificates/CertificateTemplateForm";
import { CertificateTemplateManagement } from "@/components/dashboard/certificates/CertificateTemplateManagement";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const CertificateTemplatesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Certificate Templates
          </h1>
          <p className="text-muted-foreground">
            Create, update and activate certificate designs
          </p>
        </div>

        <CertificateTemplateForm>
          <Button>
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </CertificateTemplateForm>
      </div>

      <CertificateTemplateManagement />
    </div>
  );
};

export default CertificateTemplatesPage;
