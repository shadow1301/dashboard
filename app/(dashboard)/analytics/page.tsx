"use client";

import { useVehicles } from "@/hooks/useVehicles";
import { FleetInsights } from "@/components/analytics/FleetInsights";
import { BatteryTypeComparison } from "@/components/analytics/BatteryTypeComparison";
import { DrivingStyleImpact } from "@/components/analytics/DrivingStyleImpact";
import { TemperatureCorrelation } from "@/components/analytics/TemperatureCorrelation";

export default function AnalyticsPage() {
  const { data: vehicles, isLoading, error } = useVehicles();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-error text-lg font-medium">Failed to load analytics data</p>
        <p className="text-foreground-muted text-sm mt-1">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FleetInsights vehicles={vehicles} isLoading={isLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BatteryTypeComparison vehicles={vehicles} isLoading={isLoading} />
        <DrivingStyleImpact vehicles={vehicles} isLoading={isLoading} />
      </div>
      <TemperatureCorrelation vehicles={vehicles} isLoading={isLoading} />
    </div>
  );
}
