import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// The school-wide 8-period (+ lunch break) bell schedule. Shared by the
// Timetable Builder grid (column headers/times) and the teacher dashboard's
// live current/next period widget.
export async function GET() {
  const periods = await prisma.period.findMany({ orderBy: { periodNumber: "asc" } });
  return NextResponse.json(periods);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "PRINCIPAL", "HR"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { periodNumber, label, startTime, endTime, isBreak } = await req.json();
  if (periodNumber === undefined || !label || !startTime || !endTime) {
    return NextResponse.json(
      { error: "periodNumber, label, startTime, endTime required" },
      { status: 400 }
    );
  }
  const period = await prisma.period.upsert({
    where: { periodNumber },
    create: { periodNumber, label, startTime, endTime, isBreak: Boolean(isBreak) },
    update: { label, startTime, endTime, isBreak: Boolean(isBreak) },
  });
  return NextResponse.json(period, { status: 201 });
}
