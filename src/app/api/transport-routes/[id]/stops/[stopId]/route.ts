import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stopId: string }> }
) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "PRINCIPAL", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { stopId } = await params;
  await prisma.stop.delete({ where: { id: stopId } });
  return NextResponse.json({ ok: true });
}
