import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json({ error: "sectionId required" }, { status: 400 });
  }
  const entries = await prisma.timetableEntry.findMany({
    where: { sectionId },
    include: { subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { sectionId, dayOfWeek, periodNumber, subjectId, teacherName, startTime, endTime } =
    await req.json();

  if (!sectionId || dayOfWeek === undefined || !periodNumber) {
    return NextResponse.json(
      { error: "sectionId, dayOfWeek, periodNumber required" },
      { status: 400 }
    );
  }

  const entry = await prisma.timetableEntry.upsert({
    where: {
      sectionId_dayOfWeek_periodNumber: { sectionId, dayOfWeek, periodNumber },
    },
    create: { sectionId, dayOfWeek, periodNumber, subjectId, teacherName, startTime, endTime },
    update: { subjectId, teacherName, startTime, endTime },
  });
  return NextResponse.json(entry, { status: 201 });
}
