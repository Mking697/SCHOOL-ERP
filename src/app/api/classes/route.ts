import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const classes = await prisma.classLevel.findMany({
    include: { sections: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Class name required" }, { status: 400 });
  }
  const created = await prisma.classLevel.create({ data: { name } });
  return NextResponse.json(created, { status: 201 });
}
