import { vehicles } from "@/data/vehicles";
import { VehicleDetailClient } from "./VehicleDetailClient";

export function generateStaticParams() {
  return vehicles.map((v) => ({ vehicleId: v.vehicle_id }));
}

export default async function Page({ params }: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = await params;
  return <VehicleDetailClient vehicleId={vehicleId} />;
}
