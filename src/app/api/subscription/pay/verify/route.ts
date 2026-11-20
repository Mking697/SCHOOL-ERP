import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isVendorBillingConfigured, invalidateSubscriptionCache } from "@/lib/subscription";
import { forwardSubscriptionPayment } from "@/lib/subscription-payment-proxy";

// SCHOOL_API_KEY is added server-side, never accepted from browser input.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "PRINCIPAL", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isVendorBillingConfigured()) {
    return NextResponse.json({ error: "Vendor billing not configured on this install" }, { status: 400 });
  }
  const result = await forwardSubscriptionPayment(req, "verify", {
    vendorUrl: process.env.VENDOR_SERVER_URL!,
    schoolKey: process.env.SCHOOL_API_KEY!,
    onVerified: invalidateSubscriptionCache,
  });
  return NextResponse.json(result.body, { status: result.status });
}
