import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import PaymentPanel from "./payment-panel";
import { Badge, statusTone } from "@/components/ui/badge";
import { BrandMark } from "@/components/ui/brand-mark";

export const instant = false;

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  const portalSession = session ? null : await getPortalSession();
  if (!session && !portalSession) redirect("/login");

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      student: { include: { section: { include: { classLevel: true } } } },
      items: true,
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!invoice) notFound();
  if (portalSession && invoice.studentId !== portalSession.studentId) redirect("/portal");

  const school = await prisma.school.findFirst();

  const totalPaid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  const balance = Number(invoice.totalAmount) - totalPaid;

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:p-0">
      <div className="max-w-2xl mx-auto px-4 print:px-0">
        <div className="bg-white rounded-2xl shadow-xl print:shadow-none border border-slate-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-8 py-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 shrink-0 flex items-center justify-center overflow-hidden">
                  <BrandMark logoUrl={school?.logoUrl} schoolName={school?.name} className="w-5 h-5" />
                </div>
                <p className="font-bold text-lg">{school?.name}</p>
              </div>
              <p className="text-sm text-indigo-200 mt-1">Fee Invoice / Receipt</p>
              <p className="text-xs text-indigo-300 mt-2 font-mono">#{invoice.id.slice(-10).toUpperCase()}</p>
            </div>
            <Badge tone={statusTone(invoice.status)} className="bg-white/90 text-sm px-3 py-1">
              {invoice.status}
            </Badge>
          </div>

          <div className="px-8 py-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-6 bg-slate-50 rounded-lg p-4">
              <p>
                <span className="text-slate-400">Student</span>
                <span className="block font-medium text-slate-900">
                  {invoice.student.firstName} {invoice.student.lastName}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Admission No.</span>
                <span className="block font-medium text-slate-900">{invoice.student.admissionNo}</span>
              </p>
              <p>
                <span className="text-slate-400">Class</span>
                <span className="block font-medium text-slate-900">
                  {invoice.student.section
                    ? `${invoice.student.section.classLevel.name} - ${invoice.student.section.name}`
                    : "-"}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Due Date</span>
                <span className="block font-medium text-slate-900">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </p>
            </div>

            <table className="w-full text-sm mb-6 border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5 text-left font-medium">Description</th>
                  <th className="p-2.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it, i) => (
                  <tr key={it.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="p-2.5 border-t border-slate-100">{it.description}</td>
                    <td className="p-2.5 text-right border-t border-slate-100">
                      Rs {Number(it.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100">
                  <td className="p-2.5 font-medium border-t border-slate-200">Total</td>
                  <td className="p-2.5 text-right font-medium border-t border-slate-200">
                    Rs {Number(invoice.totalAmount).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-700 border-t border-slate-200">Paid</td>
                  <td className="p-2.5 text-right text-emerald-700 border-t border-slate-200">
                    Rs {totalPaid.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="flex items-center justify-between bg-indigo-50 rounded-lg px-5 py-3 mb-2">
              <p className="text-sm font-medium text-indigo-900">Balance Due</p>
              <p className="text-2xl font-bold text-indigo-700">Rs {balance.toFixed(2)}</p>
            </div>

            {invoice.payments.length > 0 && (
              <div className="text-sm mt-6">
                <p className="font-medium text-slate-700 mb-2">Payment History</p>
                <ul className="space-y-2">
                  {invoice.payments.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between text-slate-600 bg-slate-50 rounded-lg px-3 py-2"
                    >
                      <span>
                        {p.method.replace("_", " ")} &middot;{" "}
                        {new Date(p.paidAt).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-slate-800">Rs {Number(p.amount).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <PaymentPanel invoiceId={invoice.id} balance={balance} status={invoice.status} isPortal={!!portalSession} />
      </div>
    </div>
  );
}
