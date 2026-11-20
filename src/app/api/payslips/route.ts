import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// List payslips, optionally filtered to one staff member (used by the Staff
// detail page's Payroll panel).
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get("staffId");
  const payslips = await prisma.payslip.findMany({
    where: staffId ? { staffId } : undefined,
    orderBy: { month: "desc" },
    include: { staff: { select: { name: true } } },
    take: 50,
  });
  return NextResponse.json(payslips);
}

// Generate (or re-amount) this month's payslip for a staff member, from
// their current Staff.salary unless an explicit amount is given.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { staffId, month, amount } = await req.json();
  if (!staffId || !month) {
    return NextResponse.json({ error: "staffId and month required" }, { status: 400 });
  }
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) return NextResponse.json({ error: "Staff nahi mila" }, { status: 404 });

  const finalAmount = amount !== undefined ? amount : staff.salary;
  if (finalAmount === null || finalAmount === undefined) {
    return NextResponse.json(
      { error: "Staff ka salary set nahi hai -- pehle staff record me salary add karo ya amount do" },
      { status: 400 }
    );
  }

  const payslip = await prisma.payslip.upsert({
    where: { staffId_month: { staffId, month } },
    create: { staffId, month, amount: finalAmount },
    update: { amount: finalAmount },
  });
  return NextResponse.json(payslip, { status: 201 });
}
