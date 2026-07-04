import type { Vehicle } from "@/types";

export function calculateHealthScore(vehicle: Vehicle): number {
  let score = vehicle.soh_percent;

  if (vehicle.avg_temp_c > 35) {
    score -= (vehicle.avg_temp_c - 35) * 0.3;
  }

  if (vehicle.fast_charge_ratio > 0.6) {
    score -= (vehicle.fast_charge_ratio - 0.6) * 10;
  }

  if (vehicle.avg_discharge_rate > 1.5) {
    score -= (vehicle.avg_discharge_rate - 1.5) * 5;
  }

  if (vehicle.driving_style === "aggressive") score -= 3;
  if (vehicle.driving_style === "moderate") score -= 1;

  if (vehicle.battery_type === "LFP") score += 1;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function predictRemainingCycles(vehicle: Vehicle): number {
  const health = calculateHealthScore(vehicle);
  const cyclesPerYear = vehicle.vehicle_age > 0
    ? vehicle.total_charging_cycle / vehicle.vehicle_age
    : vehicle.total_charging_cycle;
  const degradationPerCycle = vehicle.total_charging_cycle > 0
    ? (100 - health) / vehicle.total_charging_cycle
    : 0.01;
  const cyclesToEOL = degradationPerCycle > 0
    ? (health - 60) / degradationPerCycle
    : vehicle.total_charging_cycle * 2;
  return Math.max(0, Math.round(cyclesToEOL));
}

export function getHealthBucket(score: number): string {
  if (score <= 20) return "0-20";
  if (score <= 40) return "21-40";
  if (score <= 60) return "41-60";
  if (score <= 80) return "61-80";
  return "81-100";
}

export function getAlertSeverity(score: number): "critical" | "warning" | "info" {
  if (score < 60) return "critical";
  if (score < 80) return "warning";
  return "info";
}
