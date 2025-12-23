"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MoreHorizontal, RefreshCw, Layers } from "lucide-react";
import { debounce } from "@/utils/helpers/debounce";
import useSeries from "@/hooks/useSeries";
import { ISeries, ListSeriesParams } from "@/interfaces/series.interface";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { getPaginationRange } from "@/components/shared/DataTable";

export default function SeriesList() {
  const [filters, setFilters] = useState<ListSeriesParams>({ page: 1 });
  const [search, setSearch] = useState("");

  const { series, totalSeries, totalPages, isPending } = useSeries(filters);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilters((prev) => ({
          ...prev,
          search: value || undefined,
          page: 1,
        }));
      }, 500),
    []
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      debouncedSearch(value.trim());
    },
    [debouncedSearch]
  );

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      setFilters((prev) => ({ ...prev, isPublished: undefined, page: 1 }));
    } else {
      setFilters((prev) => ({
        ...prev,
        isPublished: value === "true",
        page: 1,
      }));
    }
  };

  const handleFeaturedChange = (value: string) => {
    if (value === "all") {
      setFilters((prev) => ({ ...prev, isFeatured: undefined, page: 1 }));
    } else {
      setFilters((prev) => ({
        ...prev,
        isFeatured: value === "true",
        page: 1,
      }));
    }
  };

  const resetFilters = () => {
    setSearch("");
    setFilters({ page: 1, limit: 10 });
    debouncedSearch.cancel();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search series..."
              className="pl-8"
            />
          </div>

          <div className="flex gap-3">
            <Select
              value={
                filters.isPublished === undefined
                  ? "all"
                  : filters.isPublished.toString()
              }
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                filters.isFeatured === undefined
                  ? "all"
                  : filters.isFeatured.toString()
              }
              onValueChange={handleFeaturedChange}
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Normal</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isPending ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `Series (${totalSeries})`
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : series.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No series found"
              description="Try adjusting your filters"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {series.map((item: ISeries) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="flex gap-3 items-center">
                        {item.thumbnail?.url && (
                          <Image
                            src={item.thumbnail.url}
                            alt={item.title}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        )}
                        <Link
                          href={`/dashboard/series/${item._id}`}
                          className="font-medium hover:underline"
                        >
                          {item.title}
                        </Link>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={item.isPublished ? "default" : "secondary"}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {item.isFeatured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {item.createdBy.firstName} {item.createdBy.lastName}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/series/${item._id}`}>
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/series/${item._id}/edit`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))
                    }
                    className={cn(filters.page === 1 && "opacity-50")}
                  />
                </PaginationItem>

                {getPaginationRange(filters.page!, totalPages).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === filters.page}
                      onClick={() => setFilters((f) => ({ ...f, page: p }))}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
