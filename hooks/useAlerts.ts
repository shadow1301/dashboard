"use client";

import { useQuery } from "@tanstack/react-query";
import type { Alert } from "@/types";

async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch("/api/alerts");
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlertsByVehicle(vehicleId: string) {
  return useQuery({
    queryKey: ["alerts", vehicleId],
    queryFn: async () => {
      const all = await fetchAlerts();
      return all.filter((a) => a.vehicle_id === vehicleId);
    },
    enabled: !!vehicleId,
    staleTime: 5 * 60 * 1000,
  });
}
