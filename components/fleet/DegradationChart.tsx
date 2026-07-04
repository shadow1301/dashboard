"use client";

import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle } from "@/types";
import { calculateHealthScore } from "@/lib/predictions";
import { useChartColors } from "@/hooks/useChartColors";

type Props = {
  vehicle?: Vehicle;
  isLoading?: boolean;
};

export function DegradationChart({ vehicle, isLoading }: Props) {
  const colors = useChartColors();

  const data = useMemo(() => {
    if (!vehicle) return [];
    const health = calculateHealthScore(vehicle);
    const points = 20;
    const simulatedHealth = Array.from({ length: points }, (_, i) => {
      const cycle = Math.round((vehicle.total_charging_cycle / points) * (i + 1));
      const progress = (i + 1) / points;
      const simHealth = health + (100 - health) * Math.pow(1 - progress, 0.8);
      return { cycles: cycle, health: Math.round(simHealth * 10) / 10 };
    });
    return simulatedHealth;
  }, [vehicle]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-[280px] w-full" /></CardContent>
      </Card>
    );
  }

  if (!vehicle) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">State of Health vs Charging Cycles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="cycles" stroke={colors.fgFaint} tick={{ fontSize: 12 }} label={{ value: "Cycles", position: "bottom", offset: -4, style: { fill: colors.fgFaint, fontSize: 12 } }} />
              <YAxis domain={[60, 100]} stroke={colors.fgFaint} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: colors.surfaceInverse, color: colors.fgInverse, border: "none", borderRadius: "8px", fontSize: "13px" }}
                formatter={(value) => [`${value}%`, "Health"]}
              />
              <ReferenceLine y={80} stroke={colors.healthWarning} strokeDasharray="4 4" label={{ value: "Warning", position: "right", style: { fill: colors.healthWarning, fontSize: 11 } }} />
              <ReferenceLine y={60} stroke={colors.healthCritical} strokeDasharray="4 4" label={{ value: "Critical", position: "right", style: { fill: colors.healthCritical, fontSize: 11 } }} />
              <Line type="monotone" dataKey="health" stroke={colors.line} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
