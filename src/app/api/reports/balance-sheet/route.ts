import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Balance Sheet as of a date: Assets vs (Liabilities + Equity + Net
// Profit-to-date). Net Profit is ALL income minus ALL expense up to
// `asOf` (there's no formal year-end closing entry yet, so it's folded
// into Equity here) -- this keeps Assets == Liabilities + Equity true,
// which is the one invariant a balance sheet must satisfy.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const asOf = new URL(req.url).searchParams.get("asOf");
  const dateFilter = asOf ? { lte: new Date(asOf) } : undefined;

  const accounts = await prisma.account.findMany({
    where: { type: { in: ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"] } },
    include: { journalLines: { where: dateFilter ? { journalEntry: { date: dateFilter } } : undefined } },
  });

  function balanceFor(a: (typeof accounts)[number], debitNormal: boolean) {
    const debit = a.journalLines.reduce((s, l) => s + Number(l.debit), 0);
    const credit = a.journalLines.reduce((s, l) => s + Number(l.credit), 0);
    return debitNormal ? debit - credit : credit - debit;
  }

  const assets = accounts
    .filter((a) => a.type === "ASSET")
    .map((a) => ({ id: a.id, code: a.code, name: a.name, amount: balanceFor(a, true) }))
    .filter((r) => r.amount !== 0);
  const liabilities = accounts
    .filter((a) => a.type === "LIABILITY")
    .map((a) => ({ id: a.id, code: a.code, name: a.name, amount: balanceFor(a, false) }))
    .filter((r) => r.amount !== 0);
  const equity = accounts
    .filter((a) => a.type === "EQUITY")
    .map((a) => ({ id: a.id, code: a.code, name: a.name, amount: balanceFor(a, false) }))
    .filter((r) => r.amount !== 0);

  const totalIncome = accounts
    .filter((a) => a.type === "INCOME")
    .reduce((s, a) => s + balanceFor(a, false), 0);
  const totalExpense = accounts
    .filter((a) => a.type === "EXPENSE")
    .reduce((s, a) => s + balanceFor(a, true), 0);
  const netProfit = totalIncome - totalExpense;

  const totalAssets = assets.reduce((s, r) => s + r.amount, 0);
  const totalLiabilities = liabilities.reduce((s, r) => s + r.amount, 0);
  const totalEquity = equity.reduce((s, r) => s + r.amount, 0) + netProfit;

  return NextResponse.json({
    assets,
    liabilities,
    equity,
    netProfit,
    totalAssets,
    totalLiabilities,
    totalEquity,
    balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
  });
}
