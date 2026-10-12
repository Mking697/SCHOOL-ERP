import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classLevelId = searchParams.get("classLevelId");
  const structures = await prisma.feeStructure.findMany({
    where: classLevelId ? { classLevelId } : undefined,
    include: { feeHead: true, classLevel: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(structures);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { classLevelId, feeHeadId, amount, frequency } = await req.json();
  if (!classLevelId || !feeHeadId || amount === undefined) {
    return NextResponse.json(
      { error: "classLevelId, feeHeadId, amount required" },
      { status: 400 }
    );
  }
  try {
    const structure = await prisma.feeStructure.create({
      data: { classLevelId, feeHeadId, amount, frequency: frequency || "TERM" },
    });
    return NextResponse.json(structure, { status: 201 });
  } catch {
    return NextResponse.json({ error: "This fee head already set for this class/frequency" }, { status: 409 });
  }
}
