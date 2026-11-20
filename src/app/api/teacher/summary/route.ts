import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// One combined call for the Teacher Dashboard's "My Attendance / Salary /
// Holidays / Events" widgets -- everything resolved from the logged-in
// session, never a staffId param (a teacher can only ever see their own).
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findUnique({ where: { userId: session.userId } });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [attendance, payslips, holidays, events] = await Promise.all([
    staff
      ? prisma.staffAttendance.findMany({
          where: { staffId: staff.id, date: { gte: monthStart } },
        })
      : Promise.resolve([]),
    staff
      ? prisma.payslip.findMany({ where: { staffId: staff.id }, orderBy: { month: "desc" }, take: 3 })
      : Promise.resolve([]),
    prisma.holiday.findMany({ where: { date: { gte: today } }, orderBy: { date: "asc" }, take: 5 }),
    prisma.event.findMany({ where: { eventDate: { gte: today } }, orderBy: { eventDate: "asc" }, take: 5 }),
  ]);

  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;

  return NextResponse.json({
    attendance: { present, absent, totalMarked: attendance.length },
    payslips,
    holidays,
    events,
  });
}
