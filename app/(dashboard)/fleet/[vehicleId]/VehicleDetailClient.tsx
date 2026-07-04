"use client";

import Link from "next/link";
import { useVehicle } from "@/hooks/useVehicles";
import { DegradationChart } from "@/components/fleet/DegradationChart";
import { PredictionWidget } from "@/components/fleet/PredictionWidget";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Battery, Zap, Gauge, Activity } from "lucide-react";
import { calculateHealthScore } from "@/lib/predictions";

type Props = {
  vehicleId: string;
};

export function VehicleDetailClient({ vehicleId }: Props) {
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-error text-lg font-medium">Failed to load vehicle data</p>
        <p className="text-foreground-muted text-sm mt-1">Please try again later.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><Skeleton className="h-[300px]" /></div>
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-foreground text-lg font-medium">Vehicle not found</p>
        <p className="text-foreground-muted text-sm mt-1">
          No vehicle with ID <span className="font-mono">{vehicleId}</span> exists.
        </p>
        <Link href="/fleet" className="text-primary text-sm hover:underline mt-4">
          Back to fleet
        </Link>
      </div>
    );
  }

  const health = calculateHealthScore(vehicle);
  const healthColor = health >= 80 ? "text-health-good" : health >= 60 ? "text-health-warning" : "text-health-critical";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-foreground-faint mb-2">
        <Link href="/fleet" className="hover:text-foreground transition-colors">Fleet</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{vehicleId}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground font-mono">{vehicle.vehicle_id}</h2>
                  <p className="text-foreground-muted">{vehicle.vehicle_model}</p>
                </div>
                <div className="text-right">
                  <p className={healthColor}><span className="font-mono text-3xl font-bold">{health}</span><span className="text-lg">%</span></p>
                  <p className="text-xs text-foreground-faint">Health Score</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Battery, label: "Type", value: vehicle.battery_type },
                  { icon: Activity, label: "Capacity", value: `${vehicle.battery_capacity} kWh` },
                  { icon: Zap, label: "Driving Style", value: vehicle.driving_style.charAt(0).toUpperCase() + vehicle.driving_style.slice(1) },
                  { icon: Gauge, label: "Total Cycles", value: vehicle.total_charging_cycle.toLocaleString() },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center gap-1 text-foreground-faint text-xs">
                      <item.icon size={12} /> {item.label}
                    </div>
                    <p className="font-mono text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <DegradationChart vehicle={vehicle} />

          <Card>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">Charging Profile</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Fast-charge ratio", value: `${(vehicle.fast_charge_ratio * 100).toFixed(0)}%` },
                  { label: "Avg discharge rate", value: `${vehicle.avg_discharge_rate.toFixed(1)}C` },
                  { label: "Avg temperature", value: `${vehicle.avg_temp_c.toFixed(1)}°C` },
                  { label: "Vehicle age", value: `${vehicle.vehicle_age} years` },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-xs text-foreground-faint">{item.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <PredictionWidget vehicle={vehicle} />
          <Card>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">Driving Style Impact</h3>
              <p className="text-sm text-foreground-muted mb-2">
                This vehicle has a <strong>{vehicle.driving_style}</strong> driving profile.
              </p>
              <p className="text-xs text-foreground-faint">
                {vehicle.driving_style === "aggressive" ? "Aggressive driving accelerates battery degradation through higher discharge rates and thermal stress." :
                 vehicle.driving_style === "moderate" ? "Moderate driving has balanced impact on battery longevity." :
                 "Gentle driving minimizes stress on battery cells, extending useful life."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
