import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const fieldMap: Record<string, string> = {
  vehicle_id: "vehicleId",
  car_model: "vehicleModel",
  battery_type: "batteryType",
  battery_capacity_kwh: "batteryCapacity",
  vehicle_age_months: "vehicleAge",
  total_charging_cycles: "totalChargingCycle",
  avg_temperature_c: "avgTempC",
  fast_charge_ratio: "fastChargeRatio",
  avg_discharge_rate_c: "avgDischargeRate",
  driving_style: "drivingStyle",
  soh_percent: "sohPercent",
};

const numericFields = new Set([
  "batteryCapacity",
  "vehicleAge",
  "totalChargingCycle",
  "avgTempC",
  "fastChargeRatio",
  "avgDischargeRate",
  "sohPercent",
]);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (
      typeof body.filename !== "string" ||
      !Array.isArray(body.rows) ||
      body.rows.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid request body. filename (string) and rows (non-empty array) are required." },
        { status: 400 },
      );
    }

    let errorCount = 0;
    let successCount = 0;

    for (const rawRow of body.rows) {
      if (typeof rawRow !== "object" || rawRow === null) {
        errorCount++;
        continue;
      }

      try {
        const mapped: Record<string, unknown> = Object.fromEntries(
          Object.entries(rawRow as Record<string, string>)
            .map(([key, value]) => [fieldMap[key], value])
            .filter(([key]) => key),
        );

        for (const field of numericFields) {
          mapped[field] = parseFloat(mapped[field] as string) || 0;
        }

        if (typeof mapped.drivingStyle === "string") {
          mapped.drivingStyle = mapped.drivingStyle.toLowerCase();
        }

        mapped.userId = session.user.id;

        const vehicle = await prisma.vehicle.create({ data: mapped as any });
        successCount++;

        const soh = vehicle.sohPercent;
        const alertsToCreate: { userId: string; vehicleId: string; severity: string; alertType: string; description: string }[] = [];

        if (soh < 60) {
          alertsToCreate.push({
            userId: session.user.id!,
            vehicleId: vehicle.vehicleId,
            severity: "critical",
            alertType: "health_critical",
            description: `${vehicle.vehicleModel} (${vehicle.vehicleId}) battery health critically low at ${soh}%`,
          });
        } else if (soh < 80) {
          alertsToCreate.push({
            userId: session.user.id!,
            vehicleId: vehicle.vehicleId,
            severity: "warning",
            alertType: "health_warning",
            description: `${vehicle.vehicleModel} (${vehicle.vehicleId}) battery health degraded to ${soh}%`,
          });
        }

        if (vehicle.avgTempC > 35) {
          alertsToCreate.push({
            userId: session.user.id!,
            vehicleId: vehicle.vehicleId,
            severity: "warning",
            alertType: "temperature_high",
            description: `${vehicle.vehicleModel} (${vehicle.vehicleId}) average temperature ${vehicle.avgTempC}°C exceeds recommended range`,
          });
        }

        if (vehicle.fastChargeRatio > 0.8) {
          alertsToCreate.push({
            userId: session.user.id!,
            vehicleId: vehicle.vehicleId,
            severity: "info",
            alertType: "fast_charge_high",
            description: `${vehicle.vehicleModel} (${vehicle.vehicleId}) fast-charge ratio at ${(vehicle.fastChargeRatio * 100).toFixed(0)}% may accelerate degradation`,
          });
        }

        if (alertsToCreate.length > 0) {
          await prisma.alert.createMany({ data: alertsToCreate });
        }
      } catch {
        errorCount++;
      }
    }

    await prisma.uploadHistory.create({
      data: {
        user: { connect: { id: session.user.id } },
        filename: body.filename,
        fileSize: 0,
        status: errorCount > 0 ? (successCount > 0 ? "partial" : "error") : "success",
        rowCount: body.rows.length,
        errorCount,
      },
    });

    return NextResponse.json({ success: true, count: successCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
