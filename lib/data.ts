import { vehicles } from "@/data/vehicles";
import { alerts as alertsData } from "@/data/alerts";
import type { Vehicle, Alert } from "@/types";

async function delay(ms: number = 300): Promise<void> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 200));
}

export async function getVehicles(): Promise<Vehicle[]> {
  await delay();
  return vehicles;
}

export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
  await delay(200);
  return vehicles.find((v) => v.vehicle_id === id);
}

export async function getVehicleCount(): Promise<number> {
  await delay(150);
  return vehicles.length;
}

export async function getAlerts(): Promise<Alert[]> {
  await delay(250);
  return alertsData;
}

export async function getAlertsByVehicleId(vehicleId: string): Promise<Alert[]> {
  await delay(200);
  return alertsData.filter((a) => a.vehicle_id === vehicleId);
}
