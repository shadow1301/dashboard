import { VehicleDetailClient } from "./VehicleDetailClient";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = await params;
  return <VehicleDetailClient vehicleId={vehicleId} />;
}
