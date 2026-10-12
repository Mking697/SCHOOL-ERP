import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isVendorBillingConfigured } from "@/lib/subscription";

// Proxies to the vendor's Billing Server -- SCHOOL_API_KEY stays here on
// the server, never sent to the browser. Only SUPER_ADMIN/SCHOOL_ADMIN
// can trigger a renewal payment.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isVendorBillingConfigured()) {
    return NextResponse.json({ error: "Vendor billing not configured on this install" }, { status: 400 });
  }

  const { plan } = await req.json();
  const res = await fetch(`${process.env.VENDOR_SERVER_URL}/api/public/pay/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.SCHOOL_API_KEY, plan }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
