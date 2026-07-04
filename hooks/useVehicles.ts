"use client";

import { useQuery } from "@tanstack/react-query";
import { getVehicles, getVehicleById, getVehicleCount } from "@/lib/data";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => getVehicleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVehicleCount() {
  return useQuery({
    queryKey: ["vehicleCount"],
    queryFn: getVehicleCount,
    staleTime: 5 * 60 * 1000,
  });
}
