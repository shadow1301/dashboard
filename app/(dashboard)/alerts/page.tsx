"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAlerts } from "@/hooks/useAlerts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import type { AlertSeverity, AlertStatus } from "@/types";

const severityIcon = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const severityConfig = {
  critical: { class: "text-error", bg: "bg-error/5", badge: "destructive" as const },
  warning: { class: "text-warning", bg: "bg-warning/5", badge: "secondary" as const },
  info: { class: "text-info", bg: "bg-info/5", badge: "outline" as const },
};

export default function AlertsPage() {
  const { data: alerts, isLoading, error } = useAlerts();
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");
  const [localAlerts, setLocalAlerts] = useState<typeof alerts | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const displayAlerts = localAlerts || alerts;

  const filtered = useMemo(() => {
    if (!displayAlerts) return [];
    return displayAlerts.filter((a) => {
      if (severityFilter !== "all" && a.severity !== severityFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      return true;
    });
  }, [displayAlerts, severityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil((filtered.length || 0) / pageSize));
  const displayed = filtered.slice((page - 1) * pageSize, page * pageSize);

  const updateAlertStatus = async (id: string, status: "read" | "dismissed") => {
    setLocalAlerts((prev) =>
      (prev || alerts || []).map((a) => (a.id === id ? { ...a, status } : a)),
    );
    const res = await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setLocalAlerts(null);
      toast.error("Failed to update alert");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-error text-lg font-medium">Failed to load alerts</p>
        <p className="text-foreground-muted text-sm mt-1">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v as AlertSeverity | "all"); setPage(1); }}>
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as AlertStatus | "all"); setPage(1); }}>
          <SelectTrigger className="h-9 w-[130px] text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="border border-border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {["Severity", "Vehicle", "Type", "Description", "Timestamp", "Actions"].map((h) => (
                  <TableHead key={h}><Skeleton className="h-4 w-16" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center text-foreground-muted text-sm">
          No alerts match your filters.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((alert) => {
                const config = severityConfig[alert.severity];
                const Icon = severityIcon[alert.severity];
                return (
                  <TableRow key={alert.id} className={cn(alert.status === "unread" && "font-medium")}>
                    <TableCell>
                      <Badge variant={config.badge} className="flex items-center gap-1 w-fit">
                        <Icon size={10} /> {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/fleet/${alert.vehicle_id}`} className="font-mono text-xs text-primary hover:underline">
                        {alert.vehicle_id}
                      </Link>
                      <div className="text-xs text-foreground-faint">{alert.vehicle_model}</div>
                    </TableCell>
                    <TableCell className="text-sm">{alert.type}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-foreground-muted max-w-xs truncate">
                      {alert.description}
                    </TableCell>
                    <TableCell className="text-xs text-foreground-faint whitespace-nowrap">
                      {new Date(alert.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {alert.status === "unread" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateAlertStatus(alert.id, "read")} title="Mark as read">
                            <CheckCircle size={14} />
                          </Button>
                        )}
                        {alert.status !== "dismissed" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateAlertStatus(alert.id, "dismissed")} title="Dismiss">
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-2 border-t border-border">
            <span className="text-xs text-foreground-faint">
              Showing {displayed.length} of {filtered.length} alerts
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
      )}
    </div>
  );
}
