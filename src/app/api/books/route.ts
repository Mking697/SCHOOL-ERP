import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const books = await prisma.book.findMany({ orderBy: { title: "asc" } });
  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { title, author, isbn, totalCopies } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  const copies = totalCopies ? Number(totalCopies) : 1;
  const book = await prisma.book.create({
    data: { title, author, isbn, totalCopies: copies, availableCopies: copies },
  });
  return NextResponse.json(book, { status: 201 });
}
