import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

function bucket(daysOverdue: number): string {
  if (daysOverdue <= 0) return "Not Due";
  if (daysOverdue <= 30) return "0-30";
  if (daysOverdue <= 60) return "31-60";
  if (daysOverdue <= 90) return "61-90";
  return "90+";
}

// Student Receivables Ageing -- every invoice not fully paid, bucketed by
// how many days past its due date it is.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await prisma.invoice.findMany({
    where: { status: { notIn: ["PAID", "CANCELLED"] } },
    include: { student: true, payments: true },
    orderBy: { dueDate: "asc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = invoices
    .map((inv) => {
      const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
      const outstanding = Number(inv.totalAmount) - paid;
      const daysOverdue = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / 86400000);
      return {
        id: inv.id,
        studentName: `${inv.student.firstName} ${inv.student.lastName}`,
        admissionNo: inv.student.admissionNo,
        title: inv.title,
        dueDate: inv.dueDate,
        outstanding,
        daysOverdue,
        bucket: bucket(daysOverdue),
      };
    })
    .filter((r) => r.outstanding > 0.01);

  const buckets = ["Not Due", "0-30", "31-60", "61-90", "90+"];
  const summary = buckets.map((b) => ({
    bucket: b,
    total: rows.filter((r) => r.bucket === b).reduce((s, r) => s + r.outstanding, 0),
    count: rows.filter((r) => r.bucket === b).length,
  }));

  return NextResponse.json({ rows, summary, total: rows.reduce((s, r) => s + r.outstanding, 0) });
}
