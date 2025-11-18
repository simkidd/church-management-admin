"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Skeleton } from "../ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;
  pageCount: number;
  pageIndex: number;
  onPaginationChange: (page: number) => void;
}

export const getPaginationRange = (current: number, total: number) => {
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  if (total <= 5) {
    start = 1;
    end = total;
  } else {
    if (current <= 3) {
      end = 5;
    } else if (current >= total - 2) {
      start = total - 4;
    }
  }

  const range = [];
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  pageCount,
  pageIndex,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: {
        pageIndex,
        pageSize: 10, // Default, will be overridden by the Select component
      },
    },
  });

  // Convert to 1-based indexing for display
  const currentPage = pageIndex + 1;
  const totalPages = pageCount;

  return (
    <div className="space-y-8">
      <Table className="border rounded-md">
        <TableHeader className="bg-sidebar">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            // Skeleton loading state
            [...Array(5)].map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((column, colIndex) => (
                  <TableCell key={`skeleton-${rowIndex}-${colIndex}`}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {data.length > 0 && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPaginationChange(pageIndex - 1)}
                aria-disabled={pageIndex === 0}
                className={cn(
                  "cursor-pointer",
                  pageIndex === 0 && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>

            {getPaginationRange(currentPage, totalPages).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPaginationChange(page - 1)} // Convert back to 0-based index
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPaginationChange(pageIndex + 1)}
                aria-disabled={pageIndex >= totalPages - 1}
                className={cn(
                  "cursor-pointer",
                  pageIndex >= totalPages - 1 &&
                    "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
