/**
 * Slash-команды для pocket-claude.
 *
 * Два класса:
 *  - UI_COMMANDS — обрабатываются локально в браузере (не уходят в Claude).
 *  - CLAUDE_COMMANDS — стандартные команды Claude Code. Шлются в Claude как промпт;
 *    часть из них (вроде /clear, /compact) имеет локальные эффекты — их мы тоже
 *    обрабатываем на своей стороне.
 *
 * Всё что начинается с "/", но не в списке, тоже уходит в Claude (на случай
 * кастомных slash-команд юзера из ~/.claude/commands/).
 */

export interface SlashCommand {
  name: string;
  args?: string;
  description: string;
  /** 'ui' — локально; 'claude' — в Claude; 'both' — и там и там */
  kind: 'ui' | 'claude' | 'both';
}

export const COMMANDS: SlashCommand[] = [
  // --- UI-локальные ---
  { name: '/clear',    description: 'Новый чат (очистить историю)', kind: 'both' },
  { name: '/newchat',  description: 'Алиас /clear', kind: 'ui' },
  { name: '/help',     description: 'Список команд', kind: 'ui' },
  { name: '/!',        args: 'команда', description: 'Запустить bash на устройстве', kind: 'ui' },
  { name: '/exec',     args: 'команда', description: 'Алиас /!', kind: 'ui' },
  { name: '/cd',       args: 'путь',    description: 'Сменить рабочую папку проекта', kind: 'ui' },
  { name: '/files',    description: 'Открыть таб Files', kind: 'ui' },
  { name: '/terminal', description: 'Открыть таб Terminal', kind: 'ui' },
  { name: '/settings', description: 'Настройки', kind: 'ui' },

  // --- Claude Code (интерпретирует Claude) ---
  { name: '/init',        description: 'Инициализировать CLAUDE.md для проекта', kind: 'claude' },
  { name: '/compact',     description: 'Сжать историю сессии', kind: 'claude' },
  { name: '/model',       args: 'sonnet|opus|haiku', description: 'Поменять модель', kind: 'claude' },
  { name: '/agents',      description: 'Управление sub-agents', kind: 'claude' },
  { name: '/checkpoint',  description: 'Сделать чекпоинт сессии', kind: 'claude' },
  { name: '/rewind',      args: 'N',   description: 'Откатить на N шагов назад', kind: 'claude' },
  { name: '/memory',      description: 'Управление памятью (CLAUDE.md)', kind: 'claude' },
  { name: '/mcp',         description: 'Список MCP серверов', kind: 'claude' },
  { name: '/cost',        description: 'Расход токенов в сессии', kind: 'claude' },
  { name: '/status',      description: 'Статус Claude', kind: 'claude' },
  { name: '/config',      description: 'Конфигурация Claude', kind: 'claude' },
  { name: '/bug',         description: 'Сообщить о баге', kind: 'claude' },
];

export function matchCommands(input: string): SlashCommand[] {
  if (!input.startsWith('/')) return [];
  const q = input.toLowerCase().split(' ')[0]; // только первое слово
  return COMMANDS
    .filter(c => c.name.startsWith(q) || c.name.toLowerCase().includes(q.slice(1)))
    .slice(0, 12);
}

export function parseSlash(input: string): { name: string; args: string } | null {
  if (!input.startsWith('/')) return null;
  const sp = input.indexOf(' ');
  if (sp < 0) return { name: input.trim(), args: '' };
  return { name: input.slice(0, sp), args: input.slice(sp + 1).trim() };
}

/** Возвращает известную команду или null. */
export function findCommand(name: string): SlashCommand | null {
  return COMMANDS.find(c => c.name === name) || null;
}
