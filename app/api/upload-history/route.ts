import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await prisma.uploadHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const mapped = history.map((h) => ({
    id: h.id,
    filename: h.filename,
    fileSize: h.fileSize,
    rowCount: h.rowCount,
    errorCount: h.errorCount,
    status: h.status,
    createdAt: h.createdAt.toISOString(),
  }));

  return NextResponse.json(mapped);
}
