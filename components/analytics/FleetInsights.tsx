"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb } from "lucide-react";
import type { Vehicle } from "@/types";
import { calculateHealthScore } from "@/lib/predictions";

type Props = {
  vehicles?: Vehicle[];
  isLoading?: boolean;
};

export function FleetInsights({ vehicles, isLoading }: Props) {
  const insights = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return null;

    const scores = vehicles.map(calculateHealthScore);
    const avgHealth = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    const byBattery: Record<string, number[]> = {};
    const byDriving: Record<string, number[]> = {};
    let bestBattery = "";
    let bestBatteryScore = 0;
    let bestDriving = "";
    let bestDrivingScore = 0;

    for (const v of vehicles) {
      const h = calculateHealthScore(v);
      if (!byBattery[v.battery_type]) byBattery[v.battery_type] = [];
      byBattery[v.battery_type].push(h);
      if (!byDriving[v.driving_style]) byDriving[v.driving_style] = [];
      byDriving[v.driving_style].push(h);
    }

    for (const [type, typeScores] of Object.entries(byBattery)) {
      const avg = Math.round(typeScores.reduce((a, b) => a + b, 0) / typeScores.length);
      if (avg > bestBatteryScore) {
        bestBatteryScore = avg;
        bestBattery = type;
      }
    }

    for (const [style, styleScores] of Object.entries(byDriving)) {
      const avg = Math.round(styleScores.reduce((a, b) => a + b, 0) / styleScores.length);
      if (avg > bestDrivingScore) {
        bestDrivingScore = avg;
        bestDriving = style;
      }
    }

    const highTemp = vehicles.filter((v) => v.avg_temp_c > 35);
    const tempImpact = highTemp.length > 0
      ? `Vehicles operating above 35°C average temperature have ${Math.round(calculateHealthScore(highTemp[0]))}% health on average`
      : "No vehicles exceed the 35°C temperature threshold";

    const highFastCharge = vehicles.filter((v) => v.fast_charge_ratio > 0.8);
    const fastChargeRatio = highFastCharge.length > 0
      ? `${Math.round((highFastCharge.length / vehicles.length) * 100)}% of vehicles have a fast-charge ratio above 80%, which accelerates degradation`
      : "Fast-charge ratios are within recommended limits across the fleet";

    return {
      avgHealth,
      totalFleet: vehicles.length,
      bestBattery,
      bestBatteryScore,
      bestDriving,
      bestDrivingScore,
      atRisk: scores.filter((s) => s < 60).length,
      tempImpact,
      fastChargeRatio,
    };
  }, [vehicles]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-5 w-48 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <Lightbulb className="size-4 text-warning" />
          Fleet Insights
        </div>
        <p className="text-sm text-foreground-muted leading-relaxed">
          Your fleet of {insights.totalFleet} vehicles shows an average health score of{" "}
          <span className="text-foreground font-medium">{insights.avgHealth}%</span>.
          {insights.bestBattery && (
            <> <span className="text-foreground font-medium">{insights.bestBattery}</span> batteries are the best-performing chemistry in your fleet, averaging{" "}
            <span className="text-foreground font-medium">{insights.bestBatteryScore}%</span> health.</>
          )}{" "}
          Driving style has a measurable impact —{" "}
          <span className="text-foreground font-medium capitalize">{insights.bestDriving}</span> drivers maintain the highest average health at{" "}
          <span className="text-foreground font-medium">{insights.bestDrivingScore}%</span>.{" "}
          {insights.atRisk > 0 && (
            <><span className="text-error font-medium">{insights.atRisk}</span> vehicles are at critical risk (below 60% health) and may need attention soon. </>
          )}
          {insights.tempImpact}. {insights.fastChargeRatio}.
        </p>
      </CardContent>
    </Card>
  );
}
