import { NextRequest, NextResponse } from 'next/server';
import { CSRF_COOKIE, CSRF_HEADER } from '@/lib/csrf-const';

/**
 * Глобальный CSRF-чек для всех mutating API-роутов.
 * Применяется к /api/* для POST/PUT/DELETE/PATCH.
 *
 * Исключения:
 *   - /api/rfs/* — авторизуется bearer-токеном (агент → master), не cookie-based
 */
export const config = {
  matcher: ['/api/:path*'],
};

const SKIP_PATHS = ['/api/rfs/'];

export function middleware(req: NextRequest) {
  const method = req.method.toUpperCase();
  // Safe-методы пропускаем
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return NextResponse.next();
  // RFS-эндпоинты используют bearer-токены, без cookie — пропускаем
  const path = req.nextUrl.pathname;
  for (const skip of SKIP_PATHS) {
    if (path.startsWith(skip)) return NextResponse.next();
  }

  const cookie = req.cookies.get(CSRF_COOKIE)?.value;
  const header = req.headers.get(CSRF_HEADER);
  if (!cookie || !header || cookie !== header) {
    return new NextResponse(
      JSON.stringify({ error: 'CSRF token mismatch — get GET /api/auth first to obtain pc_csrf cookie' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }
  return NextResponse.next();
}
