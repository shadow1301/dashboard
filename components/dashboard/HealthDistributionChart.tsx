"use client";

import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle } from "@/types";
import { calculateHealthScore, getHealthBucket } from "@/lib/predictions";
import { useChartColors } from "@/hooks/useChartColors";

const bucketKeys = ["0-20", "21-40", "41-60", "61-80", "81-100"];

function getBucketColor(bucket: string, colors: ReturnType<typeof useChartColors>): string {
  if (bucket === "81-100") return colors.healthGood;
  if (bucket === "61-80" || bucket === "41-60") return colors.healthWarning;
  return colors.healthCritical;
}

type Props = {
  vehicles?: Vehicle[];
  isLoading?: boolean;
};

export function HealthDistributionChart({ vehicles, isLoading }: Props) {
  const colors = useChartColors();

  const data = useMemo(() => {
    if (!vehicles) return [];
    const buckets: Record<string, number> = {
      "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0,
    };
    for (const v of vehicles) {
      const score = calculateHealthScore(v);
      const bucket = getHealthBucket(score);
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    }
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [vehicles]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
      </Card>
    );
  }

  if (!vehicles?.length) {
    return (
      <Card>
        <CardHeader><CardTitle>Health Score Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-foreground-muted text-sm">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Health Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="range" stroke={colors.fgFaint} tick={{ fontSize: 12 }} />
              <YAxis stroke={colors.fgFaint} tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: colors.surfaceInverse, color: colors.fgInverse, border: "none", borderRadius: "8px", fontSize: "13px" }}
              />
              <Bar dataKey="count" name="Vehicles" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.range} fill={getBucketColor(entry.range, colors)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
