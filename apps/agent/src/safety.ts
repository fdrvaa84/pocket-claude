import { resolve, normalize } from 'node:path';
import { isPathBlocked } from '@autmzr/command-protocol';

/**
 * Безопасность агента.
 * Задача: даже если мастер скомпрометирован, он не сможет
 * украсть OAuth Claude, SSH-ключи, секреты.
 */

export class SafetyError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

/** Нормализуем и проверяем путь. Выкидываем SafetyError если не ок. */
export function safePath(input: string): string {
  if (typeof input !== 'string' || !input) {
    throw new SafetyError('bad_path', 'path required');
  }
  const abs = resolve(normalize(input));
  if (!abs.startsWith('/')) {
    throw new SafetyError('bad_path', 'path must be absolute');
  }
  if (isPathBlocked(abs)) {
    throw new SafetyError('blocked_path', `path blocked by safety policy: ${abs}`);
  }
  return abs;
}

/** Проверяем команду bash на очевидные попытки вытащить секреты. */
export function screenCommand(cmd: string): void {
  const blocked = [
    /\bcat\s+[^|&;]*\/\.claude\b/i,
    /\bcat\s+[^|&;]*\/\.ssh\b/i,
    /\bcat\s+[^|&;]*\/\.aws\b/i,
    /\bprintenv\b/i,
    /\benv\b\s*$/im,
  ];
  for (const re of blocked) {
    if (re.test(cmd)) {
      throw new SafetyError('blocked_cmd', `command blocked by safety policy: matches ${re.source}`);
    }
  }
}
