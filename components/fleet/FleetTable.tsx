"use client";

import { useMemo, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Vehicle, SortDirection } from "@/types";
import { calculateHealthScore } from "@/lib/predictions";

type Props = {
  vehicles: Vehicle[];
  isLoading?: boolean;
};

type SortKey = "vehicle_id" | "vehicle_model" | "battery_type" | "battery_capacity" | "vehicle_age" | "total_charging_cycle";

const columns: { key: SortKey; label: string; sortable: boolean }[] = [
  { key: "vehicle_id", label: "Vehicle ID", sortable: true },
  { key: "vehicle_model", label: "Model", sortable: true },
  { key: "battery_type", label: "Battery", sortable: true },
  { key: "battery_capacity", label: "Capacity", sortable: true },
  { key: "vehicle_age", label: "Age (yr)", sortable: true },
  { key: "total_charging_cycle", label: "Cycles", sortable: true },
  { key: "vehicle_id" as SortKey, label: "Health", sortable: false },
];

function getHealthBadge(score: number) {
  if (score >= 80) return { variant: "default" as const, label: `${score}%` };
  if (score >= 60) return { variant: "secondary" as const, label: `${score}%` };
  return { variant: "destructive" as const, label: `${score}%` };
}

export function FleetTable({ vehicles, isLoading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("vehicle_id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const router = useRouter();
  const queryClient = useQueryClient();

  const sorted = useMemo(() => {
    if (!vehicles?.length) return [];
    const sorted = [...vehicles];
    if (sortDir) {
      sorted.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return sorted;
  }, [vehicles, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil((sorted.length || 0) / pageSize));
  const displayed = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleDelete = async (vehicleId: string) => {
    setDeletingId(vehicleId);
    const res = await fetch(`/api/vehicles/${vehicleId}`, { method: "DELETE" });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["vehicleCount"] });
      toast.success("Vehicle deleted");
    } else {
      toast.error("Failed to delete vehicle");
    }
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.label}><Skeleton className="h-4 w-16" /></TableHead>
              ))}
              <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.label}><Skeleton className="h-4 w-20" /></TableCell>
                ))}
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!vehicles?.length) {
    return (
      <div className="border border-border rounded-lg p-12 text-center text-foreground-muted text-sm">
        No vehicles match your filters.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.label}
                className={cn(col.sortable && "cursor-pointer select-none")}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    sortKey === col.key && sortDir ? (
                      sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-30" />
                    )
                  )}
                </div>
              </TableHead>
            ))}
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayed.map((v) => {
            const health = calculateHealthScore(v);
            const badge = getHealthBadge(health);
            return (
              <TableRow
                key={v.vehicle_id}
                className="cursor-pointer hover:bg-surface-raised"
                onClick={() => router.push(`/fleet/${v.vehicle_id}`)}
              >
                <TableCell className="font-mono text-xs">{v.vehicle_id}</TableCell>
                <TableCell>{v.vehicle_model}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">{v.battery_type}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{v.battery_capacity} kWh</TableCell>
                <TableCell className="font-mono text-xs">{v.vehicle_age}</TableCell>
                <TableCell className="font-mono text-xs">{v.total_charging_cycle}</TableCell>
                <TableCell>
                  <Badge variant={badge.variant} className="font-mono text-xs">
                    {badge.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => router.push(`/fleet/${v.vehicle_id}?edit=true`)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" className="hover:text-error">
                            <Trash2 className="size-3.5" />
                          </Button>
                        }
                      />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete vehicle?</DialogTitle>
                          <DialogDescription>
                            Remove {v.vehicle_id} ({v.vehicle_model}) and its alerts. This cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            disabled={deletingId === v.vehicle_id}
                            onClick={() => handleDelete(v.vehicle_id)}
                          >
                            {deletingId === v.vehicle_id ? "Deleting..." : "Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-4 py-2 border-t border-border">
        <span className="text-xs text-foreground-faint">
          Showing {displayed.length} of {sorted.length} vehicles
        </span>
        {totalPages > 1 && (
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  text="Prev"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={cn(page <= 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <PaginationItem><PaginationEllipsis /></PaginationItem>
                    )}
                    <PaginationItem>
                      <Button
                        variant={p === page ? "outline" : "ghost"}
                        size="icon-sm"
                        className="size-8 text-xs"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    </PaginationItem>
                  </Fragment>
                ))}
              <PaginationItem>
                <PaginationNext
                  text="Next"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={cn(page >= totalPages && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
