import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(enquiries);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { studentName, guardianName, phone, email, classApplied, notes } = await req.json();
  if (!studentName || !phone) {
    return NextResponse.json({ error: "studentName and phone required" }, { status: 400 });
  }
  const enquiry = await prisma.enquiry.create({
    data: { studentName, guardianName, phone, email, classApplied, notes },
  });
  return NextResponse.json(enquiry, { status: 201 });
}
