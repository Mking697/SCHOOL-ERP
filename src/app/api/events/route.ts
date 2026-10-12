import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const events = await prisma.event.findMany({ orderBy: { eventDate: "asc" }, take: 100 });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { title, description, eventDate, location } = await req.json();
  if (!title || !eventDate) {
    return NextResponse.json({ error: "title and eventDate required" }, { status: 400 });
  }
  const event = await prisma.event.create({
    data: { title, description, eventDate: new Date(eventDate), location },
  });
  return NextResponse.json(event, { status: 201 });
}
