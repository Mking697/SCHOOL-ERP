import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const issues = await prisma.bookIssue.findMany({
    where: status ? { status } : undefined,
    include: { book: true, student: true },
    orderBy: { issueDate: "desc" },
  });
  return NextResponse.json(issues);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { bookId, studentId, dueDate } = await req.json();
  if (!bookId || !studentId || !dueDate) {
    return NextResponse.json({ error: "bookId, studentId, dueDate required" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || book.availableCopies < 1) {
    return NextResponse.json({ error: "Book available nahi hai" }, { status: 400 });
  }

  const [issue] = await prisma.$transaction([
    prisma.bookIssue.create({
      data: { bookId, studentId, dueDate: new Date(dueDate) },
    }),
    prisma.book.update({
      where: { id: bookId },
      data: { availableCopies: { decrement: 1 } },
    }),
  ]);

  return NextResponse.json(issue, { status: 201 });
}
