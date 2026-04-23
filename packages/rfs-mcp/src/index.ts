/**
 * pocket-claude Remote FileSystem MCP server.
 *
 * Ethical-first design:
 *  - This process is spawned by claude CLI as a stdio MCP server on the "claude-device".
 *  - All tool calls are proxied to pocket-claude master over HTTPS.
 *  - Master then round-trips to the "fs-device" agent via its persistent WebSocket.
 *  - Actual files & shell commands live and run on fs-device. claude-device only hosts the CLI.
 *  - We never touch Anthropic traffic — claude CLI talks to Anthropic directly.
 *
 * Config (env vars, all set by claude-device agent):
 *   POCKET_CLAUDE_MASTER_URL   https://master.example.com
 *   POCKET_CLAUDE_RFS_TOKEN    one-time bearer, scoped to (user, project, fs-device)
 *   POCKET_CLAUDE_RFS_LABEL    optional human-readable label (logged in master UI)
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

interface RpcRequest {
  jsonrpc: '2.0';
  id?: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

interface ToolSpec {
  name: string;
  description: string;
  inputSchema: JsonValue;
}

const MASTER = process.env.POCKET_CLAUDE_MASTER_URL || '';
const TOKEN = process.env.POCKET_CLAUDE_RFS_TOKEN || '';
const LABEL = process.env.POCKET_CLAUDE_RFS_LABEL || 'rfs';

function stderr(msg: string) {
  // stdout is reserved for JSON-RPC; everything else → stderr.
  process.stderr.write(`[rfs-mcp ${LABEL}] ${msg}\n`);
}

if (!MASTER || !TOKEN) {
  stderr('FATAL: POCKET_CLAUDE_MASTER_URL and POCKET_CLAUDE_RFS_TOKEN are required');
  process.exit(1);
}

// ============================================================
// Tool registry
// ============================================================

const TOOLS: ToolSpec[] = [
  {
    name: 'rfs_list',
    description:
      'List directory contents on the remote (fs-device). Use this instead of any built-in file-listing tool. Returns names, types (dir/file) and sizes.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path on the remote filesystem' },
      },
      required: ['path'],
    },
  },
  {
    name: 'rfs_read',
    description:
      'Read a text file on the remote (fs-device). Use this instead of any built-in Read tool. Returns the full UTF-8 content. Binary files are rejected.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        max_bytes: { type: 'number', description: 'Optional size limit. Default 5MB.' },
      },
      required: ['path'],
    },
  },
  {
    name: 'rfs_write',
    description:
      'Create or overwrite a file on the remote (fs-device). Use this instead of any built-in Write tool. Parent directories will be created automatically.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'rfs_edit',
    description:
      'Edit a file on the remote (fs-device) by replacing an exact string. Use this instead of any built-in Edit tool. Fails if "old_string" is not found or is not unique (unless replace_all=true).',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        old_string: { type: 'string' },
        new_string: { type: 'string' },
        replace_all: { type: 'boolean', description: 'Replace all occurrences. Default false.' },
      },
      required: ['path', 'old_string', 'new_string'],
    },
  },
  {
    name: 'rfs_bash',
    description:
      'Run a shell command on the remote (fs-device). Use this instead of any built-in Bash tool. Useful for git, build, psql, curl — anything that must access the fs-device, its DB or its network.',
    inputSchema: {
      type: 'object',
      properties: {
        cmd: { type: 'string', description: 'Command to execute (bash -lc)' },
        cwd: { type: 'string', description: 'Optional working directory' },
        timeout_ms: { type: 'number', description: 'Default 60000' },
      },
      required: ['cmd'],
    },
  },
];

// ============================================================
// HTTP helpers
// ============================================================

async function rpc(op: string, body: Record<string, unknown>): Promise<any> {
  const url = `${MASTER.replace(/\/$/, '')}/api/rfs/${op}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { error: text || `HTTP ${res.status}` }; }
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// ============================================================
// Tool implementations
// ============================================================

async function toolCall(name: string, args: Record<string, unknown>) {
  try {
    switch (name) {
      case 'rfs_list': {
        const res = await rpc('list', { path: args.path });
        const lines = (res.entries || []).map((e: any) =>
          `${e.type === 'dir' ? 'd' : '-'} ${String(e.size ?? '').padStart(10)}  ${e.name}${e.type === 'dir' ? '/' : ''}`,
        );
        return ok([`# ${res.path}`, ...lines].join('\n'));
      }
      case 'rfs_read': {
        const res = await rpc('read', { path: args.path, max_bytes: args.max_bytes });
        if (res.binary) return err(`binary file (${res.size} bytes), cannot be returned as text`);
        return ok(res.content || '');
      }
      case 'rfs_write': {
        await rpc('write', { path: args.path, content: args.content });
        return ok(`Wrote ${String(args.path)}.`);
      }
      case 'rfs_edit': {
        const res = await rpc('edit', {
          path: args.path,
          old_string: args.old_string,
          new_string: args.new_string,
          replace_all: args.replace_all === true,
        });
        return ok(`Edited ${String(args.path)} (${res.replaced ?? 1} occurrence${(res.replaced ?? 1) === 1 ? '' : 's'}).`);
      }
      case 'rfs_bash': {
        const res = await rpc('exec', {
          cmd: args.cmd,
          cwd: args.cwd,
          timeout_ms: args.timeout_ms ?? 60_000,
        });
        const parts: string[] = [];
        if (res.stdout) parts.push(res.stdout);
        if (res.stderr) parts.push(`[stderr]\n${res.stderr}`);
        if (res.exit_code !== 0) parts.push(`[exit ${res.exit_code}]`);
        return ok(parts.join('\n') || '(no output)');
      }
      default:
        return err(`unknown tool: ${name}`);
    }
  } catch (e: any) {
    stderr(`${name} failed: ${e.message || e}`);
    return err(`rfs-mcp error: ${e.message || String(e)}`);
  }
}

function ok(text: string) {
  return { content: [{ type: 'text', text }] };
}
function err(text: string) {
  return { content: [{ type: 'text', text }], isError: true };
}

// ============================================================
// JSON-RPC stdio loop
// ============================================================

function send(id: number | string | null | undefined, result: unknown) {
  if (id === undefined || id === null) return;
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}
function sendError(id: number | string | null | undefined, code: number, message: string) {
  if (id === undefined || id === null) return;
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}

async function handle(req: RpcRequest) {
  const { id, method, params } = req;
  try {
    if (method === 'initialize') {
      send(id, {
        protocolVersion: '2024-11-05',
        serverInfo: { name: 'pocket-claude-rfs', version: '0.1.0' },
        capabilities: { tools: {} },
      });
      return;
    }
    if (method === 'notifications/initialized' || method === 'initialized') {
      return; // no response for notifications
    }
    if (method === 'tools/list') {
      send(id, { tools: TOOLS });
      return;
    }
    if (method === 'tools/call') {
      const name = String(params?.name || '');
      const args = (params?.arguments as Record<string, unknown>) || {};
      const result = await toolCall(name, args);
      send(id, result);
      return;
    }
    // Unknown method — MCP spec wants an error response for requests, nothing for notifications.
    if (id !== undefined && id !== null) {
      sendError(id, -32601, `Method not found: ${method}`);
    }
  } catch (e: any) {
    sendError(id ?? null, -32603, e.message || String(e));
  }
}

// Line-based JSON-RPC: read stdin, split by newlines, parse each as a frame.
let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';
  for (const line of lines) {
    const s = line.trim();
    if (!s) continue;
    let req: RpcRequest;
    try { req = JSON.parse(s) as RpcRequest; } catch { stderr(`bad JSON: ${s.slice(0, 200)}`); continue; }
    handle(req);
  }
});
process.stdin.on('end', () => process.exit(0));

stderr(`ready — master=${MASTER.replace(/\/+$/, '')} label=${LABEL}`);
