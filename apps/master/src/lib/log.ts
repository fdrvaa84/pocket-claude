/**
 * Тонкая обёртка над console для structured-логов.
 * Не тащим pino чтобы не разбухал bundle и не было native deps.
 *
 * Формат: JSON-строка с уровнем, временем, сообщением, контекстом.
 * В dev — pretty (читаемо), в prod — JSON (можно грепать через jq).
 */
type Level = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV !== 'production';
const minLevel: Level = (process.env.LOG_LEVEL as Level) || (isDev ? 'debug' : 'info');
const order: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function emit(level: Level, msg: string, ctx?: Record<string, unknown>) {
  if (order[level] < order[minLevel]) return;
  const time = new Date().toISOString();
  if (isDev) {
    const tag = level.toUpperCase().padEnd(5);
    const ctxStr = ctx ? ' ' + JSON.stringify(ctx) : '';
    // eslint-disable-next-line no-console
    console.log(`${time} ${tag} ${msg}${ctxStr}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ time, level, msg, ...(ctx || {}) }));
  }
}

export const log = {
  debug: (msg: string, ctx?: Record<string, unknown>) => emit('debug', msg, ctx),
  info:  (msg: string, ctx?: Record<string, unknown>) => emit('info', msg, ctx),
  warn:  (msg: string, ctx?: Record<string, unknown>) => emit('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => emit('error', msg, ctx),

  /**
   * child-логгер с привязанным контекстом — все его вызовы будут содержать base.
   *   const reqLog = log.child({ requestId, userId });
   *   reqLog.info('login ok');
   */
  child(base: Record<string, unknown>) {
    return {
      debug: (msg: string, ctx?: Record<string, unknown>) => emit('debug', msg, { ...base, ...ctx }),
      info:  (msg: string, ctx?: Record<string, unknown>) => emit('info', msg, { ...base, ...ctx }),
      warn:  (msg: string, ctx?: Record<string, unknown>) => emit('warn', msg, { ...base, ...ctx }),
      error: (msg: string, ctx?: Record<string, unknown>) => emit('error', msg, { ...base, ...ctx }),
    };
  },
};
