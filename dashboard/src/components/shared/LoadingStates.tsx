"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableRowsSkeletonProps {
  columns: number;
  rowCount?: number;
}

export function TableRowsSkeleton({
  columns,
  rowCount = 5,
}: TableRowsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <TableCell key={columnIndex}>
              <Skeleton
                className={
                  columnIndex === 0
                    ? "h-5 w-[min(220px,80%)]"
                    : columnIndex === columns - 1
                      ? "ml-auto h-8 w-8 rounded-lg"
                      : "h-4 w-[min(130px,75%)]"
                }
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function ActionLoadingLabel({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-1 w-1 animate-pulse rounded-full bg-current"
            style={{ animationDelay: `${index * 150}ms` }}
          />
        ))}
      </span>
      {label}
    </span>
  );
}

interface TableLoadingProps {
  title?: string;
  description?: string;
  columns: string[];
  rowCount?: number;
  showSearch?: boolean;
  showActionButton?: boolean;
}

export function TableLoading({
  description,
  columns,
  rowCount = 5,
  showSearch = true,
  showActionButton = true,
}: TableLoadingProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          {description && <Skeleton className="h-4 w-64" />}
        </div>
        {showActionButton && <Skeleton className="h-10 w-32" />}
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
          <Skeleton className="h-10 w-full md:w-[300px]" />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(rowCount)].map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    {colIndex === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-md" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ) : colIndex === columns.length - 1 ? (
                      <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                    ) : (
                      <Skeleton className="h-4 w-32" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface FormLoadingProps {
  title?: string;
  fieldCount?: number;
}

export function FormLoading({
  fieldCount = 6,
}: FormLoadingProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-9 w-64" />
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 space-y-6">
          <Skeleton className="h-6 w-48 mb-4" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(fieldCount)].map((_, i) => (
              <div key={i} className={i % 3 === 0 ? "md:col-span-2" : ""}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardLoadingProps {
  cardCount?: number;
}

export function DashboardLoading({ cardCount = 4 }: DashboardLoadingProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-9 w-64" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(cardCount)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-lg border bg-card p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="col-span-3 rounded-lg border bg-card p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
