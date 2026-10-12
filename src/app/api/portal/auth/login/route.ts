import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signPortalSession, PORTAL_SESSION_COOKIE } from "@/lib/portal-auth";

export async function POST(req: NextRequest) {
  const { admissionNo, password } = await req.json();
  if (!admissionNo || !password) {
    return NextResponse.json(
      { error: "Admission No aur Password dono chahiye" },
      { status: 400 }
    );
  }

  const student = await prisma.student.findUnique({ where: { admissionNo } });

  // Deliberately return the same generic error whether the admission
  // number doesn't exist, the portal login was never activated, or the
  // password is wrong -- don't leak which case it was.
  if (!student || !student.portalPasswordHash || !student.isActive) {
    return NextResponse.json({ error: "Galat Admission No ya Password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, student.portalPasswordHash);
  if (!valid) {
    return NextResponse.json({ error: "Galat Admission No ya Password" }, { status: 401 });
  }

  const token = signPortalSession({ studentId: student.id, admissionNo: student.admissionNo });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PORTAL_SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}
