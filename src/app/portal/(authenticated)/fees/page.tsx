import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";
import Link from "next/link";
import ExportButtons from "@/components/export-buttons";
import type { ExportColumn } from "@/lib/export";

export const instant = false;

export default async function PortalFeesPage() {
  const session = await getPortalSession();
  const invoices = await prisma.invoice.findMany({
    where: { studentId: session!.studentId },
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });

  const exportRows = invoices.map((inv) => {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return {
      title: inv.title,
      dueDate: new Date(inv.dueDate).toLocaleDateString(),
      total: Number(inv.totalAmount),
      paid,
      status: inv.status,
    };
  });
  const columns: ExportColumn<(typeof exportRows)[number]>[] = [
    { header: "Title", value: (r) => r.title },
    { header: "Due Date", value: (r) => r.dueDate },
    { header: "Total Amount", value: (r) => r.total },
    { header: "Paid Amount", value: (r) => r.paid },
    { header: "Status", value: (r) => r.status },
  ];

  return (
    <div>
      <PageHeader
        title="Fee Invoices"
        description="View and pay your fees online"
        actions={
          <ExportButtons data={exportRows} columns={columns} filename="my-fee-invoices" sheetName="Fee Invoices" />
        }
      />
      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Title</Th>
              <Th>Due Date</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <tbody>
            {invoices.map((inv) => {
              const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
              return (
                <Tr key={inv.id}>
                  <Td>
                    <Link href={`/fees/${inv.id}`} className="text-indigo-600 font-medium">
                      {inv.title}
                    </Link>
                  </Td>
                  <Td>{new Date(inv.dueDate).toLocaleDateString()}</Td>
                  <Td className="text-right">
                    Rs {Number(inv.totalAmount).toFixed(0)}
                    {paid > 0 && paid < Number(inv.totalAmount) && (
                      <span className="text-xs text-slate-400 block">Paid Rs {paid.toFixed(0)}</span>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={statusTone(inv.status)}>{inv.status}</Badge>
                  </Td>
                </Tr>
              );
            })}
            {invoices.length === 0 && <EmptyRow colSpan={4}>Koi invoice abhi nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
