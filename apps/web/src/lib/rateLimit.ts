export class RateLimitError extends Error {
  constructor(retryAfterSeconds: number) {
    super(`Too many attempts. Please wait ${retryAfterSeconds} seconds before trying again.`);
    this.name = "RateLimitError";
  }
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Allow at most `max` calls per `windowMs` for a given key. */
export function checkRateLimit(key: string, max = 3, windowMs = 30_000): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    throw new RateLimitError(retryAfter);
  }

  bucket.count += 1;
}
