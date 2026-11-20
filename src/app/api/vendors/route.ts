import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const FINANCE_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
    include: { bills: { select: { amount: true, status: true } } },
  });
  return NextResponse.json(vendors);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !FINANCE_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, phone, email, address } = await req.json();
  if (!name) return NextResponse.json({ error: "Vendor name zaroori hai" }, { status: 400 });
  const vendor = await prisma.vendor.create({ data: { name, phone, email, address } });
  return NextResponse.json(vendor, { status: 201 });
}
