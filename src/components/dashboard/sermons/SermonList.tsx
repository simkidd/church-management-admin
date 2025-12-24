"use client";

import { getPaginationRange } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import useSermons from "@/hooks/useSermons";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { ISermon, ListSermonsParams } from "@/interfaces/sermon.interface";
import { sermonsApi } from "@/lib/api/sermon.api";
import { cn } from "@/lib/utils";
import { debounce } from "@/utils/helpers/debounce";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import {
  CalendarIcon,
  Edit,
  Mic,
  MoreHorizontal,
  Play,
  RefreshCw,
  Search,
  Trash2,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DeleteSermonDialog } from "./DeleteSermonDialog";
import { formatVideoDuration } from "@/utils/helpers/time";

const ActionComp = ({ sermon }: { sermon: ISermon }) => {
  const queryClient = useQueryClient();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    sermon: ISermon | null;
  }>({
    open: false,
    sermon: null,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sermonsApi.deleteSermon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSermons"] });
      toast.success("Success", {
        description: "Sermon deleted successfully",
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to delete sermon",
      });
    },
  });

  const handleDelete = (sermon: ISermon) => {
    setDeleteDialog({ open: true, sermon });
  };

  const confirmDelete = () => {
    if (deleteDialog.sermon) {
      deleteMutation.mutate(deleteDialog.sermon._id);
    }
    setDeleteDialog({ open: false, sermon: null });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => window.open(sermon.video.url, "_blank")}
          >
            <Play className="h-4 w-4 mr-2" />
            Watch
          </DropdownMenuItem>
          {sermon.audioUrl && (
            <DropdownMenuItem
              onClick={() => window.open(sermon.audioUrl!, "_blank")}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Listen
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={`/dashboard/sermons/${sermon._id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDelete(sermon)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteSermonDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, sermon: null })}
        onConfirm={confirmDelete}
        sermon={deleteDialog.sermon}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export function SermonList() {
  const [filters, setFilters] = useState<ListSermonsParams>({
    page: 1,
  });
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: filters.startDate ? new Date(filters.startDate) : undefined,
    to: filters.endDate ? new Date(filters.endDate) : undefined,
  });

  const { sermons, isPending, totalSermons, totalPages } = useSermons(filters);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setFilters((prev) => ({
          ...prev,
          search: searchValue.trim() || undefined,
          page: 1,
        }));
      }, 500), // 500ms delay
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleFilterChange = (newFilters: Partial<ListSermonsParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      handleFilterChange({ isPublished: undefined });
    } else {
      handleFilterChange({ isPublished: value === "true" });
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);

    if (range?.from && range?.to) {
      // Set time to start of day for from date and end of day for to date
      const fromDate = new Date(range.from);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(range.to);
      toDate.setHours(23, 59, 59, 999);

      handleFilterChange({
        startDate: fromDate.toISOString(),
        endDate: toDate.toISOString(),
      });
    } else {
      // No date range selected or incomplete range
      handleFilterChange({
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  const onPaginationChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleResetFilters = () => {
    setSearch("");
    setDateRange(undefined);
    setFilters({
      page: 1,
      limit: 10,
    });
    debouncedSearch.cancel();
  };

  const hasActiveFilters = useMemo(() => {
    const { page, limit, ...filterFields } = filters;
    return Object.values(filterFields).some(
      (value) => value !== undefined && value !== "" && value !== null
    );
  }, [filters]);

  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search sermons..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* Status Filter */}

              <Select
                value={
                  filters.isPublished === undefined
                    ? "all"
                    : filters.isPublished.toString()
                }
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Draft</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Picker */}

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 w-60 justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    className="rounded-lg border shadow-sm"
                  />
                </PopoverContent>
              </Popover>

              {/* Clear Filters Button */}
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
            {isPending ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `Sermons (${totalSermons})`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Table>
              <TableBody>
                {[...Array(5)].map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {[...Array(7)].map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !sermons || sermons.length === 0 ? (
            <EmptyState
              icon={Mic}
              title="No sermons found"
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
                  <TableHead>Title</TableHead>
                  <TableHead>Preacher</TableHead>
                  <TableHead>Date Preached</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sermons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No sermons found
                    </TableCell>
                  </TableRow>
                ) : (
                  sermons.map((sermon) => (
                    <TableRow key={sermon._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {sermon.thumbnail?.url && (
                            <Image
                              src={sermon.thumbnail.url}
                              alt={sermon.title}
                              className="w-10 h-10 rounded object-cover"
                              width={200}
                              height={200}
                            />
                          )}
                          <div>
                            <div className="font-medium">
                              <Link href={`/dashboard/sermons/${sermon._id}`}>
                                {sermon.title}
                              </Link>
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {sermon.scripture}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {sermon.preacher.firstName} {sermon.preacher.lastName}
                      </TableCell>
                      <TableCell>
                        {format(new Date(sermon.datePreached), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{sermon.views.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={sermon.isPublished ? "default" : "secondary"}
                        >
                          {sermon.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatVideoDuration(sermon.duration)}
                      </TableCell>
                      <TableCell>
                        <ActionComp sermon={sermon} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {sermons && sermons.length > 0 && (
          <CardFooter className="flex justify-between">
            {/* Pagination controls */}
            {sermons.length > 0 && totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onPaginationChange(filters.page - 1)}
                      aria-disabled={filters.page === 1}
                      className={cn(
                        "cursor-pointer",
                        filters.page === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>

                  {getPaginationRange(filters.page, totalPages).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === filters.page}
                        onClick={() => onPaginationChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => onPaginationChange(filters.page + 1)}
                      aria-disabled={filters.page >= totalPages}
                      className={cn(
                        "cursor-pointer",
                        filters.page >= totalPages &&
                          "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
