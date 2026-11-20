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
    include: { subject: true, teacher: true },
    orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "PRINCIPAL", "HR"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { sectionId, dayOfWeek, periodNumber, subjectId, teacherId, startTime, endTime } =
    await req.json();

  if (!sectionId || dayOfWeek === undefined || !periodNumber) {
    return NextResponse.json(
      { error: "sectionId, dayOfWeek, periodNumber required" },
      { status: 400 }
    );
  }

  // A teacher can't teach two sections at the same day+period -- check every
  // OTHER section's timetable for a clash before saving this cell.
  if (teacherId) {
    const clash = await prisma.timetableEntry.findFirst({
      where: {
        teacherId,
        dayOfWeek,
        periodNumber,
        NOT: { sectionId },
      },
      include: { section: { include: { classLevel: true } } },
    });
    if (clash) {
      const where = clash.section
        ? `${clash.section.classLevel.name} - ${clash.section.name}`
        : "another section";
      return NextResponse.json(
        { error: `Ye teacher isi din/period me ${where} ko already padha raha hai` },
        { status: 409 }
      );
    }
  }

  const entry = await prisma.timetableEntry.upsert({
    where: {
      sectionId_dayOfWeek_periodNumber: { sectionId, dayOfWeek, periodNumber },
    },
    create: { sectionId, dayOfWeek, periodNumber, subjectId, teacherId, startTime, endTime },
    update: { subjectId, teacherId, startTime, endTime },
    include: { subject: true, teacher: true },
  });
  return NextResponse.json(entry, { status: 201 });
}
