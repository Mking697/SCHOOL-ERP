import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const FINANCE_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bills = await prisma.bill.findMany({
    orderBy: { billDate: "desc" },
    include: { vendor: true, expenseAccount: true, payments: true },
  });
  return NextResponse.json(bills);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !FINANCE_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { vendorId, billNumber, billDate, dueDate, description, amount, expenseAccountId, attachmentUrl, attachmentName } = body;
  if (!vendorId || !billDate || !dueDate || !description || !amount || !expenseAccountId) {
    return NextResponse.json({ error: "Sab fields zaroori hai" }, { status: 400 });
  }
  if (attachmentUrl && String(attachmentUrl).length > 3_000_000) {
    return NextResponse.json({ error: "Attachment bahut badi hai (max ~2MB)" }, { status: 400 });
  }

  // Vendor Payables is the one system liability account every bill books
  // against -- seeded as code 2010 by /api/accounts/seed-defaults.
  const payablesAccount = await prisma.account.findFirst({ where: { code: "2010" } });
  if (!payablesAccount) {
    return NextResponse.json(
      { error: "Vendor Payables account nahi mila -- pehle Chart of Accounts seed karo" },
      { status: 400 },
    );
  }

  const numAmount = Number(amount);

  const result = await prisma.$transaction(async (tx) => {
    const entry = await tx.journalEntry.create({
      data: {
        date: new Date(billDate),
        narration: `Bill: ${description}`,
        reference: billNumber || undefined,
        createdBy: session.email,
        lines: {
          create: [
            { accountId: expenseAccountId, debit: numAmount, credit: 0 },
            { accountId: payablesAccount.id, debit: 0, credit: numAmount },
          ],
        },
      },
    });
    const bill = await tx.bill.create({
      data: {
        vendorId,
        billNumber,
        billDate: new Date(billDate),
        dueDate: new Date(dueDate),
        description,
        amount: numAmount,
        expenseAccountId,
        journalEntryId: entry.id,
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
      },
      include: { vendor: true, expenseAccount: true, payments: true },
    });
    return bill;
  });

  return NextResponse.json(result, { status: 201 });
}
