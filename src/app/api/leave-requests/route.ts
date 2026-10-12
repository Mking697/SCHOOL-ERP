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
  const status = searchParams.get("status");
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { staffId: staffId || undefined, status: status || undefined },
    include: { staff: true },
    orderBy: { appliedAt: "desc" },
  });
  return NextResponse.json(leaveRequests);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { staffId, fromDate, toDate, reason } = await req.json();
  if (!staffId || !fromDate || !toDate || !reason) {
    return NextResponse.json(
      { error: "staffId, fromDate, toDate, reason required" },
      { status: 400 }
    );
  }
  const leaveRequest = await prisma.leaveRequest.create({
    data: { staffId, fromDate: new Date(fromDate), toDate: new Date(toDate), reason },
  });
  return NextResponse.json(leaveRequest, { status: 201 });
}
