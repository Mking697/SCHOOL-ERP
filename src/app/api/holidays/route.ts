import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json(holidays);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { date, title, description } = await req.json();
  if (!date || !title) {
    return NextResponse.json({ error: "date and title required" }, { status: 400 });
  }
  try {
    const holiday = await prisma.holiday.create({
      data: { date: new Date(date), title, description },
    });
    return NextResponse.json(holiday, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Holiday already exists for this date" }, { status: 409 });
  }
}
