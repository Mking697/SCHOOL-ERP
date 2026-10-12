import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get("staffId");
  const assignments = await prisma.workAssignment.findMany({
    where: staffId ? { staffId } : undefined,
    include: { staff: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { staffId, title, description, dueDate } = await req.json();
  if (!staffId || !title) {
    return NextResponse.json({ error: "staffId and title required" }, { status: 400 });
  }
  const assignment = await prisma.workAssignment.create({
    data: { staffId, title, description, dueDate: dueDate ? new Date(dueDate) : undefined },
  });
  return NextResponse.json(assignment, { status: 201 });
}
