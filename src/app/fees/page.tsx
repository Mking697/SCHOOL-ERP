import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export const instant = false;

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { status } = await searchParams;

  const invoices = await prisma.invoice.findMany({
    where: status ? { status } : undefined,
    include: { student: true, payments: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Fee Invoices</h1>
        <div className="flex gap-2">
          <Link href="/fees/structure" className="bg-gray-700 text-white rounded px-4 py-2 text-sm">
            Fee Structure
          </Link>
          <Link href="/fees/generate" className="bg-blue-600 text-white rounded px-4 py-2 text-sm">
            + Generate Invoices
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4 text-sm">
        {["", "PENDING", "PARTIAL", "PAID"].map((s) => (
          <Link
            key={s}
            href={s ? `/fees?status=${s}` : "/fees"}
            className={`px-3 py-1 rounded border ${
              status === s || (!status && s === "")
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-gray-300"
            }`}
          >
            {s || "ALL"}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Title</th>
              <th className="p-3">Total</th>
              <th className="p-3">Paid</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
              return (
                <tr key={inv.id} className="border-t">
                  <td className="p-3">
                    {inv.student.firstName} {inv.student.lastName}
                  </td>
                  <td className="p-3">{inv.title}</td>
                  <td className="p-3">₹{Number(inv.totalAmount).toFixed(2)}</td>
                  <td className="p-3">₹{paid.toFixed(2)}</td>
                  <td className="p-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span
                      className={
                        inv.status === "PAID"
                          ? "text-green-700"
                          : inv.status === "PARTIAL"
                          ? "text-yellow-700"
                          : "text-red-600"
                      }
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/fees/${inv.id}`} className="text-blue-600">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Koi invoice nahi hai
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
