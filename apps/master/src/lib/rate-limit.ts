/**
 * Простой in-memory token-bucket rate limiter, работает per-process.
 * Не подходит для multi-instance прод (нужен redis), но для single-node — норм.
 *
 * Использование:
 *   import { rateLimit } from '@/lib/rate-limit';
 *   const limited = rateLimit(req, { key: 'login', max: 5, windowMs: 60_000 });
 *   if (limited) return limited; // already returns 429
 */
import type { NextRequest } from 'next/server';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Чистим раз в 5 минут чтобы Map не пух.
let lastCleanup = Date.now();
function maybeCleanup(now: number) {
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  for (const [k, b] of buckets) {
    if (b.resetAt < now) buckets.delete(k);
  }
}

function clientIp(req: NextRequest | Request): string {
  const headers = (req as NextRequest).headers || (req as Request).headers;
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return headers.get('x-real-ip') || 'unknown';
}

export interface RateLimitOpts {
  key: string;          // лог-ключ типа 'login'
  max: number;          // сколько запросов
  windowMs: number;     // в окне в миллисекундах
  perUser?: string;     // если передан — лимитим per-user, иначе per-IP
}

/**
 * Возвращает Response с 429 если лимит превышен, иначе null (можно работать).
 */
export function rateLimit(req: NextRequest | Request, opts: RateLimitOpts): Response | null {
  const now = Date.now();
  maybeCleanup(now);
  const id = opts.perUser ? `${opts.key}:user:${opts.perUser}` : `${opts.key}:ip:${clientIp(req)}`;
  let b = buckets.get(id);
  if (!b || b.resetAt < now) {
    b = { count: 0, resetAt: now + opts.windowMs };
    buckets.set(id, b);
  }
  b.count++;
  if (b.count > opts.max) {
    const retryAfter = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
    return new Response(
      JSON.stringify({ error: 'Too many requests', retryAfter }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(opts.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(b.resetAt / 1000)),
        },
      },
    );
  }
  return null;
}

/** Тестовый helper — сбросить все buckets (в проде не используется) */
export function _resetAllBuckets() {
  buckets.clear();
}
