import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const FINANCE_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"];

// Standard school Chart of Accounts -- enough to post every day-to-day
// transaction (fee collection, salary, vendor bills, petty cash) without
// the Accountant having to invent account codes on day one. Safe to call
// repeatedly: skips any code that already exists.
const DEFAULTS: { code: string; name: string; type: "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE" }[] = [
  { code: "1010", name: "Cash", type: "ASSET" },
  { code: "1020", name: "Bank Account", type: "ASSET" },
  { code: "1030", name: "Student Receivables", type: "ASSET" },
  { code: "1040", name: "Petty Cash", type: "ASSET" },
  { code: "2010", name: "Vendor Payables", type: "LIABILITY" },
  { code: "2020", name: "Salary Payable", type: "LIABILITY" },
  { code: "3010", name: "Owner's Capital / Equity", type: "EQUITY" },
  { code: "4010", name: "Tuition Fee Income", type: "INCOME" },
  { code: "4020", name: "Transport Fee Income", type: "INCOME" },
  { code: "4030", name: "Admission Fee Income", type: "INCOME" },
  { code: "4090", name: "Other Income", type: "INCOME" },
  { code: "5010", name: "Salary Expense", type: "EXPENSE" },
  { code: "5020", name: "Transport Expense", type: "EXPENSE" },
  { code: "5030", name: "Utilities Expense", type: "EXPENSE" },
  { code: "5040", name: "Maintenance Expense", type: "EXPENSE" },
  { code: "5090", name: "Other Expense", type: "EXPENSE" },
];

export async function POST() {
  const session = await getSession();
  if (!session || !FINANCE_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const existing = await prisma.account.findMany({ select: { code: true } });
  const existingCodes = new Set(existing.map((a) => a.code));
  const toCreate = DEFAULTS.filter((d) => !existingCodes.has(d.code));
  if (toCreate.length > 0) {
    await prisma.account.createMany({
      data: toCreate.map((d) => ({ ...d, isSystem: true })),
    });
  }
  return NextResponse.json({ created: toCreate.length });
}
