import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PlusCircle, Settings2, Receipt } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, statusTone } from "@/components/ui/badge";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";

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
    <>
      <PageHeader
        title="Fee Invoices"
        description="Track and manage student fee invoices"
        actions={
          <>
            <Link href="/fees/structure">
              <Button variant="secondary">
                <Settings2 className="h-4 w-4" />
                Fee Structure
              </Button>
            </Link>
            <Link href="/fees/generate">
              <Button variant="primary">
                <PlusCircle className="h-4 w-4" />
                Generate Invoices
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex gap-2 mb-4 text-sm">
        {["", "PENDING", "PARTIAL", "PAID"].map((s) => (
          <Link key={s} href={s ? `/fees?status=${s}` : "/fees"}>
            <Button variant={status === s || (!status && s === "") ? "primary" : "secondary"} size="sm">
              {s || "ALL"}
            </Button>
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Student</Th>
              <Th>Title</Th>
              <Th>Total</Th>
              <Th>Paid</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <tbody>
            {invoices.map((inv) => {
              const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
              return (
                <Tr key={inv.id}>
                  <Td>
                    {inv.student.firstName} {inv.student.lastName}
                  </Td>
                  <Td>{inv.title}</Td>
                  <Td>₹{Number(inv.totalAmount).toFixed(2)}</Td>
                  <Td>₹{paid.toFixed(2)}</Td>
                  <Td>{new Date(inv.dueDate).toLocaleDateString()}</Td>
                  <Td>
                    <Badge tone={statusTone(inv.status)}>{inv.status}</Badge>
                  </Td>
                  <Td>
                    <Link href={`/fees/${inv.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </Td>
                </Tr>
              );
            })}
            {invoices.length === 0 && (
              <EmptyRow colSpan={7}>
                <div className="flex flex-col items-center gap-1">
                  <Receipt className="h-5 w-5 text-slate-300" />
                  Koi invoice nahi hai
                </div>
              </EmptyRow>
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
