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
  const classes = await prisma.virtualClass.findMany({
    where: sectionId ? { sectionId } : undefined,
    include: { subject: true, section: { include: { classLevel: true } } },
    orderBy: { scheduledAt: "desc" },
    take: 100,
  });
  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { sectionId, subjectId, title, meetingLink, scheduledAt } = await req.json();
  if (!sectionId || !subjectId || !title || !meetingLink || !scheduledAt) {
    return NextResponse.json(
      { error: "sectionId, subjectId, title, meetingLink, scheduledAt required" },
      { status: 400 }
    );
  }
  const virtualClass = await prisma.virtualClass.create({
    data: { sectionId, subjectId, title, meetingLink, scheduledAt: new Date(scheduledAt) },
  });
  return NextResponse.json(virtualClass, { status: 201 });
}
