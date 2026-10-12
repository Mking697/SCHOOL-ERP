import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signDriverSession, DRIVER_SESSION_COOKIE } from "@/lib/driver-auth";

export async function POST(req: NextRequest) {
  const { vehicleNumber, password } = await req.json();
  if (!vehicleNumber || !password) {
    return NextResponse.json(
      { error: "Vehicle Number aur Password dono chahiye" },
      { status: 400 }
    );
  }

  const route = await prisma.transportRoute.findFirst({ where: { vehicleNumber } });

  if (!route || !route.driverPasswordHash) {
    return NextResponse.json({ error: "Galat Vehicle Number ya Password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, route.driverPasswordHash);
  if (!valid) {
    return NextResponse.json({ error: "Galat Vehicle Number ya Password" }, { status: 401 });
  }

  const token = signDriverSession({ routeId: route.id, vehicleNumber: route.vehicleNumber! });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DRIVER_SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}
