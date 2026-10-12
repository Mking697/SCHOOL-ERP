import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      leaveRequests: { orderBy: { appliedAt: "desc" } },
      workAssignments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!staff) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(staff);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const staff = await prisma.staff.update({
    where: { id },
    data: {
      name: body.name,
      designation: body.designation,
      department: body.department,
      phone: body.phone,
      email: body.email,
      salary: body.salary ? Number(body.salary) : undefined,
      isActive: body.isActive,
    },
  });
  return NextResponse.json(staff);
}
