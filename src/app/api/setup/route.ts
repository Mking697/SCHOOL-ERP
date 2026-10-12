import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signSession, SESSION_COOKIE } from "@/lib/auth";

// One-time first-run setup: creates the School row + the first SUPER_ADMIN
// user. Refuses once a School already exists (a fresh install only ever
// runs this once -- re-running the wizard on an already-set-up install
// would let anyone re-seed a new super admin).
export async function POST(req: NextRequest) {
  const existing = await prisma.school.findFirst();
  if (existing) {
    return NextResponse.json(
      { error: "School already set up on this install" },
      { status: 409 }
    );
  }

  const { schoolName, logoUrl, adminName, adminEmail, adminPassword } = await req.json();

  if (!schoolName || !adminName || !adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "schoolName, adminName, adminEmail, adminPassword required" },
      { status: 400 }
    );
  }
  if (String(adminPassword).length < 8) {
    return NextResponse.json(
      { error: "Password kam se kam 8 characters ka hona chahiye" },
      { status: 400 }
    );
  }
  if (logoUrl && String(logoUrl).length > 2_000_000) {
    return NextResponse.json(
      { error: "Logo bahut bada hai -- chhoti image (< 1MB) use karo" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const school = await prisma.school.create({
    data: { name: schoolName, logoUrl: logoUrl || null },
  });

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  const token = signSession({ userId: admin.id, role: admin.role, email: admin.email });
  const res = NextResponse.json({ ok: true, schoolId: school.id }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  return res;
}
