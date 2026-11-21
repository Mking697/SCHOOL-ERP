import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signPortalSession, PORTAL_SESSION_COOKIE } from "@/lib/portal-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { admissionNo, password } = await req.json();
  if (!admissionNo || !password) {
    return NextResponse.json(
      { error: "Admission No aur Password dono chahiye" },
      { status: 400 }
    );
  }

  // Portal passwords are the student's Date of Birth (DDMMYYYY) -- a LOW
  // entropy space for a school-age child (only a few thousand plausible
  // combinations), so this endpoint must be rate-limited to make brute
  // force genuinely impractical, not just slow.
  const limitKey = `portal-login:${clientIp(req)}:${String(admissionNo).toLowerCase()}`;
  const { allowed, retryAfterMs } = rateLimit(limitKey, 8, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Bahut saari koshish ho gayi -- thodi der baad try karo" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
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
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}
