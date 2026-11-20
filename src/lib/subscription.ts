// Online subscription check against the vendor's central Billing Server
// (see /vendor-server). Entirely OPT-IN: if VENDOR_SERVER_URL or
// SCHOOL_API_KEY aren't set in this install's .env, this check is
// skipped completely and the app behaves exactly like a standalone
// license-only install (Phase 9's offline HMAC license still works
// independently of this).
//
// Fails OPEN, not closed: if the vendor server is unreachable (network
// blip, DNS issue, vendor server briefly down), we do NOT lock the
// school out of their own data -- we only show the hard paywall when the
// vendor server explicitly confirms the subscription is inactive.

import { isSchoolTier, SCHOOL_TIERS, type SchoolTier } from "./commercial-catalog";

export type SubscriptionStatus = {
  active: boolean;
  schoolName: string;
  plan: string;
  currentPeriodEnd: string;
  daysLeft: number;
  pricingTier: SchoolTier;
  maxStudents: number;
};

type SubscriptionCache = { result: SubscriptionStatus; checkedAt: number };
// Next can compile layouts and route handlers as distinct module instances.
// Share positive cache state on the server global, not a module-local variable.
const CACHE_KEY = Symbol.for("school-erp.vendor-subscription-cache");
const cacheState = globalThis as unknown as Record<symbol, SubscriptionCache | undefined>;
const CACHE_MS = 60 * 60 * 1000; // cache active status for at most one hour

export function isVendorBillingConfigured(): boolean {
  return Boolean(process.env.VENDOR_SERVER_URL && process.env.SCHOOL_API_KEY);
}

// Called right after a successful renewal payment so the NEXT page load
// unlocks immediately instead of waiting up to an hour for the cache to
// expire -- "payment karte hi turant unlock" is a hard requirement.
export function invalidateSubscriptionCache() {
  delete cacheState[CACHE_KEY];
}

export async function checkSubscription(): Promise<SubscriptionStatus | null> {
  if (!isVendorBillingConfigured()) return null;

  const cache = cacheState[CACHE_KEY];
  if (cache && Date.now() - cache.checkedAt < CACHE_MS) {
    return cache.result;
  }

  try {
    const res = await fetch(`${process.env.VENDOR_SERVER_URL}/api/public/check-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: process.env.SCHOOL_API_KEY }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      // Unknown school / server error -- don't cache a hard failure,
      // and don't block the school's own data over a vendor-side issue.
      return cache?.result ?? null;
    }
    const response = (await res.json()) as SubscriptionStatus;
    // Billing metadata is vendor-owned; old servers used Professional economics.
    const pricingTier = isSchoolTier(response.pricingTier) ? response.pricingTier : "PROFESSIONAL";
    const maxStudents = SCHOOL_TIERS.find(tier => tier.id === pricingTier)!.maxStudents;
    const data: SubscriptionStatus = { ...response, pricingTier, maxStudents };
    // Never cache a negative status. Renewal must unlock on the next request
    // even when verification and rendering happen in different workers.
    if (data.active) cacheState[CACHE_KEY] = { result: data, checkedAt: Date.now() };
    else delete cacheState[CACHE_KEY];
    return data;
  } catch {
    // Network error -- fail open, reuse last known good result if any.
    return cache?.result ?? null;
  }
}
