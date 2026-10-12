import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const feeHeads = await prisma.feeHead.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(feeHeads);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Fee head name required" }, { status: 400 });
  }
  try {
    const feeHead = await prisma.feeHead.create({ data: { name } });
    return NextResponse.json(feeHead, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Fee head already exists" }, { status: 409 });
  }
}
