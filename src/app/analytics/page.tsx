import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export const instant = false;

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
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Active Students</p>
          <p className="text-2xl font-bold">{studentCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Active Staff</p>
          <p className="text-2xl font-bold">{staffCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Attendance (30 days)</p>
          <p className="text-2xl font-bold">{attendancePct.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Fee Collection</p>
          <p className="text-2xl font-bold">{feeCollectionPct.toFixed(1)}%</p>
          <p className="text-xs text-gray-400">
            ₹{totalPaid.toFixed(0)} / ₹{totalFees.toFixed(0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Avg Exam Score</p>
          <p className="text-2xl font-bold">{avgExamPct.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
      </div>
    </div>
  );
}
