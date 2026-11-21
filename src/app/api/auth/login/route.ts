import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email aur password required hai" }, { status: 400 });
  }

  const limitKey = `staff-login:${clientIp(req)}:${String(email).trim().toLowerCase()}`;
  const { allowed, retryAfterMs } = rateLimit(limitKey, 10, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Bahut saari koshish ho gayi -- thodi der baad try karo" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Invalid login" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid login" }, { status: 401 });
  }

  const token = signSession({ userId: user.id, role: user.role, email: user.email });

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
