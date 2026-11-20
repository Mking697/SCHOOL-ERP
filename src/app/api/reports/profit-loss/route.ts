import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Profit & Loss for a period: every Income account's credit total minus
// every Expense account's debit total, within [from, to].
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter = {
    gte: from ? new Date(from) : undefined,
    lte: to ? new Date(to) : undefined,
  };

  const accounts = await prisma.account.findMany({
    where: { type: { in: ["INCOME", "EXPENSE"] } },
    orderBy: [{ type: "asc" }, { code: "asc" }],
    include: { journalLines: { where: { journalEntry: { date: dateFilter } } } },
  });

  const income = accounts
    .filter((a) => a.type === "INCOME")
    .map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      amount: a.journalLines.reduce((s, l) => s + Number(l.credit) - Number(l.debit), 0),
    }))
    .filter((r) => r.amount !== 0);

  const expense = accounts
    .filter((a) => a.type === "EXPENSE")
    .map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      amount: a.journalLines.reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0),
    }))
    .filter((r) => r.amount !== 0);

  const totalIncome = income.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expense.reduce((s, r) => s + r.amount, 0);

  return NextResponse.json({
    income,
    expense,
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
  });
}
