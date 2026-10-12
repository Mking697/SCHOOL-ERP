import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const routes = await prisma.transportRoute.findMany({
    include: { stops: { orderBy: { order: "asc" } }, students: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(routes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, vehicleNumber, driverName, driverPhone } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const route = await prisma.transportRoute.create({
    data: { name, vehicleNumber, driverName, driverPhone },
  });
  return NextResponse.json(route, { status: 201 });
}
