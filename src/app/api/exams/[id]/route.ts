import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      classLevel: { include: { sections: { include: { students: true } } } },
      subjects: { include: { subject: true, marks: true } },
    },
  });
  if (!exam) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(exam);
}
