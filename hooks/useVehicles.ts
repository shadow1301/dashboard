"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Vehicle } from "@/types";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return res.json() as Promise<Vehicle[]>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${id}`);
      if (!res.ok) throw new Error("Vehicle not found");
      return res.json() as Promise<Vehicle>;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVehicleCount() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["vehicleCount"],
    queryFn: async () => {
      const cached = queryClient.getQueryData<Vehicle[]>(["vehicles"]);
      if (cached) return cached.length;
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data: Vehicle[] = await res.json();
      return data.length;
    },
    staleTime: 5 * 60 * 1000,
  });
}
