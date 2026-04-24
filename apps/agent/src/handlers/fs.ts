import { readFile, writeFile, mkdir, readdir, stat, rm } from 'node:fs/promises';
import { join, basename } from 'node:path';
import type {
  FsListRequest, FsListReply,
  FsReadRequest, FsReadReply,
  FsWriteRequest, FsWriteReply,
  FsMkdirRequest, FsMkdirReply,
  FsDeleteRequest, FsDeleteReply,
  FsEntry,
} from '@autmzr/command-protocol';
import { safePath, SafetyError } from '../safety.js';

const MAX_READ = 5 * 1024 * 1024;
const MAX_LIST_ENTRIES = 2000;

function isTextLikely(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(buf.length, 8192));
  for (let i = 0; i < sample.length; i++) {
    const b = sample[i];
    if (b === 0) return false;
    if (b < 9) return false;
  }
  return true;
}

export async function handleFsList(req: FsListRequest): Promise<FsListReply> {
  try {
    const path = safePath(req.path);
    const depth = Math.max(1, Math.min(req.depth ?? 1, 3));
    const entries: FsEntry[] = [];
    let truncated = false;
    await walk(path, '', depth, entries, MAX_LIST_ENTRIES, (wasTrunc) => { truncated = wasTrunc; });
    return { type: 'fs.list.reply', correlation_id: req.id, path, entries, truncated };
  } catch (e) {
    const err = e as SafetyError | Error;
    return { type: 'fs.list.reply', correlation_id: req.id, path: req.path, entries: [], error: err.message };
  }
}

async function walk(root: string, rel: string, depth: number, out: FsEntry[], limit: number, setTrunc: (v: boolean) => void): Promise<void> {
  const cur = rel ? join(root, rel) : root;
  let raw;
  try { raw = await readdir(cur, { withFileTypes: true }); } catch { return; }
  for (const e of raw) {
    if (out.length >= limit) { setTrunc(true); return; }
    if (e.name.startsWith('.')) continue; // скрытые — пропускаем
    const entryRel = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      out.push({ name: e.name, path: entryRel, type: 'dir' });
      if (depth > 1) await walk(root, entryRel, depth - 1, out, limit, setTrunc);
    } else if (e.isFile()) {
      let size = 0;
      try { size = (await stat(join(cur, e.name))).size; } catch {}
      out.push({ name: e.name, path: entryRel, type: 'file', size });
    }
  }
  // папки перед файлами, alphabetical — отсортируем на верхнем уровне
  if (!rel) {
    out.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }
}

export async function handleFsRead(req: FsReadRequest): Promise<FsReadReply> {
  try {
    const path = safePath(req.path);
    const s = await stat(path);
    if (!s.isFile()) return { type: 'fs.read.reply', correlation_id: req.id, path, error: 'not a file' };
    if (s.size > (req.max_bytes ?? MAX_READ)) {
      return { type: 'fs.read.reply', correlation_id: req.id, path, size: s.size, error: 'file too large' };
    }
    const buf = await readFile(path);
    if (!isTextLikely(buf)) {
      return { type: 'fs.read.reply', correlation_id: req.id, path, size: s.size, binary: true };
    }
    return { type: 'fs.read.reply', correlation_id: req.id, path, size: s.size, content: buf.toString('utf8') };
  } catch (e) {
    return { type: 'fs.read.reply', correlation_id: req.id, path: req.path, error: (e as Error).message };
  }
}

export async function handleFsWrite(req: FsWriteRequest): Promise<FsWriteReply> {
  try {
    const path = safePath(req.path);
    if (req.create_dirs) await mkdir(pathDir(path), { recursive: true });
    await writeFile(path, req.content, 'utf8');
    const s = await stat(path);
    return { type: 'fs.write.reply', correlation_id: req.id, path, size: s.size };
  } catch (e) {
    return { type: 'fs.write.reply', correlation_id: req.id, path: req.path, error: (e as Error).message };
  }
}

export async function handleFsMkdir(req: FsMkdirRequest): Promise<FsMkdirReply> {
  try {
    const path = safePath(req.path);
    await mkdir(path, { recursive: req.recursive ?? true });
    return { type: 'fs.mkdir.reply', correlation_id: req.id };
  } catch (e) {
    return { type: 'fs.mkdir.reply', correlation_id: req.id, error: (e as Error).message };
  }
}

export async function handleFsDelete(req: FsDeleteRequest): Promise<FsDeleteReply> {
  try {
    const path = safePath(req.path);
    await rm(path, { recursive: req.recursive ?? false, force: true });
    return { type: 'fs.delete.reply', correlation_id: req.id };
  } catch (e) {
    return { type: 'fs.delete.reply', correlation_id: req.id, error: (e as Error).message };
  }
}

function pathDir(p: string): string {
  const ix = p.lastIndexOf('/');
  return ix <= 0 ? '/' : p.slice(0, ix);
}
