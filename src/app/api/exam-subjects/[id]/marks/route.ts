import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id: examSubjectId } = await params;
  const { entries } = await req.json(); // [{ studentId, marksObtained }]
  if (!Array.isArray(entries)) {
    return NextResponse.json({ error: "entries[] required" }, { status: 400 });
  }

  await prisma.$transaction(
    entries.map((e: { studentId: string; marksObtained: number }) =>
      prisma.mark.upsert({
        where: { examSubjectId_studentId: { examSubjectId, studentId: e.studentId } },
        create: { examSubjectId, studentId: e.studentId, marksObtained: e.marksObtained },
        update: { marksObtained: e.marksObtained },
      })
    )
  );

  return NextResponse.json({ ok: true, count: entries.length });
}
