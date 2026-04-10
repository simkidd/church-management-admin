import { CertificateManagement } from "@/components/dashboard/certificates/CertificateManagement";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import Link from "next/link";
import React from "react";

const CertificatesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">
            Manage issued course certificates and verification records
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/dashboard/certificates/templates">
            <Award className="h-4 w-4" />
            Manage Templates
          </Link>
        </Button>
      </div>

      <CertificateManagement />
    </div>
  );
};

export default CertificatesPage;
