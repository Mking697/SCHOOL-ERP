import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const FINANCE_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"];

// "Other Expense" -- a one-step form for day-to-day cash/bank expenses that
// don't go through a vendor bill (tea, stationery, auto fare, etc). Posts
// a single balanced 2-line Journal Entry: Dr the chosen Expense account,
// Cr the chosen Cash/Bank account -- same ledger as everything else.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const entries = await prisma.journalEntry.findMany({
    where: { lines: { some: { account: { type: "EXPENSE" } } }, bill: null },
    include: { lines: { include: { account: true } } },
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !FINANCE_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { date, expenseAccountId, paidFromAccountId, amount, narration } = await req.json();
  const numAmount = Number(amount);
  if (!date || !expenseAccountId || !paidFromAccountId || !numAmount || numAmount <= 0 || !narration) {
    return NextResponse.json({ error: "Sab fields zaroori hai" }, { status: 400 });
  }
  const entry = await prisma.journalEntry.create({
    data: {
      date: new Date(date),
      narration,
      reference: "Other Expense",
      createdBy: session.email,
      lines: {
        create: [
          { accountId: expenseAccountId, debit: numAmount, credit: 0 },
          { accountId: paidFromAccountId, debit: 0, credit: numAmount },
        ],
      },
    },
    include: { lines: { include: { account: true } } },
  });
  return NextResponse.json(entry, { status: 201 });
}
