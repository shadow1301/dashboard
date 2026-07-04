"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAlerts } from "@/hooks/useAlerts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
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

  const displayAlerts = localAlerts || alerts;

  const filtered = useMemo(() => {
    if (!displayAlerts) return [];
    return displayAlerts.filter((a) => {
      if (severityFilter !== "all" && a.severity !== severityFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      return true;
    });
  }, [displayAlerts, severityFilter, statusFilter]);

  const markAsRead = (id: string) => {
    setLocalAlerts((prev) =>
      (prev || alerts || []).map((a) => (a.id === id ? { ...a, status: "read" as const } : a)),
    );
  };

  const dismiss = (id: string) => {
    setLocalAlerts((prev) =>
      (prev || alerts || []).map((a) => (a.id === id ? { ...a, status: "dismissed" as const } : a)),
    );
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
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as AlertSeverity | "all")}>
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
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AlertStatus | "all")}>
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
        <div className="border border-border rounded-lg overflow-hidden">
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
        <div className="border border-border rounded-lg overflow-hidden">
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
              {filtered.map((alert) => {
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
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(alert.id)} title="Mark as read">
                            <CheckCircle size={14} />
                          </Button>
                        )}
                        {alert.status !== "dismissed" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dismiss(alert.id)} title="Dismiss">
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
          <div className="px-4 py-2 text-xs text-foreground-faint border-t border-border">
            Showing {filtered.length} of {displayAlerts?.length || 0} alerts
          </div>
        </div>
      )}
    </div>
  );
}
