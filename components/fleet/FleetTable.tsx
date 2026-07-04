"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
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
  const router = useRouter();

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.label}><Skeleton className="h-4 w-16" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.label}><Skeleton className="h-4 w-20" /></TableCell>
                ))}
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
    <div className="border border-border rounded-lg overflow-hidden">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((v) => {
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="px-4 py-2 text-xs text-foreground-faint border-t border-border">
        Showing {sorted.length} of {vehicles.length} vehicles
      </div>
    </div>
  );
}
