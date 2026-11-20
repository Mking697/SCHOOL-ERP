import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const FINANCE_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"];

// Only lets an account be removed if it has never been posted to and is
// not a seeded system account -- deleting an account with journal history
// would silently corrupt every report derived from the ledger.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !FINANCE_ROLES.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const account = await prisma.account.findUnique({
    where: { id },
    include: { _count: { select: { journalLines: true, bills: true } } },
  });
  if (!account) return NextResponse.json({ error: "Account nahi mila" }, { status: 404 });
  if (account.isSystem) {
    return NextResponse.json({ error: "Default system accounts delete nahi ho sakte" }, { status: 400 });
  }
  if (account._count.journalLines > 0 || account._count.bills > 0) {
    return NextResponse.json(
      { error: "Is account me transactions ho chuki hain -- delete nahi ho sakta (audit trail preserve karna zaroori hai)" },
      { status: 400 },
    );
  }
  await prisma.account.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
