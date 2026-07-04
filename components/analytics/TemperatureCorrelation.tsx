"use client";

import { useMemo } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle } from "@/types";
import { calculateHealthScore } from "@/lib/predictions";
import { useChartColors } from "@/hooks/useChartColors";

type Props = {
  vehicles?: Vehicle[];
  isLoading?: boolean;
};

export function TemperatureCorrelation({ vehicles, isLoading }: Props) {
  const colors = useChartColors();

  const scatterColors: Record<string, string> = useMemo(() => ({
    LFP: colors.healthGood,
    NMC: colors.primary,
    NCA: colors.healthCritical,
  }), [colors]);

  const data = useMemo(() => {
    if (!vehicles) return [];
    const groups: Record<string, { temp: number; health: number }[]> = {};
    for (const v of vehicles) {
      if (!groups[v.battery_type]) groups[v.battery_type] = [];
      groups[v.battery_type].push({ temp: Math.round(v.avg_temp_c), health: calculateHealthScore(v) });
    }
    return Object.entries(groups).map(([batteryType, points]) => ({
      batteryType,
      points: points.slice(0, 500),
    }));
  }, [vehicles]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-[300px]" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Temperature vs Health Correlation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="temp" name="Temperature" unit="°C" stroke={colors.fgFaint} tick={{ fontSize: 12 }} domain={[-15, 55]} />
              <YAxis dataKey="health" name="Health" unit="%" domain={[70, 105]} stroke={colors.fgFaint} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: colors.surfaceInverse, color: colors.fgInverse, border: "none", borderRadius: "8px", fontSize: "13px" }}
                formatter={(value) => [`${value}`, "Value"]}
              />
              <Legend />
              {data.map((group) => (
                <Scatter key={group.batteryType} name={group.batteryType} data={group.points} fill={scatterColors[group.batteryType] || colors.primary} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
