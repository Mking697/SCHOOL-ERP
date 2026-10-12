import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import PaymentPanel from "./payment-panel";

export const instant = false;

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      student: { include: { section: { include: { classLevel: true } } } },
      items: true,
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!invoice) notFound();

  const school = await prisma.school.findFirst();

  const totalPaid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  const balance = Number(invoice.totalAmount) - totalPaid;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-4 print:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-bold text-lg">{school?.name}</p>
              <p className="text-sm text-gray-500">Fee Invoice / Receipt</p>
            </div>
            <span
              className={`text-sm font-semibold ${
                invoice.status === "PAID"
                  ? "text-green-700"
                  : invoice.status === "PARTIAL"
                  ? "text-yellow-700"
                  : "text-red-600"
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <p>
              <span className="text-gray-500">Student:</span> {invoice.student.firstName}{" "}
              {invoice.student.lastName}
            </p>
            <p>
              <span className="text-gray-500">Admission No:</span> {invoice.student.admissionNo}
            </p>
            <p>
              <span className="text-gray-500">Class:</span>{" "}
              {invoice.student.section
                ? `${invoice.student.section.classLevel.name} - ${invoice.student.section.name}`
                : "-"}
            </p>
            <p>
              <span className="text-gray-500">Due Date:</span>{" "}
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>

          <table className="w-full text-sm mb-4">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Description</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-2">{it.description}</td>
                  <td className="p-2 text-right">₹{Number(it.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-semibold">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">₹{Number(invoice.totalAmount).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="p-2">Paid</td>
                <td className="p-2 text-right">₹{totalPaid.toFixed(2)}</td>
              </tr>
              <tr className="font-semibold">
                <td className="p-2">Balance</td>
                <td className="p-2 text-right">₹{balance.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          {invoice.payments.length > 0 && (
            <div className="text-sm">
              <p className="font-medium mb-1">Payment History</p>
              <ul className="space-y-1">
                {invoice.payments.map((p) => (
                  <li key={p.id} className="text-gray-600">
                    ₹{Number(p.amount).toFixed(2)} via {p.method} on{" "}
                    {new Date(p.paidAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <PaymentPanel invoiceId={invoice.id} balance={balance} status={invoice.status} />
      </div>
    </div>
  );
}
