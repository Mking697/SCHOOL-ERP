import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { password } = await req.json();
  if (!password || String(password).length < 6) {
    return NextResponse.json(
      { error: "Password kam se kam 6 characters ka hona chahiye" },
      { status: 400 }
    );
  }

  const route = await prisma.transportRoute.findUnique({ where: { id } });
  if (!route) {
    return NextResponse.json({ error: "Route nahi mila" }, { status: 404 });
  }
  if (!route.vehicleNumber) {
    return NextResponse.json(
      { error: "Pehle Vehicle Number set karo -- Driver App login isi se hota hai" },
      { status: 400 }
    );
  }

  const driverPasswordHash = await bcrypt.hash(password, 10);
  await prisma.transportRoute.update({ where: { id }, data: { driverPasswordHash } });

  return NextResponse.json({ ok: true });
}
