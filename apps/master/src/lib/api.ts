/**
 * Клиентская обёртка над fetch:
 *   - автоматически добавляет X-CSRF-Token из pc_csrf cookie
 *   - выставляет credentials: 'same-origin' (cookies)
 *   - тонкий wrapper, не меняет API
 *
 * Если CSRF-токена ещё нет (первый GET /api/auth ещё не прошёл),
 * fetch всё равно отправится — middleware вернёт 403, и UI должен
 * это перетряхнуть (например, GET /api/auth для получения токена).
 */
function readCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)pc_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Drop-in замена fetch с CSRF-заголовком.
 * Используй везде в client-компонентах вместо window.fetch.
 */
export function api(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const csrf = readCsrfToken();
  if (csrf && !headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', csrf);
  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials || 'same-origin',
  });
}

/**
 * Гарантирует что в браузере есть CSRF-cookie. Если нет — делает GET /api/auth
 * (он атомарно выставляет cookie). Используется на старте приложения.
 */
export async function ensureCsrf(): Promise<void> {
  if (readCsrfToken()) return;
  try { await fetch('/api/auth', { credentials: 'same-origin' }); } catch {}
}
