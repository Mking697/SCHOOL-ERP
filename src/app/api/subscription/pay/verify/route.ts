import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isVendorBillingConfigured, invalidateSubscriptionCache } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isVendorBillingConfigured()) {
    return NextResponse.json({ error: "Vendor billing not configured on this install" }, { status: 400 });
  }

  const body = await req.json();
  const res = await fetch(`${process.env.VENDOR_SERVER_URL}/api/public/pay/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.SCHOOL_API_KEY, ...body }),
  });
  const data = await res.json();
  if (res.ok) {
    // Unlock on the very next page load instead of waiting for the
    // hourly cache to expire.
    invalidateSubscriptionCache();
  }
  return NextResponse.json(data, { status: res.status });
}
