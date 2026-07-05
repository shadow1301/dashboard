import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await prisma.$transaction([
      prisma.alert.deleteMany({ where: { userId } }),
      prisma.vehicle.deleteMany({ where: { userId } }),
      prisma.uploadHistory.deleteMany({ where: { userId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete data" }, { status: 500 });
  }
}
