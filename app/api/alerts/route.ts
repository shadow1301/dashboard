import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const mapped = alerts.map((a) => ({
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
