import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

function startOfDay(dateStr: string) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

// HR's daily staff attendance roster: every active staff member + their
// status for one date (null if not marked yet).
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  const day = startOfDay(date);

  const staff = await prisma.staff.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { attendance: { where: { date: day } } },
  });

  const result = staff.map((s) => ({
    id: s.id,
    name: s.name,
    designation: s.designation,
    status: s.attendance[0]?.status || null,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "PRINCIPAL", "HR"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { date, entries } = await req.json();
  // entries: [{ staffId, status }]
  if (!date || !Array.isArray(entries)) {
    return NextResponse.json({ error: "date and entries[] required" }, { status: 400 });
  }
  const day = startOfDay(date);

  await prisma.$transaction(
    entries.map((e: { staffId: string; status: string }) =>
      prisma.staffAttendance.upsert({
        where: { staffId_date: { staffId: e.staffId, date: day } },
        create: { staffId: e.staffId, date: day, status: e.status, markedBy: session.email },
        update: { status: e.status, markedBy: session.email },
      })
    )
  );

  return NextResponse.json({ ok: true, count: entries.length });
}
