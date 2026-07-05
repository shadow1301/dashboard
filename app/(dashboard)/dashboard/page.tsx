"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVehicles } from "@/hooks/useVehicles";
import { useAlerts } from "@/hooks/useAlerts";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/StatCard";
import { HealthDistributionChart } from "@/components/dashboard/HealthDistributionChart";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { calculateHealthScore } from "@/lib/predictions";
import { Truck, AlertTriangle, Activity, Battery, Upload } from "lucide-react";

export default function DashboardPage() {
  const { data: vehicles, isLoading: vLoading, error: vError } = useVehicles();
  const { data: alerts, isLoading: aLoading } = useAlerts();
  const router = useRouter();

  const stats = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return null;
    const scores = vehicles.map(calculateHealthScore);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const atRisk = scores.filter((s) => s < 60).length;
    const degradationRates = vehicles.map((v) => {
      const health = calculateHealthScore(v);
      return v.vehicle_age > 0 ? ((100 - health) / v.vehicle_age) : 0;
    });
    const avgDegradation = degradationRates.reduce((a, b) => a + b, 0) / degradationRates.length;

    return { total: vehicles.length, avgHealth: Math.round(avg), atRisk, avgDegradation: avgDegradation.toFixed(1) };
  }, [vehicles]);

  if (vError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-error text-lg font-medium">Failed to load fleet data</p>
        <p className="text-foreground-muted text-sm mt-1">Please try again later.</p>
      </div>
    );
  }

  if (!vLoading && vehicles && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Upload className="size-16 text-foreground-faint mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No fleet data yet</h2>
        <p className="text-foreground-muted mb-6 max-w-sm">
          Upload a CSV file with your vehicle battery data to get started with health monitoring and analytics.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Upload className="size-4" />
          Upload your first file
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {vLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatCard
              title="Total Vehicles"
              value={stats.total.toLocaleString()}
              icon={<Truck size={20} />}
              onClick={() => router.push("/fleet")}
            />
            <StatCard
              title="Average Health"
              value={`${stats.avgHealth}%`}
              icon={<Activity size={20} />}
              trend={stats.avgHealth > 85 ? { direction: "up", value: "Good" } : { direction: "down", value: "Needs attention" }}
            />
            <StatCard
              title="At Risk"
              value={stats.atRisk.toLocaleString()}
              subtitle={`vehicles below 60% health`}
              icon={<AlertTriangle size={20} />}
              trend={stats.atRisk > 0 ? { direction: "down", value: "Needs attention" } : { direction: "up", value: "All clear" }}
              onClick={() => router.push("/alerts")}
            />
            <StatCard
              title="Avg Degradation"
              value={`${stats.avgDegradation}%/yr`}
              icon={<Battery size={20} />}
              trend={parseFloat(stats.avgDegradation) > 2 ? { direction: "down", value: "Above average" } : { direction: "up", value: "Below average" }}
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthDistributionChart vehicles={vehicles} isLoading={vLoading} />
        </div>
        <RecentAlerts alerts={alerts} isLoading={aLoading} />
      </div>
    </div>
  );
}
