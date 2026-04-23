# Pocket Claude

> Your Claude Code CLI. In your pocket.

Open-source мост между твоим телефоном и `claude` CLI на твоих серверах и компах. Один веб-интерфейс, много устройств, одна подписка Anthropic на каждом устройстве.

**Не** SaaS. **Не** форк Claude. **Не** хранит OAuth-токены Anthropic. Просто роутер сообщений между браузером и локальным `claude` процессом.

![screenshot placeholder](docs/screenshot.png)

## Ethical stance

**Pocket-Claude не предоставляет доступ к Claude.** Это оркестратор поверх официального Claude Code CLI, который ты запускаешь на своих устройствах со своей личной подпиской Anthropic. Если у тебя нет валидной подписки Claude Pro/Max или API-ключа — ничего работать не будет, и это правильно.

Мы стоим на стороне Anthropic: наша задача — дать удобный инструмент для тех, у кого есть подписка, но нет своего способа работать с Claude с телефона или с нескольких машин. Мы не обходим ограничения, не делим подписки между юзерами, не трогаем Anthropic-API и не пытаемся быть «Claude без регистрации».

| Что мы делаем | Чего мы не делаем |
|---|---|
| Юзер лично делает `claude login` на своей машине | Никогда не читаем `~/.claude/`, не извлекаем OAuth-токены |
| Одна подписка = один юзер, который её оплатил | Не даём доступ к claude тем, кто подписку не купил |
| Claude работает на устройстве в разрешённом Anthropic регионе | Не используем VPN / трюки чтобы Claude работал из запрещённой страны |
| Файловые и shell-операции идут через наш MCP-мост | Не проксируем/перешифровываем Anthropic-API запросы — они уходят напрямую с claude-устройства к Anthropic |
| Прозрачно описываем в UI где и что выполняется | Не скрываем от юзера какое устройство тратит его квоту |

Поэтому фичи вроде **remote-filesystem** (работать с файлами на RF-сервере, пока claude бежит на сервере в разрешённом регионе) построены на официальном **Model Context Protocol** Anthropic. Claude в этом сценарии видит наши tool-вызовы как обычные MCP-тулы — это полностью легитимный механизм, который Anthropic сам же продвигает.

Если ты нашёл в проекте что-то, что выглядит как попытка обойти условия Anthropic — открой issue, починим.

## Что это делает

- Открываешь `https://pocket.mydomain.com` на телефоне
- Видишь список всех своих проектов на всех устройствах (серверы, домашний комп)
- Подключаешь любое количество устройств — локальных и удалённых. Claude запускаешь на одном, работаешь с проектами на любом из остальных
- Открываешь проект → пишешь задачу → Claude CLI стримит ответ с подсветкой кода и tool_use-событиями
- Файлы, терминал, чекпоинты — всё из одного UI

## Quick start (self-host)

Нужно: Linux/Mac VPS (2 GB RAM), Docker, домен.

```bash
# 1. Клонируй
git clone https://github.com/pocket-claude/pocket-claude.git
cd pocket-claude

# 2. Setup wizard задаст 5 вопросов
pnpm setup

# 3. Запусти
docker compose up -d
pnpm --filter @pocket-claude/master migrate
pnpm dev   # или `pnpm start` для production
```

Открой `http://localhost:3100`, залогинься.

## Подключить устройство

В UI: **Settings → + Device → скопируй команду**. Выполни её на любом сервере / компе:

```bash
curl -sSL https://pocket.mydomain.com/connect.sh | \
  bash -s -- --master wss://pocket.mydomain.com/ws/agent --token XXX --name home-mac
```

Скрипт:
- Скачает `agent.js` (≈ 2 МБ)
- Положит конфиг в `~/.pocket-claude/`
- Поднимет systemd user unit (Linux) или launchd plist (macOS)
- Agent подключится к мастеру, устройство станет 🟢 online в UI

**Важно:** на устройстве должны быть установлены `node >= 20` и `claude` CLI с выполненным `claude login`. Pocket-Claude не хранит, не шлёт и не пытается использовать твой OAuth-токен Anthropic — он остаётся в `~/.claude/` на устройстве.

## Architecture

Три компонента:

```
Browser  ──HTTPS──>  Master (Next.js + Postgres)  ──WSS──>  Agent (Node, на устройстве)
                                                                ↓
                                                            spawn `claude` CLI
```

- **Master** — UI + база + роутер. Никогда не запускает `claude`. Не хранит секреты Anthropic.
- **Agent** — standalone Node-скрипт, один файл. Принимает команды от мастера, спавнит `claude`/`bash`, стримит ответы назад.
- **Protocol** — JSON поверх WebSocket, все типы в `packages/protocol`.

Детали: [docs/architecture.md](docs/architecture.md)

## Compliance (Anthropic TOS)

Pocket-Claude **соблюдает** условия использования Anthropic:

| Правило | Pocket-Claude |
|---|---|
| OAuth-токен Claude остаётся на машине юзера | ✅ agent не читает `~/.claude/*`, протокол не содержит такой операции |
| Запросы идут через official `claude` CLI | ✅ `spawn('claude', ...)` в agent |
| Телеметрия Anthropic не обходится | ✅ ничего не перехватывается |
| Один юзер — одна подписка | ✅ устройство привязано к одному user_id в БД, sharing невозможен |

В отличие от OpenClaw, Pocket-Claude **не извлекает** токены и **не проксирует** HTTP-запросы к Anthropic — запросы уходят напрямую с устройства юзера через его локальный CLI.

## License

MIT. См. [LICENSE](LICENSE).

## Roadmap

### v0.1 (MVP, текущая) — self-hosted, single user
- [x] Монорепо: master + agent + protocol
- [x] Аутентификация email+пароль
- [x] Устройства: add/list/remove с online-статусом
- [x] Проекты с привязкой к устройству
- [x] Чат → Claude на устройстве (стрим)
- [x] Terminal → bash на устройстве
- [x] FileTree / FileEditor через agent
- [x] Docker-compose + SSL via Caddy
- [x] Три темы: Soft / Light / Dark

### v0.2 — integrations
- [ ] GitHub OAuth + клонирование репо как проект
- [ ] Auto-обновление агента из GitHub Releases
- [ ] Voice input (Groq Whisper) / optional TTS
- [ ] Plan mode в чате

### v0.3 — multi-user
- [ ] Google/GitHub OAuth для логина
- [ ] Регистрация для open SaaS
- [ ] Оркестратор: «глобальный» проект, который спавнит sub-Claude в других проектах

## Contributing

PR welcome. Следуй `docs/architecture.md` для понимания что куда идёт.
