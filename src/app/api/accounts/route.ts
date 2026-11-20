import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const FINANCE_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accounts = await prisma.account.findMany({ orderBy: [{ type: "asc" }, { code: "asc" }] });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !FINANCE_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { code, name, type } = body;
  if (!code || !name || !type) {
    return NextResponse.json({ error: "code, name, type zaroori hai" }, { status: 400 });
  }
  const validTypes = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
  }
  try {
    const account = await prisma.account.create({ data: { code, name, type } });
    return NextResponse.json(account, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Account code already exists" }, { status: 409 });
  }
}
