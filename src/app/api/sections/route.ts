import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, classLevelId } = await req.json();
  if (!name || !classLevelId) {
    return NextResponse.json({ error: "name and classLevelId required" }, { status: 400 });
  }
  try {
    const created = await prisma.section.create({ data: { name, classLevelId } });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Section already exists for this class" }, { status: 409 });
  }
}
