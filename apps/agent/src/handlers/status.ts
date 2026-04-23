import { spawn } from 'node:child_process';
import { statfs } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { StatusRequest, StatusReply } from '@pocket-claude/protocol';

export async function handleStatus(req: StatusRequest): Promise<StatusReply> {
  const claude = await probeClaude();
  let disk = { free_bytes: 0, total_bytes: 0 };
  try {
    const s = await statfs('/');
    disk = { free_bytes: Number(s.bavail) * s.bsize, total_bytes: Number(s.blocks) * s.bsize };
  } catch {}
  return {
    type: 'status.reply',
    correlation_id: req.id,
    claude,
    disk,
    uptime_s: Math.round(process.uptime()),
  };
}

export function probeClaude(): Promise<{ installed: boolean; version?: string; logged_in: boolean }> {
  return new Promise((resolve) => {
    const cliPath = process.env.PC_CLAUDE_PATH || 'claude';
    const proc = spawn(cliPath, ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    proc.stdout.on('data', (c) => { out += c.toString(); });
    proc.on('error', () => resolve({ installed: false, logged_in: false }));
    proc.on('close', (code) => {
      if (code !== 0) return resolve({ installed: false, logged_in: false });
      const version = out.trim();
      // Более точная эвристика: claude CLI после `claude login` пишет credentials.json.
      // Само наличие ~/.claude/ ничего не значит — папка создаётся при первом запуске.
      const home = homedir();
      const loggedIn =
        existsSync(join(home, '.claude', '.credentials.json')) ||
        existsSync(join(home, '.config', 'claude', 'credentials.json')) ||
        existsSync(join(home, '.claude', 'credentials.json'));
      resolve({ installed: true, version, logged_in: loggedIn });
    });
  });
}
