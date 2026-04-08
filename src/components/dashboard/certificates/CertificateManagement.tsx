"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Copy, Download } from "lucide-react";
import { certificateApi } from "@/lib/api/certificate.api";
import { toast } from "sonner";
import { useCertificates } from "@/hooks/use-certificates";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

export function CertificateManagement() {
  const { data, isLoading, isError } = useCertificates();
  const [search, setSearch] = useState("");

  const certificates = data?.data ?? [];

  const filteredCertificates = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return certificates;

    return certificates.filter((item) => {
      return (
        item.recipientName.toLowerCase().includes(term) ||
        item.courseTitle.toLowerCase().includes(term) ||
        item.certificateNumber.toLowerCase().includes(term) ||
        item.verificationCode.toLowerCase().includes(term)
      );
    });
  }, [certificates, search]);

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied successfully");
  };

  const handleDownload = async (certificateId: string) => {
    try {
      const response =
        await certificateApi.getCertificateDownloadLink(certificateId);

      const url = response.data.certificateUrl;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error("Unable to open certificate");
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          Failed to load certificates.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by learner, course, certificate no, verification code"
          className="pl-9"
        />
      </div>

      <div className="grid gap-4">
        {filteredCertificates.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No certificates found.
            </CardContent>
          </Card>
        ) : (
          filteredCertificates.map((certificate) => (
            <Card key={certificate._id}>
              <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {certificate.recipientName}
                    </h3>
                    <Badge
                      variant={
                        certificate.status === "issued"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {certificate.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {certificate.courseTitle}
                  </p>

                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>Certificate No: {certificate.certificateNumber}</span>
                    <span>
                      Verification Code: {certificate.verificationCode}
                    </span>
                    <span>Issued: {formatDate(certificate.issuedAt)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(certificate.verificationCode)}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </Button>

                  {certificate.certificateUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(certificate.certificateUrl!, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={() => handleDownload(certificate._id)}
                  >
                    <Download className="h-4 w-4" />
                    Open Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
