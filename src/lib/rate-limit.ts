/**
 * Best-effort in-memory rate limiter (fixed window per key).
 *
 * State lives in the current isolate only — on Cloudflare Workers each
 * edge location keeps its own window. That is acceptable here: the goal
 * is to protect the Gemini free-tier quota from a single abusive client,
 * not to enforce a global quota.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Periodically drop expired buckets so the map cannot grow unbounded. */
const MAX_BUCKETS = 5_000;

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets (for `Retry-After`). */
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(bucketKey);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

/** Client IP from platform headers (Cloudflare sets `cf-connecting-ip`). */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous"
  );
}
