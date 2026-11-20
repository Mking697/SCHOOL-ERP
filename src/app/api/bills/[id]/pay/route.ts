import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const FINANCE_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !FINANCE_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { amount, method, cashOrBankAccountId } = await req.json();
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0 || !method || !cashOrBankAccountId) {
    return NextResponse.json({ error: "Amount, method, aur Cash/Bank account zaroori hai" }, { status: 400 });
  }

  const bill = await prisma.bill.findUnique({ include: { payments: true }, where: { id } });
  if (!bill) return NextResponse.json({ error: "Bill nahi mila" }, { status: 404 });

  const payablesAccount = await prisma.account.findFirst({ where: { code: "2010" } });
  if (!payablesAccount) {
    return NextResponse.json({ error: "Vendor Payables account nahi mila" }, { status: 400 });
  }

  const alreadyPaid = bill.payments.reduce((s, p) => s + Number(p.amount), 0);
  const remaining = Number(bill.amount) - alreadyPaid;
  if (numAmount > remaining + 0.01) {
    return NextResponse.json(
      { error: `Payment amount bill ki baqaya raqam (${remaining.toFixed(2)}) se zyada nahi ho sakta` },
      { status: 400 },
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const entry = await tx.journalEntry.create({
      data: {
        date: new Date(),
        narration: `Bill payment: ${bill.description}`,
        reference: bill.billNumber || undefined,
        createdBy: session.email,
        lines: {
          create: [
            { accountId: payablesAccount.id, debit: numAmount, credit: 0 },
            { accountId: cashOrBankAccountId, debit: 0, credit: numAmount },
          ],
        },
      },
    });
    await tx.billPayment.create({
      data: { billId: id, amount: numAmount, method, journalEntryId: entry.id },
    });
    const newTotal = alreadyPaid + numAmount;
    const status: "PAID" | "PARTIALLY_PAID" = newTotal >= Number(bill.amount) - 0.01 ? "PAID" : "PARTIALLY_PAID";
    const updated = await tx.bill.update({
      where: { id },
      data: { status },
      include: { vendor: true, expenseAccount: true, payments: true },
    });
    return updated;
  });

  return NextResponse.json(result);
}
