import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Admin-only: (re)activate or reset a student's portal login. There is no
// self-service "forgot password" flow (no email/SMS gateway configured by
// default) -- a staff member hands the new password to the
// parent/student directly, the same way a physical ID card is handed out.
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

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    return NextResponse.json({ error: "Student nahi mila" }, { status: 404 });
  }

  const portalPasswordHash = await bcrypt.hash(password, 10);
  await prisma.student.update({ where: { id }, data: { portalPasswordHash } });

  return NextResponse.json({ ok: true });
}
