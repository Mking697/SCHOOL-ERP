import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const visitors = await prisma.visitor.findMany({ orderBy: { checkIn: "desc" }, take: 100 });
  return NextResponse.json(visitors);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, phone, purpose, personToMeet } = await req.json();
  if (!name || !phone || !purpose) {
    return NextResponse.json({ error: "name, phone, purpose required" }, { status: 400 });
  }
  const visitor = await prisma.visitor.create({
    data: { name, phone, purpose, personToMeet },
  });
  return NextResponse.json(visitor, { status: 201 });
}
