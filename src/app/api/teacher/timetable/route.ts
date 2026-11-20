import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Today/this-week's periods for the LOGGED-IN teacher, resolved via their
// own session (never takes a staffId param) -- used by the teacher
// dashboard's "My Timetable" live widget and by the period-start/end
// notification timer.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findUnique({ where: { userId: session.userId } });
  if (!staff) {
    return NextResponse.json({ entries: [], periods: [] });
  }

  const [entries, periods] = await Promise.all([
    prisma.timetableEntry.findMany({
      where: { teacherId: staff.id },
      include: { subject: true, section: { include: { classLevel: true } } },
      orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
    }),
    prisma.period.findMany({ orderBy: { periodNumber: "asc" } }),
  ]);

  return NextResponse.json({ entries, periods });
}
