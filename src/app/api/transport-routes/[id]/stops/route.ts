import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "PRINCIPAL", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id: routeId } = await params;
  const { name, lat, lng } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const count = await prisma.stop.count({ where: { routeId } });
  const stop = await prisma.stop.create({
    data: { routeId, name, order: count, lat: lat ?? null, lng: lng ?? null },
  });
  return NextResponse.json(stop, { status: 201 });
}
