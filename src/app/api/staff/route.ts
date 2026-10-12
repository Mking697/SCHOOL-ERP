import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, designation, department, phone, email, joiningDate, salary } = await req.json();
  if (!name || !designation) {
    return NextResponse.json({ error: "name and designation required" }, { status: 400 });
  }
  const staff = await prisma.staff.create({
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
  return NextResponse.json(staff, { status: 201 });
}
