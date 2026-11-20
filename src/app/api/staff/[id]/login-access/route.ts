import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { grantStaffLoginAccess, StaffLoginError } from "@/lib/staff-login";

// Admin-only: create or reset login access to the Staff & Admin app for a
// staff record. There is no self-service "forgot password" flow (no
// email/SMS gateway configured by default) -- an admin hands the new
// password to the staff member directly, same as a physical ID card.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "PRINCIPAL", "HR"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const staff = await prisma.staff.findUnique({ where: { id }, include: { user: true } });
  if (!staff) {
    return NextResponse.json({ error: "Staff nahi mila" }, { status: 404 });
  }

  try {
    const result = await grantStaffLoginAccess(prisma, staff.id, {
      email: staff.email,
      name: staff.name,
      existingUserId: staff.user?.id ?? null,
      role: body?.role,
      password: body?.password,
    });
    return NextResponse.json({ ok: true, ...result }, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof StaffLoginError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
