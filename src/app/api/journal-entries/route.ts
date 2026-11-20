import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const FINANCE_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId") || undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const entries = await prisma.journalEntry.findMany({
    where: {
      date: from || to ? { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } : undefined,
      lines: accountId ? { some: { accountId } } : undefined,
    },
    include: { lines: { include: { account: true } } },
    orderBy: { date: "desc" },
    take: 200,
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !FINANCE_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { date, narration, reference, lines } = body as {
    date: string;
    narration: string;
    reference?: string;
    lines: { accountId: string; debit?: number; credit?: number }[];
  };

  if (!date || !narration || !Array.isArray(lines) || lines.length < 2) {
    return NextResponse.json(
      { error: "Date, narration aur kam se kam 2 lines (Debit + Credit) zaroori hai" },
      { status: 400 },
    );
  }

  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of lines) {
    const debit = Number(line.debit || 0);
    const credit = Number(line.credit || 0);
    if (debit < 0 || credit < 0) {
      return NextResponse.json({ error: "Amount negative nahi ho sakta" }, { status: 400 });
    }
    if (debit > 0 && credit > 0) {
      return NextResponse.json({ error: "Ek line me sirf Debit ya sirf Credit ho sakta hai" }, { status: 400 });
    }
    if (debit === 0 && credit === 0) {
      return NextResponse.json({ error: "Har line me ek amount hona chahiye" }, { status: 400 });
    }
    totalDebit += debit;
    totalCredit += credit;
  }

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json(
      { error: `Entry balance nahi hai -- Debit ${totalDebit.toFixed(2)} vs Credit ${totalCredit.toFixed(2)}` },
      { status: 400 },
    );
  }

  const entry = await prisma.journalEntry.create({
    data: {
      date: new Date(date),
      narration,
      reference: reference || null,
      createdBy: session.email,
      lines: {
        create: lines.map((l) => ({
          accountId: l.accountId,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
        })),
      },
    },
    include: { lines: { include: { account: true } } },
  });
  return NextResponse.json(entry, { status: 201 });
}
