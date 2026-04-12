"use client";

import { getPaginationRange } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCertificates } from "@/hooks/use-certificates";
import { ICertificate } from "@/interfaces/certificate.interface";
import { cn } from "@/lib/utils";
import { debounce } from "@/utils/helpers/debounce";
import { format } from "date-fns";
import {
  Award,
  Copy,
  Download,
  Eye,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import CertificateViewer from "./CertificateViewer";

const ActionComp = ({
  certificate,
  onView,
}: {
  certificate: ICertificate;
  onView: (url: string) => void;
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Verification code copied");
  };

  const handleDownload = async (
    certificateId: string,
    certificateUrl?: string,
  ) => {
    if (!certificateUrl) {
      toast.error("Certificate URL not available");
      return;
    }

    setIsDownloading(true);

    const downloadPromise = (async () => {
      const response = await fetch(certificateUrl);

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `certificate-${certificate.certificateNumber || certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      return true;
    })();

    toast.promise(downloadPromise, {
      loading: "Downloading certificate...",
      success: () => {
        setIsDownloading(false);
        return "Certificate downloaded successfully! 🎓";
      },
      error: (error) => {
        setIsDownloading(false);
        console.error("Download error:", error);
        return "Failed to download certificate. Please try again.";
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handleCopy(certificate.verificationCode)}
        >
          <Copy className="h-4 w-4" />
          Copy Code
        </DropdownMenuItem>
        {certificate.certificateUrl && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onView(certificate.certificateUrl || "")}
          >
            <Eye className="h-4 w-4" />
            View Certificate
          </DropdownMenuItem>
        )}
        {certificate.certificateUrl && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() =>
              handleDownload(certificate._id, certificate.certificateUrl || "")
            }
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isDownloading ? "Downloading..." : "Download Certificate"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "issued":
      return <Badge variant="default">Issued</Badge>;
    case "revoked":
      return <Badge variant="destructive">Revoked</Badge>;
    case "expired":
      return <Badge variant="secondary">Expired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function CertificateManagement() {
  const { data, isLoading, isError, refetch } = useCertificates();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const itemsPerPage = 10;

  const certificates = data?.data ?? [];

  // Apply filters
  const filteredCertificates = useMemo(() => {
    let filtered = [...certificates];

    // Apply search filter
    if (searchInput.trim()) {
      const searchTerm = searchInput.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.recipientName?.toLowerCase().includes(searchTerm) ||
          item.courseTitle?.toLowerCase().includes(searchTerm) ||
          item.certificateNumber?.toLowerCase().includes(searchTerm) ||
          item.verificationCode?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered;
  }, [certificates, searchInput, statusFilter]);

  // Pagination
  const totalCertificates = filteredCertificates.length;
  const totalPages = Math.ceil(totalCertificates / itemsPerPage);
  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setSearchInput(searchValue);
        setCurrentPage(1);
      }, 500),
    [],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setStatusFilter("all");
    setCurrentPage(1);
    debouncedSearch.cancel();
  };

  const onPaginationChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewCertificate = (url: string) => {
    setViewerUrl(url);
    setViewerOpen(true);
  };

  const hasActiveFilters = searchInput || statusFilter !== "all";

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Failed to load certificates. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by learner, course, certificate no..."
                  className="pl-8"
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {isLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                `Certificates (${totalCertificates})`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Table>
                <TableBody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <TableRow key={`skeleton-${rowIndex}`}>
                      {[...Array(6)].map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : paginatedCertificates.length === 0 ? (
              <EmptyState
                icon={Award}
                title="No certificates found"
                description="Try adjusting your filters or search terms."
                action={
                  hasActiveFilters && (
                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset Filters
                    </Button>
                  )
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Certificate Number</TableHead>
                    <TableHead>Verification Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCertificates.map((certificate) => (
                    <TableRow key={certificate._id}>
                      <TableCell className="font-medium">
                        {certificate.recipientName}
                      </TableCell>
                      <TableCell>{certificate.courseTitle}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {certificate.certificateNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {certificate.verificationCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(certificate.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(certificate.issuedAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <ActionComp
                          certificate={certificate}
                          onView={handleViewCertificate}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {!isLoading && paginatedCertificates.length > 0 && totalPages > 1 && (
            <CardFooter className="flex justify-between">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onPaginationChange(currentPage - 1)}
                      aria-disabled={currentPage === 1}
                      className={cn(
                        "cursor-pointer",
                        currentPage === 1 && "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>

                  {getPaginationRange(currentPage, totalPages).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => onPaginationChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => onPaginationChange(currentPage + 1)}
                      aria-disabled={currentPage >= totalPages}
                      className={cn(
                        "cursor-pointer",
                        currentPage >= totalPages &&
                          "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Certificate Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-5xl! w-[90vw] h-[85vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-4 pt-0">
            <CertificateViewer url={viewerUrl} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
