/**
 * Best-effort in-memory sliding-window limiter (no DB — stateless rule).
 *
 * Per serverless INSTANCE: it resets on cold start and isn't shared across
 * instances, so it's not a hard quota — but it stops burst abuse within a warm
 * instance, which is enough to cap LLM spend on the unbounded free-text/artist
 * routes. Those routes' callers fall back to a $0 DETERMINISTIC result on a 429
 * (A1a hook / manual calibration taps), so a block costs the user nothing and
 * the model nothing. (A hard cross-instance quota would need Upstash/KV — a
 * later, approval-gated add.)
 */
const WINDOW = new Map<string, number[]>();

/** True if this key may proceed; false if it's over `limit` within `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const fresh = (WINDOW.get(key) ?? []).filter((t) => now - t < windowMs);
  if (fresh.length >= limit) {
    WINDOW.set(key, fresh);
    return false;
  }
  fresh.push(now);
  WINDOW.set(key, fresh);
  // Opportunistic prune so the map can't grow unbounded with one-off IPs.
  if (WINDOW.size > 5000) {
    for (const [k, ts] of WINDOW) if (ts.every((t) => now - t >= windowMs)) WINDOW.delete(k);
  }
  return true;
}

/** A coarse client key from the proxy headers (Vercel sets x-forwarded-for). */
export function clientKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
  return xff.split(",")[0]?.trim() || "anon";
}
