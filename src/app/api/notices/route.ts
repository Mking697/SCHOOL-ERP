import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const notices = await prisma.notice.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json(notices);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { title, body, audience } = await req.json();
  if (!title || !body) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }
  const notice = await prisma.notice.create({
    data: { title, body, audience: audience || "ALL", createdBy: session.email },
  });
  return NextResponse.json(notice, { status: 201 });
}
