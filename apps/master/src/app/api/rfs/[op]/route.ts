/**
 * Backend for rfs-mcp.
 *
 * POST /api/rfs/:op   (op ∈ list|read|write|edit|exec)
 *   Authorization: Bearer <rfs_token>
 *   Body: JSON specific per op
 *
 * No cookie auth here — tokens are issued per claude invocation and stored in pc.rfs_tokens.
 * The rfs-mcp process on claude-device uses this token; it never holds user cookies.
 */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type {
  FsListRequest, FsListReply,
  FsReadRequest, FsReadReply,
  FsWriteRequest, FsWriteReply,
  ExecRequest,
} from '@autmzr/command-protocol';
import { hub } from '@/lib/ws-hub';
import { validateRfsToken } from '@/lib/rfs-tokens';

type Op = 'list' | 'read' | 'write' | 'edit' | 'exec';
const OPS: Op[] = ['list', 'read', 'write', 'edit', 'exec'];

async function auth(req: NextRequest) {
  const h = req.headers.get('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  return validateRfsToken(m[1].trim());
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ op: string }> }) {
  const { op: opRaw } = await params;
  const op = opRaw as Op;
  if (!OPS.includes(op)) {
    return NextResponse.json({ error: 'unknown op' }, { status: 404 });
  }

  const scope = await auth(req);
  if (!scope) return NextResponse.json({ error: 'invalid or expired rfs token' }, { status: 401 });

  const deviceId = scope.fs_device_id;
  const userId = scope.user_id;

  if (!hub().isOnline(deviceId)) {
    return NextResponse.json({ error: 'fs-device offline' }, { status: 503 });
  }

  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  try {
    switch (op) {
      case 'list': {
        if (typeof body.path !== 'string') return NextResponse.json({ error: 'path required' }, { status: 400 });
        const msg: FsListRequest = { type: 'fs.list', id: uuidv4(), path: body.path, depth: 1 };
        const reply = await hub().request<FsListReply>(deviceId, userId, msg, 'fs.list.reply', 15_000);
        if (reply.error) return NextResponse.json({ error: reply.error }, { status: 400 });
        return NextResponse.json({ path: reply.path, entries: reply.entries, truncated: reply.truncated });
      }

      case 'read': {
        if (typeof body.path !== 'string') return NextResponse.json({ error: 'path required' }, { status: 400 });
        const msg: FsReadRequest = {
          type: 'fs.read', id: uuidv4(), path: body.path,
          max_bytes: typeof body.max_bytes === 'number' ? body.max_bytes : undefined,
        };
        const reply = await hub().request<FsReadReply>(deviceId, userId, msg, 'fs.read.reply', 20_000);
        if (reply.error) return NextResponse.json({ error: reply.error }, { status: 400 });
        return NextResponse.json({
          path: reply.path, content: reply.content, binary: !!reply.binary, size: reply.size,
        });
      }

      case 'write': {
        if (typeof body.path !== 'string' || typeof body.content !== 'string') {
          return NextResponse.json({ error: 'path, content required' }, { status: 400 });
        }
        const msg: FsWriteRequest = {
          type: 'fs.write', id: uuidv4(), path: body.path,
          content: body.content, create_dirs: true,
        };
        const reply = await hub().request<FsWriteReply>(deviceId, userId, msg, 'fs.write.reply', 20_000);
        if (reply.error) return NextResponse.json({ error: reply.error }, { status: 400 });
        return NextResponse.json({ path: reply.path, size: reply.size });
      }

      case 'edit': {
        if (typeof body.path !== 'string' || typeof body.old_string !== 'string' || typeof body.new_string !== 'string') {
          return NextResponse.json({ error: 'path, old_string, new_string required' }, { status: 400 });
        }
        // Read → replace → write. Atomicity — best-effort (WS-roundtrip); acceptable for MVP.
        const readReq: FsReadRequest = { type: 'fs.read', id: uuidv4(), path: body.path };
        const readRep = await hub().request<FsReadReply>(deviceId, userId, readReq, 'fs.read.reply', 20_000);
        if (readRep.error) return NextResponse.json({ error: readRep.error }, { status: 400 });
        if (readRep.binary) return NextResponse.json({ error: 'cannot edit binary file' }, { status: 400 });

        const content = readRep.content || '';
        const { old_string, new_string, replace_all } = body;
        let newContent: string;
        let replaced = 0;
        if (replace_all) {
          newContent = content.split(old_string).join(new_string);
          replaced = newContent === content ? 0 : (content.match(new RegExp(old_string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        } else {
          const first = content.indexOf(old_string);
          if (first === -1) return NextResponse.json({ error: 'old_string not found' }, { status: 400 });
          const second = content.indexOf(old_string, first + old_string.length);
          if (second !== -1) return NextResponse.json({ error: 'old_string not unique; pass replace_all=true or add more context' }, { status: 400 });
          newContent = content.slice(0, first) + new_string + content.slice(first + old_string.length);
          replaced = 1;
        }
        if (replaced === 0) return NextResponse.json({ error: 'old_string not found' }, { status: 400 });

        const writeReq: FsWriteRequest = { type: 'fs.write', id: uuidv4(), path: body.path, content: newContent };
        const writeRep = await hub().request<FsWriteReply>(deviceId, userId, writeReq, 'fs.write.reply', 20_000);
        if (writeRep.error) return NextResponse.json({ error: writeRep.error }, { status: 400 });
        return NextResponse.json({ path: writeRep.path, size: writeRep.size, replaced });
      }

      case 'exec': {
        if (typeof body.cmd !== 'string') return NextResponse.json({ error: 'cmd required' }, { status: 400 });
        const timeout = Math.min(typeof body.timeout_ms === 'number' ? body.timeout_ms : 60_000, 300_000);
        const msg: ExecRequest = {
          type: 'exec', id: uuidv4(),
          cwd: typeof body.cwd === 'string' && body.cwd ? body.cwd : '/',
          cmd: body.cmd, timeout_ms: timeout,
        };
        let stdout = '', stderr = '', exitCode: number | null = null;
        await new Promise<void>((resolve) => {
          let done = false;
          const killer = setTimeout(() => { if (!done) { done = true; unsub(); resolve(); } }, timeout + 5_000);
          const unsub = hub().send(deviceId, userId, msg, (m) => {
            if (m.type === 'exec.stdout') stdout += (m as any).text;
            else if (m.type === 'exec.stderr') stderr += (m as any).text;
            else if (m.type === 'exec.exit') {
              if (done) return;
              done = true; exitCode = (m as any).code; clearTimeout(killer); unsub(); resolve();
            }
          });
        });
        return NextResponse.json({ stdout, stderr, exit_code: exitCode });
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
