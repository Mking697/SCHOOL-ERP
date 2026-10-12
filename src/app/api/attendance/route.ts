import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

function startOfDay(dateStr: string) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get("sectionId");
  const date = searchParams.get("date");
  if (!sectionId || !date) {
    return NextResponse.json({ error: "sectionId and date required" }, { status: 400 });
  }

  const day = startOfDay(date);

  const students = await prisma.student.findMany({
    where: { sectionId, isActive: true },
    orderBy: { firstName: "asc" },
    include: {
      attendance: { where: { date: day } },
    },
  });

  const result = students.map((s) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    admissionNo: s.admissionNo,
    status: s.attendance[0]?.status || null,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { date, entries } = await req.json();
  // entries: [{ studentId, status }]
  if (!date || !Array.isArray(entries)) {
    return NextResponse.json({ error: "date and entries[] required" }, { status: 400 });
  }

  const day = startOfDay(date);

  await prisma.$transaction(
    entries.map((e: { studentId: string; status: string }) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: e.studentId, date: day } },
        create: { studentId: e.studentId, date: day, status: e.status, markedBy: session.email },
        update: { status: e.status, markedBy: session.email },
      })
    )
  );

  return NextResponse.json({ ok: true, count: entries.length });
}
