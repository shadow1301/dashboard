import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const vehicles = await prisma.vehicle.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });

  const mapped = vehicles.map((v) => ({
    vehicle_id: v.vehicleId,
    vehicle_model: v.vehicleModel,
    battery_type: v.batteryType,
    battery_capacity: v.batteryCapacity,
    vehicle_age: Math.round((v.vehicleAge / 12) * 10) / 10,
    vehicle_age_months: v.vehicleAge,
    total_charging_cycle: v.totalChargingCycle,
    avg_temp_c: v.avgTempC,
    fast_charge_ratio: v.fastChargeRatio,
    avg_discharge_rate: v.avgDischargeRate,
    driving_style: v.drivingStyle,
    soh_percent: v.sohPercent,
  }));

  return NextResponse.json(mapped);
}
