import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// A payroll-scoped staff roster (id/name/designation/salary only) so
// Accountant can run payroll without needing the broader HR-only /api/staff
// access (which also exposes phone/email/joining-date HR record fields).
export async function GET() {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "PRINCIPAL", "HR", "ACCOUNTANT"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const staff = await prisma.staff.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, designation: true, salary: true },
  });
  return NextResponse.json(staff);
}
