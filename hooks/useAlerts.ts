"use client";

import { useQuery } from "@tanstack/react-query";
import { getAlerts, getAlertsByVehicleId } from "@/lib/data";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlertsByVehicle(vehicleId: string) {
  return useQuery({
    queryKey: ["alerts", vehicleId],
    queryFn: () => getAlertsByVehicleId(vehicleId),
    enabled: !!vehicleId,
    staleTime: 5 * 60 * 1000,
  });
}
