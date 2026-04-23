import { mkdirSync, existsSync, writeFileSync, readFileSync, appendFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { ClaudeEvent, ClaudeDone, ClaudeError, ClaudeRequest } from '@pocket-claude/protocol';

const JOBS_DIR = join(homedir(), '.pocket-claude', 'jobs');

export interface JobMeta {
  id: string;
  started_at: string;
  status: 'running' | 'done' | 'error';
}

function ensureDir() {
  if (!existsSync(JOBS_DIR)) mkdirSync(JOBS_DIR, { recursive: true, mode: 0o700 });
}

function file(jobId: string): string {
  return join(JOBS_DIR, `${jobId}.jsonl`);
}

/** Записать первую строку — метаданные job */
export function jobStart(req: ClaudeRequest): void {
  ensureDir();
  const meta: JobMeta = { id: req.id, started_at: new Date().toISOString(), status: 'running' };
  writeFileSync(file(req.id), JSON.stringify({ type: 'meta', ...meta }) + '\n', { mode: 0o600 });
}

/** Append любого события */
export function jobAppend(jobId: string, event: ClaudeEvent | ClaudeDone | ClaudeError): void {
  try { appendFileSync(file(jobId), JSON.stringify(event) + '\n'); } catch {}
}

/** Обновить статус (done/error) в последней строке */
export function jobFinish(jobId: string, status: 'done' | 'error'): void {
  try { appendFileSync(file(jobId), JSON.stringify({ type: 'meta', status }) + '\n'); } catch {}
}

/** Удалить файл job (после ack от мастера) */
export function jobDelete(jobId: string): void {
  try { unlinkSync(file(jobId)); } catch {}
}

/** Список всех незавершённых jobs */
export function jobList(): Array<{ id: string; meta: JobMeta; bytes: number }> {
  ensureDir();
  const out: Array<{ id: string; meta: JobMeta; bytes: number }> = [];
  let entries: string[];
  try { entries = readdirSync(JOBS_DIR); } catch { return out; }
  for (const name of entries) {
    if (!name.endsWith('.jsonl')) continue;
    const id = name.slice(0, -6);
    try {
      const raw = readFileSync(file(id), 'utf8');
      const lines = raw.split('\n').filter(Boolean);
      let meta: JobMeta | null = null;
      let finalStatus: 'running' | 'done' | 'error' = 'running';
      for (const ln of lines) {
        try {
          const j = JSON.parse(ln);
          if (j.type === 'meta') {
            if (j.id) meta = { id: j.id, started_at: j.started_at, status: j.status };
            if (j.status) finalStatus = j.status;
          }
        } catch {}
      }
      if (!meta) continue;
      meta.status = finalStatus;
      out.push({ id, meta, bytes: raw.length });
    } catch {}
  }
  return out;
}

/** Прочитать все события для replay (кроме meta) */
export function jobRead(jobId: string): Array<ClaudeEvent | ClaudeDone | ClaudeError> {
  try {
    const raw = readFileSync(file(jobId), 'utf8');
    const events: Array<ClaudeEvent | ClaudeDone | ClaudeError> = [];
    for (const line of raw.split('\n')) {
      if (!line) continue;
      try {
        const j = JSON.parse(line);
        if (j.type === 'meta') continue;
        events.push(j);
      } catch {}
    }
    return events;
  } catch {
    return [];
  }
}

/** Garbage-collect очень старых jobs (> 24h) */
export function jobCleanup(): void {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  for (const j of jobList()) {
    const age = now - new Date(j.meta.started_at).getTime();
    if (age > DAY) jobDelete(j.id);
  }
}
