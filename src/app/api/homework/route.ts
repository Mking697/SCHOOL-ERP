import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get("sectionId");
  const homework = await prisma.homework.findMany({
    where: sectionId ? { sectionId } : undefined,
    include: { subject: true, section: { include: { classLevel: true } } },
    orderBy: { dueDate: "desc" },
    take: 100,
  });
  return NextResponse.json(homework);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { sectionId, subjectId, title, description, dueDate } = await req.json();
  if (!sectionId || !subjectId || !title || !dueDate) {
    return NextResponse.json(
      { error: "sectionId, subjectId, title, dueDate required" },
      { status: 400 }
    );
  }
  const homework = await prisma.homework.create({
    data: {
      sectionId,
      subjectId,
      title,
      description,
      dueDate: new Date(dueDate),
      createdBy: session.email,
    },
  });
  return NextResponse.json(homework, { status: 201 });
}
