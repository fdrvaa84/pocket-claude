/**
 * Device intent — roles pocket-claude knows about.
 * Shared between server routes and UI so decisions stay consistent.
 */

export type DeviceIntent = 'auto' | 'claude' | 'fs-only';

export interface DeviceLike {
  intent?: DeviceIntent | string | null;
  claude_logged_in?: boolean | null;
}

/** Effective role after applying `auto` fallback to heuristic. */
export function effectiveIntent(d: DeviceLike): 'claude' | 'fs-only' {
  const i = (d.intent || 'auto') as DeviceIntent;
  if (i === 'claude') return 'claude';
  if (i === 'fs-only') return 'fs-only';
  return d.claude_logged_in === true ? 'claude' : 'fs-only';
}

/** Чистый тип-гард — нужно ли для этого проекта делать proxy-диспатч. */
export function needsProxyClaude(d: DeviceLike): boolean {
  return effectiveIntent(d) === 'fs-only';
}

/** Валидация значения, пришедшего из UI/API. */
export function parseIntent(v: unknown): DeviceIntent {
  if (v === 'claude' || v === 'fs-only' || v === 'auto') return v;
  return 'auto';
}
