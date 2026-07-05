import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["read", "dismissed"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status. Use 'read' or 'dismissed'." }, { status: 400 });
  }

  try {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }
    if (alert.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      id: updated.id,
      vehicle_id: updated.vehicleId,
      severity: updated.severity,
      type: updated.alertType,
      description: updated.description,
      timestamp: updated.createdAt.toISOString(),
      status: updated.status,
    });
  } catch (error) {
    console.error("Failed to update alert:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
