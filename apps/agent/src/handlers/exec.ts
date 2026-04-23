import { spawn } from 'node:child_process';
import type { ExecRequest, ExecStdout, ExecStderr, ExecExit } from '@pocket-claude/protocol';
import { safePath, screenCommand, SafetyError } from '../safety.js';

export function handleExec(
  req: ExecRequest,
  send: (m: ExecStdout | ExecStderr | ExecExit) => void,
): void {
  let cwd: string;
  try {
    cwd = safePath(req.cwd);
    screenCommand(req.cmd);
  } catch (e) {
    const err = e as SafetyError;
    send({ type: 'exec.stderr', correlation_id: req.id, text: `[safety] ${err.message}\n` });
    send({ type: 'exec.exit', correlation_id: req.id, code: 1 });
    return;
  }

  const timeoutMs = Math.min(req.timeout_ms ?? 60_000, 600_000);

  const proc = spawn('bash', ['-lc', req.cmd], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, TERM: 'dumb' },
  });

  const killer = setTimeout(() => {
    send({ type: 'exec.stderr', correlation_id: req.id, text: '\n[killed by timeout]\n' });
    try { proc.kill('SIGKILL'); } catch {}
  }, timeoutMs);

  proc.stdout.on('data', (chunk: Buffer) => {
    send({ type: 'exec.stdout', correlation_id: req.id, text: chunk.toString('utf8') });
  });
  proc.stderr.on('data', (chunk: Buffer) => {
    send({ type: 'exec.stderr', correlation_id: req.id, text: chunk.toString('utf8') });
  });
  proc.on('close', (code, signal) => {
    clearTimeout(killer);
    send({ type: 'exec.exit', correlation_id: req.id, code, signal: signal ?? null });
  });
  proc.on('error', (err) => {
    clearTimeout(killer);
    send({ type: 'exec.stderr', correlation_id: req.id, text: `[error] ${err.message}\n` });
    send({ type: 'exec.exit', correlation_id: req.id, code: 1 });
  });
}
