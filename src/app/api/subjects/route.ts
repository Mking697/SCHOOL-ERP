import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(subjects);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, code } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Subject name required" }, { status: 400 });
  }
  try {
    const subject = await prisma.subject.create({ data: { name, code } });
    return NextResponse.json(subject, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Subject already exists" }, { status: 409 });
  }
}
