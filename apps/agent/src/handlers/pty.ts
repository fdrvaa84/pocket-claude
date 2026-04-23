/**
 * PTY handler — persistent pseudo-terminal сессия.
 *
 * Использует node-pty (native C++ addon). Так как агент собирается в single-file
 * tsup-бандл, node-pty нельзя встроить; ищем его в стандартных local/global местах.
 * Если модуль не найден — отвечаем pty.error { code: 'missing_node_pty' }, клиент
 * покажет инструкцию: `sudo npm install -g node-pty`.
 */
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type {
  PtyOpenRequest, PtyOpenedMessage, PtyDataMessage,
  PtyResizeMessage, PtyCloseMessage, PtyExitMessage, PtyErrorMessage,
} from '@pocket-claude/protocol';
import { safePath, SafetyError } from '../safety.js';

type PtyProcess = {
  pid: number;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(signal?: string): void;
  onData(cb: (data: string) => void): { dispose(): void };
  onExit(cb: (e: { exitCode: number; signal?: number }) => void): { dispose(): void };
};

type PtyModule = {
  spawn(file: string, args: string[], opts: {
    name?: string; cols?: number; rows?: number; cwd?: string;
    env?: Record<string, string>; encoding?: string | null;
  }): PtyProcess;
};

const require = createRequire(import.meta.url);

let ptyModule: PtyModule | null | undefined = undefined; // undefined = ещё не пробовали

function loadPty(): PtyModule | null {
  if (ptyModule !== undefined) return ptyModule;
  const candidates = [
    'node-pty',
    '/usr/local/lib/node_modules/node-pty',
    '/usr/lib/node_modules/node-pty',
    join(homedir(), '.npm-global/lib/node_modules/node-pty'),
    join(homedir(), '.nvm/versions/node/*/lib/node_modules/node-pty'),
  ];
  for (const p of candidates) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ptyModule = require(p) as PtyModule;
      log(`node-pty loaded from ${p}`);
      return ptyModule;
    } catch {}
  }
  ptyModule = null;
  return null;
}

/** Карта активных PTY-сессий по correlation_id. */
const sessions = new Map<string, {
  proc: PtyProcess;
  disposables: Array<{ dispose(): void }>;
}>();

type PtySendMsg =
  | PtyOpenedMessage | PtyDataMessage | PtyExitMessage | PtyErrorMessage;

export function handlePtyOpen(
  req: PtyOpenRequest,
  send: (m: PtySendMsg) => void,
): void {
  const cid = req.id;
  if (sessions.has(cid)) {
    send({ type: 'pty.error', correlation_id: cid, code: 'unknown', message: 'session already exists' });
    return;
  }

  const pty = loadPty();
  if (!pty) {
    send({
      type: 'pty.error', correlation_id: cid, code: 'missing_node_pty',
      message: 'node-pty не установлен на этом устройстве. Выполни: sudo npm install -g node-pty',
    });
    return;
  }

  let cwd: string;
  try {
    cwd = req.cwd ? safePath(req.cwd) : (process.env.HOME || homedir());
  } catch (e) {
    const err = e as SafetyError;
    send({ type: 'pty.error', correlation_id: cid, code: 'unknown', message: `[safety] ${err.message}` });
    return;
  }

  const shell = req.shell || process.env.SHELL || 'bash';
  const cols = Math.max(20, Math.min(req.cols ?? 80, 500));
  const rows = Math.max(5, Math.min(req.rows ?? 24, 200));

  try {
    const proc = pty.spawn(shell, ['-il'], {
      name: 'xterm-256color',
      cols, rows, cwd,
      env: {
        ...(process.env as Record<string, string>),
        ...(req.env || {}),
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        // Подпись, чтобы можно было увидеть что это из pocket-claude если надо
        POCKET_CLAUDE: '1',
      },
    });

    const d1 = proc.onData((data: string) => {
      send({
        type: 'pty.data', correlation_id: cid,
        data: Buffer.from(data, 'utf8').toString('base64'),
      });
    });
    const d2 = proc.onExit(({ exitCode, signal }) => {
      send({ type: 'pty.exit', correlation_id: cid, code: exitCode, signal: signal != null ? String(signal) : null });
      const s = sessions.get(cid);
      if (s) {
        for (const d of s.disposables) { try { d.dispose(); } catch {} }
        sessions.delete(cid);
      }
    });

    sessions.set(cid, { proc, disposables: [d1, d2] });
    send({ type: 'pty.opened', correlation_id: cid, pid: proc.pid });
    log(`pty opened ${cid} pid=${proc.pid} shell=${shell} cwd=${cwd} ${cols}x${rows}`);
  } catch (e) {
    const err = e as Error;
    send({ type: 'pty.error', correlation_id: cid, code: 'spawn_failed', message: err.message });
  }
}

export function handlePtyData(msg: PtyDataMessage): void {
  const s = sessions.get(msg.correlation_id);
  if (!s) return;
  try {
    const raw = Buffer.from(msg.data, 'base64').toString('utf8');
    s.proc.write(raw);
  } catch {}
}

export function handlePtyResize(msg: PtyResizeMessage): void {
  const s = sessions.get(msg.correlation_id);
  if (!s) return;
  try { s.proc.resize(Math.max(20, msg.cols), Math.max(5, msg.rows)); } catch {}
}

export function handlePtyClose(msg: PtyCloseMessage): void {
  const s = sessions.get(msg.correlation_id);
  if (!s) return;
  try { s.proc.kill('SIGHUP'); } catch {}
  for (const d of s.disposables) { try { d.dispose(); } catch {} }
  sessions.delete(msg.correlation_id);
  log(`pty closed ${msg.correlation_id}`);
}

/** Вызывается при disconnect агента — убиваем все сессии, чтобы не висели zombie. */
export function killAllPty(): void {
  for (const [cid, s] of sessions) {
    try { s.proc.kill('SIGHUP'); } catch {}
    for (const d of s.disposables) { try { d.dispose(); } catch {} }
    sessions.delete(cid);
  }
}

function log(s: string): void {
  console.log(`[agent-pty ${new Date().toISOString()}] ${s}`);
}
