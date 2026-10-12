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
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }
  const records = await prisma.behaviorRecord.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { studentId, type, category, description } = await req.json();
  if (!studentId || !type || !description) {
    return NextResponse.json(
      { error: "studentId, type, description required" },
      { status: 400 }
    );
  }
  const record = await prisma.behaviorRecord.create({
    data: { studentId, type, category, description, recordedBy: session.email },
  });
  return NextResponse.json(record, { status: 201 });
}
