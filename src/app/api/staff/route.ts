import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { grantStaffLoginAccess, StaffLoginError } from "@/lib/staff-login";

export async function GET() {
  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "PRINCIPAL", "HR"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, designation, department, phone, email, joiningDate, salary, loginRole, loginPassword } =
    await req.json();
  if (!name || !designation) {
    return NextResponse.json({ error: "name and designation required" }, { status: 400 });
  }

  try {
    // Staff record + (optional) login access are created in ONE transaction: if the
    // caller asked for login access (loginPassword set), it either both succeed
    // together, or neither does -- no half-created staff-without-access state.
    const result = await prisma.$transaction(async (tx) => {
      const staff = await tx.staff.create({
        data: {
          name,
          designation,
          department,
          phone,
          email,
          joiningDate: joiningDate ? new Date(joiningDate) : undefined,
          salary: salary ? Number(salary) : undefined,
        },
      });
      if (!loginPassword) return { staff, login: null };
      const login = await grantStaffLoginAccess(tx, staff.id, {
        email: staff.email,
        name: staff.name,
        existingUserId: null,
        role: loginRole,
        password: loginPassword,
      });
      return { staff, login };
    });
    return NextResponse.json({ ...result.staff, login: result.login }, { status: 201 });
  } catch (error) {
    if (error instanceof StaffLoginError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
