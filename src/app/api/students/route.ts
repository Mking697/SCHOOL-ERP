import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function nextAdmissionNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.student.count();
  return `${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const students = await prisma.student.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { admissionNo: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { section: { include: { classLevel: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { firstName, lastName, dob, gender, sectionId, guardianName, guardianPhone, address } = body;

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First and last name required" }, { status: 400 });
  }

  const admissionNo = body.admissionNo || (await nextAdmissionNo());

  try {
    const student = await prisma.student.create({
      data: {
        admissionNo,
        firstName,
        lastName,
        dob: dob ? new Date(dob) : undefined,
        gender,
        sectionId: sectionId || undefined,
        guardianName,
        guardianPhone,
        address,
      },
    });
    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Admission number already exists" }, { status: 409 });
  }
}
