import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const existing = await prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (existing.length > 0) {
    const mapped = existing.map((a) => ({
      id: a.id,
      vehicle_id: a.vehicleId,
      severity: a.severity,
      type: a.alertType,
      description: a.description,
      timestamp: a.createdAt.toISOString(),
      status: a.status,
    }));
    return NextResponse.json(mapped);
  }

  const vehicles = await prisma.vehicle.findMany({ where: { userId } });
  const generated = vehicles.flatMap((v) => {
    const alerts: {
      alertType: string;
      severity: string;
      description: string;
    }[] = [];

    if (v.sohPercent < 60) {
      alerts.push({
        alertType: "health_critical",
        severity: "critical",
        description: `${v.vehicleModel} (${v.vehicleId}) battery health critically low at ${v.sohPercent}%`,
      });
    } else if (v.sohPercent < 80) {
      alerts.push({
        alertType: "health_warning",
        severity: "warning",
        description: `${v.vehicleModel} (${v.vehicleId}) battery health degraded to ${v.sohPercent}%`,
      });
    }

    if (v.avgTempC > 35) {
      alerts.push({
        alertType: "temperature_high",
        severity: "warning",
        description: `${v.vehicleModel} (${v.vehicleId}) average temperature ${v.avgTempC}°C exceeds recommended range`,
      });
    }

    if (v.fastChargeRatio > 0.8) {
      alerts.push({
        alertType: "fast_charge_high",
        severity: "info",
        description: `${v.vehicleModel} (${v.vehicleId}) fast-charge ratio at ${(v.fastChargeRatio * 100).toFixed(0)}% may accelerate degradation`,
      });
    }

    return alerts.map((a) => ({
      userId,
      vehicleId: v.vehicleId,
      severity: a.severity,
      alertType: a.alertType,
      description: a.description,
      status: "unread",
    }));
  });

  const persisted = await prisma.$transaction(
    generated.map((a) => prisma.alert.create({ data: a })),
  );

  const mapped = persisted.map((a) => ({
    id: a.id,
    vehicle_id: a.vehicleId,
    severity: a.severity,
    type: a.alertType,
    description: a.description,
    timestamp: a.createdAt.toISOString(),
    status: a.status,
  }));

  return NextResponse.json(mapped);
}
