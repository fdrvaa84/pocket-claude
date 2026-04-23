/**
 * Double-submit cookie CSRF protection.
 *
 * Сценарий:
 *  - При первом GET /api/auth (или любом safe-handler'е) выставляем cookie pc_csrf
 *    с криптостойким случайным значением. Cookie НЕ httpOnly — фронту нужно
 *    его прочитать и положить в заголовок X-CSRF-Token.
 *  - Все mutating-роуты (POST/PUT/DELETE/PATCH) проверяют что заголовок === cookie.
 *  - Из-за SameSite=lax cookie не уйдёт с cross-site GET — значит атакующий с
 *    другого origin не может ни выставить ни прочитать.
 *
 * Использование в API route:
 *   import { requireCsrf, ensureCsrfCookie } from '@/lib/csrf';
 *   export async function POST(req: NextRequest) {
 *     const blocked = await requireCsrf(req); if (blocked) return blocked;
 *     ...
 *   }
 *   export async function GET() {
 *     const res = NextResponse.json({...});
 *     await ensureCsrfCookie(res); // optional, обновит cookie если её нет
 *     return res;
 *   }
 */
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { CSRF_COOKIE, CSRF_HEADER } from './csrf-const';

// Re-export для обратной совместимости (старый код может импортить из csrf.ts)
export { CSRF_COOKIE, CSRF_HEADER };

function newToken(): string {
  return randomBytes(24).toString('base64url');
}

/**
 * Гарантирует что у клиента есть pc_csrf cookie. Если нет — выставляет.
 * Вызывать в GET-роутах, чтобы фронт получил токен сразу.
 */
export async function ensureCsrfCookie(res?: NextResponse): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CSRF_COOKIE)?.value;
  if (existing && existing.length >= 16) return existing;
  const token = newToken();
  const cookieOpts = {
    httpOnly: false,                                  // фронту нужно читать
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,                        // 30 дней
  };
  if (res) {
    res.cookies.set(CSRF_COOKIE, token, cookieOpts);
  } else {
    jar.set(CSRF_COOKIE, token, cookieOpts);
  }
  return token;
}

/**
 * Проверка CSRF: возвращает Response 403 если токены не совпадают, иначе null.
 *
 * Вызывать в POST/PUT/DELETE/PATCH перед основной логикой.
 *
 * Исключение: если запрос идёт с правильным Content-Type=text/event-stream
 * (т.е. это сам SSE-поток внутри Bun/iOS) — тоже проверяем, никаких bypass'ов.
 */
export async function requireCsrf(req: NextRequest): Promise<Response | null> {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;
  const cookie = req.cookies.get(CSRF_COOKIE)?.value;
  const header = req.headers.get(CSRF_HEADER);
  if (!cookie || !header || cookie !== header) {
    return new Response(
      JSON.stringify({ error: 'CSRF token mismatch' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }
  return null;
}
