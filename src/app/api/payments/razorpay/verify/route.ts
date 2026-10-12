import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getPortalSession } from "@/lib/portal-auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const portalSession = session ? null : await getPortalSession();
  if (!session && !portalSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  const {
    invoiceId,
    amount,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = await req.json();

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Signature mismatch — payment verify fail" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Scope: a portal session may only confirm payment for its own invoice.
  if (portalSession && invoice.studentId !== portalSession.studentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      method: "ONLINE",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      recordedBy: session ? session.email : `portal:${portalSession!.admissionNo}`,
    },
  });

  const totalPaid =
    invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(amount);
  const newStatus = totalPaid >= Number(invoice.totalAmount) ? "PAID" : "PARTIAL";

  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: newStatus } });

  return NextResponse.json({ ok: true, status: newStatus });
}
