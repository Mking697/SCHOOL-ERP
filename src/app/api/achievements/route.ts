import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const achievements = await prisma.achievement.findMany({
    where: studentId ? { studentId } : undefined,
    include: studentId ? undefined : { student: true },
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(achievements);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { studentId, title, category, description, date } = await req.json();
  if (!studentId || !title) {
    return NextResponse.json({ error: "studentId and title required" }, { status: 400 });
  }
  const achievement = await prisma.achievement.create({
    data: {
      studentId,
      title,
      category,
      description,
      date: date ? new Date(date) : undefined,
    },
  });
  return NextResponse.json(achievement, { status: 201 });
}
