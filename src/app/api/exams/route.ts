import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const classLevelId = searchParams.get("classLevelId");
  const exams = await prisma.exam.findMany({
    where: classLevelId ? { classLevelId } : undefined,
    include: { classLevel: true, subjects: { include: { subject: true } } },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(exams);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { title, classLevelId, startDate, endDate, subjects } = await req.json();
  if (!title || !classLevelId || !startDate || !endDate || !Array.isArray(subjects) || subjects.length === 0) {
    return NextResponse.json(
      { error: "title, classLevelId, startDate, endDate, subjects[] required" },
      { status: 400 }
    );
  }
  const exam = await prisma.exam.create({
    data: {
      title,
      classLevelId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      subjects: {
        create: subjects.map((s: { subjectId: string; maxMarks: number; examDate?: string }) => ({
          subjectId: s.subjectId,
          maxMarks: s.maxMarks || 100,
          examDate: s.examDate ? new Date(s.examDate) : undefined,
        })),
      },
    },
    include: { subjects: { include: { subject: true } } },
  });
  return NextResponse.json(exam, { status: 201 });
}
