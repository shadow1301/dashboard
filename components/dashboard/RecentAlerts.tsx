"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert } from "@/types";

const severityConfig = {
  critical: { icon: AlertCircle, class: "text-error", bg: "bg-error/5 border-l-error" },
  warning: { icon: AlertTriangle, class: "text-warning", bg: "bg-warning/5 border-l-warning" },
  info: { icon: Info, class: "text-info", bg: "bg-info/5 border-l-info" },
};

type Props = {
  alerts?: Alert[];
  isLoading?: boolean;
};

export function RecentAlerts({ alerts, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!alerts?.length) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Alerts</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-foreground-muted text-sm">
            No alerts — your fleet is in good shape
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Alerts</CardTitle>
        <Link href="/alerts" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.slice(0, 5).map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <Link
              key={alert.id}
              href={`/fleet/${alert.vehicle_id}`}
              className={cn(
                "block border-l-2 pl-3 py-2 rounded-r-md hover:bg-surface-raised transition-colors",
                config.bg,
              )}
            >
              <div className="flex items-start gap-2">
                <Icon size={14} className={cn("mt-0.5 shrink-0", config.class)} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {alert.vehicle_id}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground-muted mt-0.5 line-clamp-1">{alert.type}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
