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
  const requests = await prisma.serviceRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  // Parents/staff raising a request don't necessarily need a login session
  // in a future portal, but for now this app only has staff logins, so we
  // still require a session (keeps it simple + avoids spam).
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { raisedByName, raisedByContact, subject, description } = await req.json();
  if (!raisedByName || !raisedByContact || !subject) {
    return NextResponse.json(
      { error: "raisedByName, raisedByContact, subject required" },
      { status: 400 }
    );
  }
  const request_ = await prisma.serviceRequest.create({
    data: { raisedByName, raisedByContact, subject, description },
  });
  return NextResponse.json(request_, { status: 201 });
}
