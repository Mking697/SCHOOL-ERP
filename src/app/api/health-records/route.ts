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
  const record = await prisma.healthRecord.findUnique({ where: { studentId } });
  return NextResponse.json(record);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { studentId, bloodGroup, allergies, conditions, emergencyContact } = await req.json();
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }
  const record = await prisma.healthRecord.upsert({
    where: { studentId },
    create: { studentId, bloodGroup, allergies, conditions, emergencyContact },
    update: { bloodGroup, allergies, conditions, emergencyContact },
  });
  return NextResponse.json(record, { status: 201 });
}
