import type { NextRequest } from 'next/server';

// In-memory sliding-window limiter. On serverless each warm instance keeps its own
// counters, so this slows brute force and spam without needing an external store.
const hits = new Map<string, number[]>();
const MAX_KEYS = 5000;

export function clientIp(req: NextRequest): string {
  // On Vercel x-forwarded-for is set by the platform; the first entry is the client.
  const forwarded = req.headers.get('x-forwarded-for');
  return (forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown').trim();
}

/** Returns seconds to wait when the key is over its limit, or 0 when the request may proceed. */
export function rateLimit(key: string, limit: number, windowMs: number): number {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000));
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
      if (hits.size <= MAX_KEYS / 2) break;
    }
  }
  return 0;
}
