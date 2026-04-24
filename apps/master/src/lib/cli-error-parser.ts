/**
 * Парсер сообщений об ошибках CLI-агентов (Claude Code / Gemini CLI) в
 * человеко-читаемую структуру с подсказкой и кнопками действия.
 *
 * Используется в /api/chat/route.ts — когда приходит claude.error, парсим
 * и отправляем в UI не только текст, но и { kind, title, suggestion, actions }.
 * UI показывает аккуратную карточку с действиями вместо портянки stderr.
 */

import type { Provider } from './models';

export type ErrorKind =
  | 'quota'         // Дневной/месячный лимит исчерпан
  | 'geo'           // Регион не обслуживается
  | 'auth'          // Неверный API-key или OAuth
  | 'model-not-found' // Модель не поддерживается CLI
  | 'network'       // Сеть/таймаут
  | 'unknown';      // Всё остальное — показываем сырое

export interface ErrorAction {
  type: 'switch-model';
  model: string;
  label: string;
}

export interface ParsedCliError {
  kind: ErrorKind;
  title: string;
  suggestion?: string;
  actions?: ErrorAction[];
  /** Полезная ссылка — например на Google AI Studio для биллинга. */
  docUrl?: string;
  /** Сырая ошибка — для collapsible «Details» в UI. */
  raw: string;
}

/**
 * Разбирает сырой stderr+message от CLI в структуру.
 * Паттерны подобраны на реальных ошибках Gemini CLI 0.39 и Claude Code.
 */
export function parseCliError(raw: string, provider: Provider, currentModel: string): ParsedCliError {
  // ===== Quota / Rate limit =====
  // Gemini: "TerminalQuotaError: You have exhausted your daily quota"
  // Claude: "rate_limit_error" / "overloaded_error"
  if (/terminal ?quota|exhausted.+quota|quota.*exhausted|rate.?limit|rate_limit_error|overloaded/i.test(raw)) {
    const isFlash = /flash/i.test(currentModel);
    const isHaiku = /haiku/i.test(currentModel);
    if (provider === 'gemini-cli') {
      return {
        kind: 'quota',
        title: `Дневная квота Gemini ${isFlash ? 'Flash' : 'Pro'} исчерпана`,
        suggestion: isFlash
          ? 'У Pro отдельный квот-пул — попробуй его, либо включи биллинг в Google AI Studio (лимиты в сотни раз выше).'
          : 'У Flash отдельный квот-пул — попробуй его, либо включи биллинг в Google AI Studio (лимиты в сотни раз выше).',
        actions: isFlash
          ? [{ type: 'switch-model', model: 'gemini-2.5-pro', label: 'Попробовать Pro' }]
          : [{ type: 'switch-model', model: 'gemini-2.5-flash', label: 'Переключиться на Flash' }],
        docUrl: 'https://aistudio.google.com/app/apikey',
        raw,
      };
    }
    return {
      kind: 'quota',
      title: 'Лимит Claude API исчерпан',
      suggestion: isHaiku
        ? 'Подожди сброса лимита или переключись на Sonnet.'
        : 'Переключись на Haiku (дешевле, меньше шансов упереться) или подожди сброса.',
      actions: isHaiku
        ? [{ type: 'switch-model', model: 'sonnet', label: 'Переключиться на Sonnet' }]
        : [{ type: 'switch-model', model: 'haiku', label: 'Переключиться на Haiku' }],
      raw,
    };
  }

  // ===== Geo block =====
  // Gemini: "User location is not supported for the API use"
  if (/user location.+not supported|failed_precondition.+location/i.test(raw)) {
    return {
      kind: 'geo',
      title: 'Gemini API не обслуживает этот регион',
      suggestion:
        'Google блокирует Gemini API для этой страны. Варианты: подключить устройство из другой локации, использовать VPN на самом сервере, или переключиться на Claude (у них геоблока нет).',
      raw,
    };
  }

  // ===== Auth =====
  if (/api key not valid|invalid.*api.?key|invalid.*credentials|permission_denied|authentication.*fail|401 unauthorized|403 forbidden/i.test(raw)) {
    if (provider === 'gemini-cli') {
      return {
        kind: 'auth',
        title: 'Gemini API ключ не принимается',
        suggestion: 'Проверь GEMINI_API_KEY: DeviceSheet → вкладка Gemini → API key. Ключ можно пере-выпустить в Google AI Studio.',
        docUrl: 'https://aistudio.google.com/app/apikey',
        raw,
      };
    }
    return {
      kind: 'auth',
      title: 'Claude auth не работает',
      suggestion: 'Перелогинься на устройстве: `claude login` в терминале или через DeviceSheet.',
      raw,
    };
  }

  // ===== Unknown model =====
  if (/unknown model|invalid.*model|model.+not (found|available)|model.*does not exist/i.test(raw)) {
    return {
      kind: 'model-not-found',
      title: `Модель «${currentModel}» не поддерживается этим CLI`,
      suggestion: 'Выбери другую модель в pill composer-а. Возможно, нужна свежая версия CLI.',
      raw,
    };
  }

  // ===== Network =====
  if (/econnrefused|etimedout|enotfound|connection (refused|reset|timeout)|fetch failed|network error|socket hang up/i.test(raw)) {
    return {
      kind: 'network',
      title: 'Сетевая ошибка',
      suggestion: 'Проверь интернет на устройстве. Если Gemini — проверь доступность Google API (может быть заблокирован провайдером).',
      raw,
    };
  }

  // ===== Unknown — возьмём первую «осмысленную» строку как заголовок =====
  const noise = /^warning|^\[startup\]|yolo mode|256-color|processTicksAndRejections/i;
  const firstLine = raw
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !noise.test(l)) || raw.trim().slice(0, 200);

  return {
    kind: 'unknown',
    title: firstLine.slice(0, 200),
    raw,
  };
}
