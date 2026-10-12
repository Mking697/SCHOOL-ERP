import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id: invoiceId } = await params;
  const { amount, method } = await req.json();

  if (!amount || !method) {
    return NextResponse.json({ error: "amount and method required" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      method,
      recordedBy: session.email,
    },
  });

  const totalPaid =
    invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(amount);
  const newStatus =
    totalPaid >= Number(invoice.totalAmount)
      ? "PAID"
      : totalPaid > 0
      ? "PARTIAL"
      : "PENDING";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: newStatus },
  });

  return NextResponse.json({ payment, status: newStatus }, { status: 201 });
}
