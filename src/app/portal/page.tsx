import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { CalendarCheck, Wallet, BookOpenCheck, Megaphone, ArrowRight } from "lucide-react";

export const instant = false;

export default async function PortalHome() {
  const session = await getPortalSession();
  const studentId = session!.studentId;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const studentForSection = await prisma.student.findUnique({
    where: { id: studentId },
    select: { sectionId: true },
  });

  const [student, attendanceTotal, attendancePresent, invoices, upcomingHomework, latestNotices] =
    await Promise.all([
      prisma.student.findUnique({ where: { id: studentId }, include: { section: true } }),
      prisma.attendance.count({ where: { studentId, date: { gte: thirtyDaysAgo } } }),
      prisma.attendance.count({
        where: { studentId, date: { gte: thirtyDaysAgo }, status: "PRESENT" },
      }),
      prisma.invoice.findMany({ where: { studentId }, include: { payments: true } }),
      studentForSection?.sectionId
        ? prisma.homework.findMany({
            where: { sectionId: studentForSection.sectionId, dueDate: { gte: new Date() } },
            include: { subject: true },
            orderBy: { dueDate: "asc" },
            take: 5,
          })
        : Promise.resolve([]),
      prisma.notice.findMany({
        where: { audience: { in: ["ALL", "PARENTS", "STUDENTS"] } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const attendancePct = attendanceTotal > 0 ? (attendancePresent / attendanceTotal) * 100 : 0;
  const pendingAmount = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => {
      const paid = i.payments.reduce((s, p) => s + Number(p.amount), 0);
      return sum + (Number(i.totalAmount) - paid);
    }, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Welcome, {student?.firstName}
        </h1>
        <p className="text-sm text-slate-500">Admission No. {student?.admissionNo}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Attendance (30d)"
          value={`${attendancePct.toFixed(0)}%`}
          tone={attendancePct >= 75 ? "emerald" : "amber"}
        />
        <StatCard
          label="Pending Fees"
          value={`Rs ${pendingAmount.toFixed(0)}`}
          tone={pendingAmount > 0 ? "rose" : "emerald"}
        />
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <BookOpenCheck className="w-4 h-4 text-indigo-500" />
            Upcoming Homework
          </p>
          <Link href="/portal/homework" className="text-xs text-indigo-600 flex items-center gap-0.5">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardBody>
          {upcomingHomework.length === 0 ? (
            <p className="text-sm text-slate-400">Koi pending homework nahi hai.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingHomework.map((h) => (
                <li key={h.id} className="text-sm flex items-center justify-between">
                  <span>
                    <span className="font-medium text-slate-800">{h.subject.name}</span>
                    <span className="text-slate-500"> &middot; {h.title}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(h.dueDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-indigo-500" />
            Latest Notices
          </p>
          <Link href="/portal/notices" className="text-xs text-indigo-600 flex items-center gap-0.5">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardBody>
          {latestNotices.length === 0 ? (
            <p className="text-sm text-slate-400">Koi notice nahi hai.</p>
          ) : (
            <ul className="space-y-3">
              {latestNotices.map((n) => (
                <li key={n.id}>
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/portal/attendance"
          className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-2 text-sm text-slate-700"
        >
          <CalendarCheck className="w-4 h-4 text-indigo-500" />
          Attendance History
        </Link>
        <Link
          href="/portal/fees"
          className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-2 text-sm text-slate-700"
        >
          <Wallet className="w-4 h-4 text-indigo-500" />
          Fee Invoices
        </Link>
      </div>
    </div>
  );
}
