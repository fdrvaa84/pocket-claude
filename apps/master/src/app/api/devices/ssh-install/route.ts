import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { requireCsrf } from '@/lib/csrf';
import { log } from '@/lib/log';
import { Client } from 'ssh2';

/**
 * POST /api/devices/ssh-install
 * Подключается к удалённому серверу по SSH и выполняет там autmzr-command installer.
 *
 * Body: { host, port?, user, auth: { type: 'password'|'key', password?, key? }, connectCmd }
 * connectCmd — готовая команда `curl ... | bash ...` которую клиент получил ранее из POST /api/devices.
 *
 * Response: text/event-stream со строками {type: 'out'|'err'|'exit'|'error', ...}
 *
 * Credentials существуют только в памяти процесса, в БД/логи не пишутся.
 */
export async function POST(req: NextRequest) {
  const csrfBlocked = await requireCsrf(req);
  if (csrfBlocked) return csrfBlocked;
  const user = await getAuthUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  // 1 SSH-installer на 30 секунд per-user — защита от спама/долбёжки чужих хостов.
  const limited = rateLimit(req, { key: 'ssh-install', max: 1, windowMs: 30_000, perUser: user.id });
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const { host, port = 22, username, auth, connectCmd } = body || {};

  if (!host || !username || !auth || !connectCmd) {
    return new Response('Bad request: need host, username, auth, connectCmd', { status: 400 });
  }
  // Валидация: команда должна быть нашим installer'ом, а не чем-то произвольным.
  // Формат: `curl -sSL <url>/connect.sh | [\\newline] bash -s -- --master wss://.../ws/agent --token X --name Y`
  // Ослабленная проверка — curl может иметь разные флаги, между pipe и bash может быть перенос.
  const validCmd =
    /^curl\s+[^|]*https?:\/\/[^\s|]+\/connect\.sh[\s\S]*\|[\s\S]*bash\s+-s\s+--\s+--master\s+wss?:\/\/\S+\/ws\/agent\s+--token\s+\S+\s+--name\s+\S+/.test(connectCmd);
  if (!validCmd) {
    return new Response(`Bad connectCmd format: ${connectCmd.slice(0, 100)}...`, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const push = (obj: unknown) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)); } catch {}
      };

      const conn = new Client();
      let closed = false;
      const safeClose = () => {
        if (closed) return;
        closed = true;
        try { conn.end(); } catch {}
        try { controller.close(); } catch {}
      };

      conn.on('ready', () => {
        push({ type: 'connected' });
        // Выполняем installer. Используем login shell (-l c) чтобы PATH/node был.
        // Доп: на некоторых хостингах нужен apt-get install nodejs curl для начала,
        // но это решим отдельно (сообщим юзеру что нужен Node 20+ и curl).
        conn.exec(`bash -lc "${connectCmd.replace(/"/g, '\\"')}"`, (err, stream) => {
          if (err) {
            push({ type: 'error', message: `exec: ${err.message}` });
            safeClose();
            return;
          }
          stream.on('data', (data: Buffer) => push({ type: 'out', text: data.toString('utf8') }));
          stream.stderr.on('data', (data: Buffer) => push({ type: 'err', text: data.toString('utf8') }));
          stream.on('close', (code: number | null) => {
            push({ type: 'exit', code });
            safeClose();
          });
        });
      });

      conn.on('error', (err) => {
        push({ type: 'error', message: err.message });
        safeClose();
      });

      conn.on('end', () => safeClose());
      conn.on('close', () => safeClose());

      // Запускаем
      try {
        const opts: Record<string, unknown> = {
          host, port, username,
          readyTimeout: 20_000,
          tryKeyboard: false,
        };
        if (auth.type === 'password') {
          if (!auth.password) {
            push({ type: 'error', message: 'password required' });
            safeClose();
            return;
          }
          opts.password = auth.password;
        } else if (auth.type === 'key') {
          if (!auth.key) {
            push({ type: 'error', message: 'private key required' });
            safeClose();
            return;
          }
          opts.privateKey = auth.key;
          if (auth.passphrase) opts.passphrase = auth.passphrase;
        } else {
          push({ type: 'error', message: 'auth.type must be "password" or "key"' });
          safeClose();
          return;
        }
        push({ type: 'connecting', host, port, username });
        log.info('ssh-install start', { userId: user.id, host, port, username, authType: auth.type });
        conn.connect(opts as never);
      } catch (e) {
        push({ type: 'error', message: (e as Error).message });
        safeClose();
      }

      req.signal?.addEventListener('abort', safeClose);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
