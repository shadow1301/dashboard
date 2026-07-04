"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { direction: "up" | "down"; value: string };
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export function StatCard({ title, value, subtitle, trend, icon, onClick, className }: StatCardProps) {
  return (
    <Card
      className={cn("cursor-pointer hover:bg-surface-raised transition-colors", className)}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-foreground-muted">{title}</p>
            <p className="font-mono text-3xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-foreground-faint">{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                {trend.direction === "up" ? (
                  <TrendingUp size={14} className="text-health-good" />
                ) : (
                  <TrendingDown size={14} className="text-health-critical" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  trend.direction === "up" ? "text-health-good" : "text-health-critical",
                )}>
                  {trend.value}
                </span>
              </div>
            )}
          </div>
          {icon && <div className="text-foreground-muted">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-9 w-20 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}
