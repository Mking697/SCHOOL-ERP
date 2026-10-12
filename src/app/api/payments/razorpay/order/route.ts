import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getPortalSession } from "@/lib/portal-auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const portalSession = session ? null : await getPortalSession();
  if (!session && !portalSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay configure nahi hai. RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET set karo .env mein." },
      { status: 500 }
    );
  }

  const { invoiceId, amount } = await req.json();
  if (!invoiceId || !amount) {
    return NextResponse.json({ error: "invoiceId and amount required" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  // A portal (parent/student) session may only ever pay for its OWN
  // student's invoice, never someone else's by guessing an invoiceId.
  if (portalSession && invoice.studentId !== portalSession.studentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  const order = await razorpay.orders.create({
    amount: Math.round(Number(amount) * 100), // paise
    currency: "INR",
    receipt: invoiceId,
  });

  return NextResponse.json({ order, keyId });
}
