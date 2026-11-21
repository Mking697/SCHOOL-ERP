// Lightweight in-memory sliding-window rate limiter. Deliberately simple
// (no Redis dependency) because every app/tenant process in this project
// runs as a single PM2 process -- an in-memory Map is sufficient and avoids
// adding new infrastructure. LIMITATION: resets on process restart and does
// NOT share state across multiple instances of the same app. If this app is
// ever horizontally scaled behind a load balancer, replace with a shared
// store (Redis) keyed the same way.
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically forget old buckets so this Map can't grow unbounded under
// sustained traffic from many distinct keys (IPs).
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Returns true if the call for `key` is allowed under `limit` calls per
 * `windowMs` milliseconds, and records this call. Call once per request
 * attempt (e.g. once per login POST), keyed by something like
 * `login:<ip>:<email>` or `signup:<ip>`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  sweep(now);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (existing.count >= limit) {
    return { allowed: false, retryAfterMs: existing.resetAt - now };
  }
  existing.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

/** Best-effort client IP from standard proxy headers, falling back to a
 * constant bucket (still useful locally / single-user dev, just coarser). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
