import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Triple-column ledger view for any account (Petty Cash Book is this
// pointed at the Cash/Petty Cash account): opening balance carried from
// everything before `from`, then each line with a running balance. ASSET
// and EXPENSE accounts have a normal DEBIT balance (debit increases it);
// LIABILITY/EQUITY/INCOME have a normal CREDIT balance -- flip the sign
// so "balance" always reads naturally for that account type.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) return NextResponse.json({ error: "Account nahi mila" }, { status: 404 });

  const debitNormal = account.type === "ASSET" || account.type === "EXPENSE";

  const openingLines = from
    ? await prisma.journalLine.findMany({
        where: { accountId: id, journalEntry: { date: { lt: new Date(from) } } },
      })
    : [];
  const openingDebit = openingLines.reduce((s, l) => s + Number(l.debit), 0);
  const openingCredit = openingLines.reduce((s, l) => s + Number(l.credit), 0);
  const openingBalance = debitNormal ? openingDebit - openingCredit : openingCredit - openingDebit;

  const lines = await prisma.journalLine.findMany({
    where: {
      accountId: id,
      journalEntry: {
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
    },
    include: { journalEntry: true },
    orderBy: [{ journalEntry: { date: "asc" } }, { id: "asc" }],
  });

  let running = openingBalance;
  const rows = lines.map((l) => {
    const debit = Number(l.debit);
    const credit = Number(l.credit);
    running += debitNormal ? debit - credit : credit - debit;
    return {
      date: l.journalEntry.date,
      narration: l.journalEntry.narration,
      reference: l.journalEntry.reference,
      debit,
      credit,
      balance: running,
    };
  });

  return NextResponse.json({
    account: { id: account.id, code: account.code, name: account.name, type: account.type },
    openingBalance,
    closingBalance: running,
    rows,
  });
}
