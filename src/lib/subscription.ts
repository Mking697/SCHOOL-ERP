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

export type SubscriptionStatus = {
  active: boolean;
  schoolName: string;
  plan: string;
  currentPeriodEnd: string;
  daysLeft: number;
};

let cache: { result: SubscriptionStatus | null; checkedAt: number } | null = null;
const CACHE_MS = 60 * 60 * 1000; // re-check at most once per hour

export function isVendorBillingConfigured(): boolean {
  return Boolean(process.env.VENDOR_SERVER_URL && process.env.SCHOOL_API_KEY);
}

// Called right after a successful renewal payment so the NEXT page load
// unlocks immediately instead of waiting up to an hour for the cache to
// expire -- "payment karte hi turant unlock" is a hard requirement.
export function invalidateSubscriptionCache() {
  cache = null;
}

export async function checkSubscription(): Promise<SubscriptionStatus | null> {
  if (!isVendorBillingConfigured()) return null;

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
    const data = (await res.json()) as SubscriptionStatus;
    cache = { result: data, checkedAt: Date.now() };
    return data;
  } catch {
    // Network error -- fail open, reuse last known good result if any.
    return cache?.result ?? null;
  }
}
