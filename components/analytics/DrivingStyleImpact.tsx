"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle } from "@/types";
import { calculateHealthScore } from "@/lib/predictions";
import { useChartColors } from "@/hooks/useChartColors";

type Props = {
  vehicles?: Vehicle[];
  isLoading?: boolean;
};

export function DrivingStyleImpact({ vehicles, isLoading }: Props) {
  const router = useRouter();
  const colors = useChartColors();

  const data = useMemo(() => {
    if (!vehicles) return [];
    const groups: Record<string, number[]> = {};
    for (const v of vehicles) {
      if (!groups[v.driving_style]) groups[v.driving_style] = [];
      groups[v.driving_style].push(calculateHealthScore(v));
    }
    return Object.entries(groups).map(([drivingStyle, scores]) => ({
      drivingStyle: drivingStyle.charAt(0).toUpperCase() + drivingStyle.slice(1),
      drivingStyleRaw: drivingStyle,
      avgHealth: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length,
    }));
  }, [vehicles]);

  const handleBarClick = useCallback(
    (entry: { drivingStyle: string; drivingStyleRaw?: string }) => {
      const raw = entry.drivingStyleRaw || entry.drivingStyle.toLowerCase();
      router.push(`/fleet?drivingStyle=${encodeURIComponent(raw)}`);
    },
    [router],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-[250px]" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Health by Driving Style</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="drivingStyle" stroke={colors.fgFaint} tick={{ fontSize: 12 }} />
              <YAxis domain={[70, 100]} stroke={colors.fgFaint} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: colors.surfaceInverse, color: colors.fgInverse, border: "none", borderRadius: "8px", fontSize: "13px" }}
                formatter={(value) => [`${value}%`, "Avg Health"]}
              />
              <Bar
                dataKey="avgHealth"
                fill={colors.healthWarning}
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(entry) => handleBarClick(entry as unknown as { drivingStyle: string; drivingStyleRaw?: string })}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-foreground-faint mt-2 text-center">Click a bar to view filtered fleet</p>
        </div>
      </CardContent>
    </Card>
  );
}
