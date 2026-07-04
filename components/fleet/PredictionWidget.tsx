"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle } from "@/types";
import { calculateHealthScore, predictRemainingCycles } from "@/lib/predictions";

type Props = {
  vehicle?: Vehicle;
  isLoading?: boolean;
};

export function PredictionWidget({ vehicle, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  if (!vehicle) return null;

  const health = calculateHealthScore(vehicle);
  const remainingCycles = predictRemainingCycles(vehicle);
  const cyclesPerYear = vehicle.vehicle_age > 0
    ? vehicle.total_charging_cycle / vehicle.vehicle_age
    : vehicle.total_charging_cycle;
  const remainingYears = cyclesPerYear > 0
    ? (remainingCycles / cyclesPerYear).toFixed(1)
    : "N/A";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Remaining Useful Life</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-foreground-muted">Estimated remaining cycles</p>
            <p className="font-mono text-3xl font-bold text-foreground">
              {remainingCycles.toLocaleString()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-foreground-faint">Current health</p>
              <p className="font-mono text-lg font-semibold text-foreground">{health}%</p>
            </div>
            <div>
              <p className="text-xs text-foreground-faint">Estimated years remaining</p>
              <p className="font-mono text-lg font-semibold text-foreground">{remainingYears}</p>
            </div>
          </div>
          {health < 60 && (
            <div className="bg-health-critical/10 text-health-critical text-xs rounded-md px-3 py-2 font-medium">
              This battery has reached end-of-life threshold. Replacement recommended.
            </div>
          )}
          {health >= 60 && health < 80 && (
            <div className="bg-health-warning/10 text-health-warning text-xs rounded-md px-3 py-2 font-medium">
              This battery is approaching end-of-life. Plan for replacement within {remainingYears} years.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
