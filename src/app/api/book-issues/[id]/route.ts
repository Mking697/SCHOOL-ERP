import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { action } = await req.json(); // "return"
  if (action !== "return") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const issue = await prisma.bookIssue.findUnique({ where: { id } });
  if (!issue || issue.status === "RETURNED") {
    return NextResponse.json({ error: "Already returned ya invalid" }, { status: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.bookIssue.update({
      where: { id },
      data: { status: "RETURNED", returnDate: new Date() },
    }),
    prisma.book.update({
      where: { id: issue.bookId },
      data: { availableCopies: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(updated);
}
