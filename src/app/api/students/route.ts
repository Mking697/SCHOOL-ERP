import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
  if (!session || !["SUPER_ADMIN", "PRINCIPAL", "HR"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { firstName, lastName, dob, gender, sectionId, guardianName, guardianPhone, address } = body;

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First and last name required" }, { status: 400 });
  }

  const admissionNo = body.admissionNo || (await nextAdmissionNo());

  // Portal login activates automatically at admission -- default password is
  // the student's DOB as DDMMYYYY (matching the "no extra step" ask), same
  // pattern as a physical school ID card: easy to hand over, and the parent
  // can change it anytime from Profile. Only set when a DOB was given.
  let portalPasswordHash: string | undefined;
  let generatedPassword: string | null = null;
  if (dob) {
    const d = new Date(dob);
    generatedPassword = `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}`;
    portalPasswordHash = await bcrypt.hash(generatedPassword, 10);
  }

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
        portalPasswordHash,
      },
    });
    return NextResponse.json({ ...student, generatedPortalPassword: generatedPassword }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Admission number already exists" }, { status: 409 });
  }
}
