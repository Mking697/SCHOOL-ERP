import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const instant = false;

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    studentCount,
    staffCount,
    attendanceTotal,
    attendancePresent,
    invoices,
    marks,
  ] = await Promise.all([
    prisma.student.count({ where: { isActive: true } }),
    prisma.staff.count({ where: { isActive: true } }),
    prisma.attendance.count({ where: { date: { gte: thirtyDaysAgo } } }),
    prisma.attendance.count({ where: { date: { gte: thirtyDaysAgo }, status: "PRESENT" } }),
    prisma.invoice.findMany({ include: { payments: true } }),
    prisma.mark.findMany({ include: { examSubject: true } }),
  ]);

  const attendancePct = attendanceTotal > 0 ? (attendancePresent / attendanceTotal) * 100 : 0;

  const totalFees = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
  const totalPaid = invoices.reduce(
    (s, i) => s + i.payments.reduce((ps, p) => ps + Number(p.amount), 0),
    0
  );
  const feeCollectionPct = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

  const avgExamPct =
    marks.length > 0
      ? marks.reduce((s, m) => s + (Number(m.marksObtained) / m.examSubject.maxMarks) * 100, 0) /
        marks.length
      : 0;

  return (
    <div>
      <PageHeader title="Analytics Dashboard" description="Last 30 days, across all modules" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Active Students" value={studentCount} tone="indigo" />
        <StatCard label="Active Staff" value={staffCount} tone="sky" />
        <StatCard label="Total Invoices" value={invoices.length} tone="indigo" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-slate-700">Attendance (30 days)</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-slate-900">{attendancePct.toFixed(1)}%</p>
            <ProgressBar pct={attendancePct} color="bg-emerald-500" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-slate-700">Fee Collection</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-slate-900">{feeCollectionPct.toFixed(1)}%</p>
            <ProgressBar pct={feeCollectionPct} color="bg-indigo-500" />
            <p className="text-xs text-slate-400 mt-2">
              Rs {totalPaid.toFixed(0)} collected of Rs {totalFees.toFixed(0)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-slate-700">Avg Exam Score</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-slate-900">{avgExamPct.toFixed(1)}%</p>
            <ProgressBar pct={avgExamPct} color="bg-amber-500" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
