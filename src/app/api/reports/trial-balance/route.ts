import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Trial Balance: every account's net balance as of a date, displayed in
// its NORMAL column (Assets/Expenses show as Debit, Liabilities/
// Equity/Income show as Credit). If the ledger is really balanced,
// totalDebit === totalCredit always -- this endpoint is also a sanity
// check on the whole double-entry engine.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const asOf = new URL(req.url).searchParams.get("asOf");

  const accounts = await prisma.account.findMany({
    orderBy: [{ type: "asc" }, { code: "asc" }],
    include: {
      journalLines: {
        where: asOf ? { journalEntry: { date: { lte: new Date(asOf) } } } : undefined,
      },
    },
  });

  const rows = accounts
    .map((a) => {
      const debit = a.journalLines.reduce((s, l) => s + Number(l.debit), 0);
      const credit = a.journalLines.reduce((s, l) => s + Number(l.credit), 0);
      const debitNormal = a.type === "ASSET" || a.type === "EXPENSE";
      const net = debitNormal ? debit - credit : credit - debit;
      let debitBalance = 0;
      let creditBalance = 0;
      if (debitNormal) {
        if (net >= 0) debitBalance = net;
        else creditBalance = -net;
      } else {
        if (net >= 0) creditBalance = net;
        else debitBalance = -net;
      }
      return { id: a.id, code: a.code, name: a.name, type: a.type, debitBalance, creditBalance };
    })
    .filter((r) => r.debitBalance !== 0 || r.creditBalance !== 0);

  const totalDebit = rows.reduce((s, r) => s + r.debitBalance, 0);
  const totalCredit = rows.reduce((s, r) => s + r.creditBalance, 0);

  return NextResponse.json({ rows, totalDebit, totalCredit });
}
