import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: { section: { include: { classLevel: true } } },
  });
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(student);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const { firstName, lastName, dob, gender, sectionId, guardianName, guardianPhone, address, isActive } = body;

  const student = await prisma.student.update({
    where: { id },
    data: {
      firstName,
      lastName,
      dob: dob ? new Date(dob) : undefined,
      gender,
      sectionId: sectionId || undefined,
      guardianName,
      guardianPhone,
      address,
      isActive,
    },
  });
  return NextResponse.json(student);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
