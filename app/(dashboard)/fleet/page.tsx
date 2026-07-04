"use client";

import { useMemo, useState } from "react";
import { useVehicles } from "@/hooks/useVehicles";
import { FleetTable } from "@/components/fleet/FleetTable";
import { FleetFilters } from "@/components/fleet/FleetFilters";
import type { FleetFilters as FleetFiltersType } from "@/types";

export default function FleetPage() {
  const { data: vehicles, isLoading, error } = useVehicles();
  const [filters, setFilters] = useState<FleetFiltersType>({
    search: "",
    batteryType: "all",
    drivingStyle: "all",
    healthMin: 0,
    healthMax: 100,
  });

  const filtered = useMemo(() => {
    if (!vehicles) return [];
    return vehicles.filter((v) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!v.vehicle_id.toLowerCase().includes(s) && !v.vehicle_model.toLowerCase().includes(s)) return false;
      }
      if (filters.batteryType !== "all" && v.battery_type !== filters.batteryType) return false;
      if (filters.drivingStyle !== "all" && v.driving_style !== filters.drivingStyle) return false;
      return true;
    });
  }, [vehicles, filters]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-error text-lg font-medium">Failed to load fleet data</p>
        <p className="text-foreground-muted text-sm mt-1">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FleetFilters filters={filters} onChange={setFilters} />
      <FleetTable vehicles={filtered} isLoading={isLoading} />
    </div>
  );
}
