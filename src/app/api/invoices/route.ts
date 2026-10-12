import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const status = searchParams.get("status");

  const invoices = await prisma.invoice.findMany({
    where: {
      studentId: studentId || undefined,
      status: status || undefined,
    },
    include: {
      student: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { mode, title, dueDate } = body;

  if (!title || !dueDate) {
    return NextResponse.json({ error: "title and dueDate required" }, { status: 400 });
  }

  if (mode === "single") {
    const { studentId, items } = body;
    if (!studentId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "studentId and items[] required" }, { status: 400 });
    }
    const totalAmount = items.reduce((sum: number, i: { amount: number }) => sum + Number(i.amount), 0);
    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        title,
        totalAmount,
        dueDate: new Date(dueDate),
        items: { create: items.map((i: { description: string; amount: number }) => ({
          description: i.description,
          amount: i.amount,
        })) },
      },
      include: { items: true },
    });
    return NextResponse.json(invoice, { status: 201 });
  }

  // mode === "bulk": generate for every active student in a section using
  // that class's fee structure
  const { sectionId } = body;
  if (!sectionId) {
    return NextResponse.json({ error: "sectionId required for bulk mode" }, { status: 400 });
  }

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      students: { where: { isActive: true } },
      classLevel: { include: { feeStructures: { include: { feeHead: true } } } },
    },
  });

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }
  if (section.classLevel.feeStructures.length === 0) {
    return NextResponse.json(
      { error: "Is class ke liye pehle fee structure set karo" },
      { status: 400 }
    );
  }

  const items = section.classLevel.feeStructures.map((fs) => ({
    description: fs.feeHead.name,
    amount: fs.amount,
  }));
  const totalAmount = items.reduce((sum, i) => sum + Number(i.amount), 0);

  const created = await prisma.$transaction(
    section.students.map((s) =>
      prisma.invoice.create({
        data: {
          studentId: s.id,
          title,
          totalAmount,
          dueDate: new Date(dueDate),
          items: { create: items },
        },
      })
    )
  );

  return NextResponse.json({ ok: true, count: created.length }, { status: 201 });
}
