import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const vehicle = await prisma.vehicle.findFirst({
    where: { vehicleId: id, userId: session.user.id },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({
    vehicle_id: vehicle.vehicleId,
    vehicle_model: vehicle.vehicleModel,
    battery_type: vehicle.batteryType,
    battery_capacity: vehicle.batteryCapacity,
    vehicle_age: Math.round((vehicle.vehicleAge / 12) * 10) / 10,
    vehicle_age_months: vehicle.vehicleAge,
    total_charging_cycle: vehicle.totalChargingCycle,
    avg_temp_c: vehicle.avgTempC,
    fast_charge_ratio: vehicle.fastChargeRatio,
    avg_discharge_rate: vehicle.avgDischargeRate,
    driving_style: vehicle.drivingStyle,
    soh_percent: vehicle.sohPercent,
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: { vehicleId: id, userId: session.user.id },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.alert.deleteMany({ where: { vehicleId: id, userId: session.user.id } }),
    prisma.vehicle.deleteMany({ where: { vehicleId: id, userId: session.user.id } }),
  ]);

  return NextResponse.json({ success: true });
}
