/**
 * Константы CSRF вынесены сюда, чтобы middleware (Edge runtime) не тянул
 * через csrf.ts `node:crypto` (который в Edge не работает).
 */
export const CSRF_COOKIE = 'pc_csrf';
export const CSRF_HEADER = 'x-csrf-token';
