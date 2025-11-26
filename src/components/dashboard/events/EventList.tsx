// components/dashboard/events/EventList.tsx
"use client";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import useEvents from "@/hooks/useEvents";
import { IEvent, ListEventsParams } from "@/interfaces/event.interface";
import { format } from "date-fns";
import {
  Calendar,
  Edit,
  Eye,
  MapPin,
  MoreHorizontal,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { debounce } from "@/utils/helpers/debounce";
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

export function EventList() {
  const router = useRouter();
  const [filters, setFilters] = useState<ListEventsParams>({
    page: 1,
    limit: 10,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    event: IEvent | null;
  }>({
    open: false,
    event: null,
  });

  const { events, totalEvents, totalPages, isPending, isError } =
    useEvents(filters);
  const [search, setSearch] = useState("");

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setFilters((prev) => ({
          ...prev,
          search: searchValue.trim() || undefined,
          page: 1,
        }));
      }, 500),
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleFilterChange = (key: string, value: string) => {
    if (key === "upcoming") {
      if (value === "all") {
        setFilters((prev) => ({
          ...prev,
          upcoming: undefined,
          past: undefined,
          page: 1,
        }));
      } else if (value === "true") {
        setFilters((prev) => ({
          ...prev,
          upcoming: true,
          past: undefined,
          page: 1,
        }));
      } else if (value === "false") {
        setFilters((prev) => ({
          ...prev,
          upcoming: undefined,
          past: true,
          page: 1,
        }));
      }
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
        page: 1,
      }));
    }
  };

  const onPaginationChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setSearch("");
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

  // Get the current filter value for display
  const getCurrentDateFilter = () => {
    if (filters.upcoming === true) return "true";
    if (filters.past === true) return "false";
    return "all";
  };

  if (isError) {
    return (
      <EmptyState
        icon={Calendar}
        title="Error Loading Events"
        description="There was an error loading the events. Please try again."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Select
                value={getCurrentDateFilter()}
                onValueChange={(value) => handleFilterChange("upcoming", value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="true">Upcoming</SelectItem>
                  <SelectItem value="false">Past</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  filters.requiresRegistration === undefined
                    ? "all"
                    : filters.requiresRegistration.toString()
                }
                onValueChange={(value) =>
                  handleFilterChange("requiresRegistration", value)
                }
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Registration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="true">Registration Required</SelectItem>
                  <SelectItem value="false">No Registration</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
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
              `Events (${totalEvents || events?.length})`
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <Table>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : events?.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No events found"
              description={
                hasActiveFilters
                  ? "Try adjusting your filters to see more results."
                  : "Get started by creating your first event."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button asChild>
                    <a href="/dashboard/events/create">Create Event</a>
                  </Button>
                )
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events?.map((event) => (
                  <EventRow
                    key={event._id}
                    event={event}
                    onEdit={() =>
                      router.push(`/dashboard/events/${event._id}/edit`)
                    }
                    onView={() => router.push(`/dashboard/events/${event._id}`)}
                    onDelete={() => setDeleteDialog({ open: true, event })}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {events && events.length > 0 && (
          <CardFooter className="flex justify-between">
            {/* Pagination controls */}
            {events.length > 0 && totalPages > 1 && (
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

      <DeleteEventDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, event: null })}
        event={deleteDialog.event}
      />
    </div>
  );
}

function EventRow({
  event,
  onEdit,
  onView,
  onDelete,
}: {
  event: IEvent;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isPast = endDate < new Date();
  const isRegistrationFull =
    event.requiresRegistration &&
    event.maxAttendees &&
    event.registeredUsers.length >= event.maxAttendees;

  const formatDateDisplay = () => {
    if (event.isMultiDay) {
      // For multi-day events: "Jun 15-17, 2024"
      if (
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()
      ) {
        return `${format(startDate, "MMM dd")} - ${format(
          endDate,
          "dd, yyyy"
        )}`;
      } else {
        return `${format(startDate, "MMM dd")} - ${format(
          endDate,
          "MMM dd, yyyy"
        )}`;
      }
    } else {
      // For single-day events: "Jun 15, 2024"
      return format(startDate, "MMM dd, yyyy");
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="w-[300px]">
          <div className="font-medium truncate" title={event.title}>
            {event.title}
          </div>
          <div
            className="text-sm text-muted-foreground truncate "
            title={event.description}
          >
            {event.description}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1 min-w-0 w-[180px]">
          <div className="flex items-center gap-1 text-sm truncate">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="truncate" title={formatDateDisplay()}>
              {formatDateDisplay()}
            </span>
          </div>
          <div
            className="text-xs text-muted-foreground truncate"
            title={event.time}
          >
            {event.time}
          </div>
        </div>
      </TableCell>
      <TableCell className="w-[200px]">
        <div className="flex items-center gap-1 text-sm min-w-0">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate" title={event.location}>
            {event.location}
          </span>
        </div>
      </TableCell>
      <TableCell className="w-[150px]">
        <div className="space-y-1">
          <Badge
            variant={event.requiresRegistration ? "default" : "secondary"}
            className="truncate max-w-full"
          >
            {event.requiresRegistration ? "Registration" : "Open"}
          </Badge>
          {event.requiresRegistration && (
            <div className="text-xs text-muted-foreground truncate">
              <Users className="h-3 w-3 inline mr-1 shrink-0" />
              <span>
                {event.registeredUsers?.length || 0}
                {event.maxAttendees && ` / ${event.maxAttendees}`}
                {isRegistrationFull && " (Full)"}
              </span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="w-[180px]">
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={isPast ? "secondary" : "default"}
            className="truncate"
          >
            {isPast ? "Past" : "Upcoming"}
          </Badge>
          <Badge
            variant={event.isPublished ? "default" : "secondary"}
            className="truncate"
          >
            {event.isPublished ? "Published" : "Draft"}
          </Badge>
          {event.isMultiDay && (
            <Badge variant="outline" className="truncate">
              Multi-Day
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4" />
              Edit Event
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} variant="destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
