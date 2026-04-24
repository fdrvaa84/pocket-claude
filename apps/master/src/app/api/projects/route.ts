import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await query<any>(
    `SELECT p.id, p.name, p.path, p.instructions, p.device_id, p.claude_device_id, p.default_model,
            d.name as device_name, d.kind as device_kind, d.preferred_agent as device_preferred_agent,
            cd.name as claude_device_name, cd.preferred_agent as claude_device_preferred_agent,
            (SELECT COUNT(*) FROM pc.sessions s WHERE s.project_id = p.id) as chat_count
     FROM pc.projects p
     LEFT JOIN pc.devices d  ON d.id  = p.device_id
     LEFT JOIN pc.devices cd ON cd.id = p.claude_device_id
     WHERE p.user_id = $1 ORDER BY p.updated_at DESC`,
    [user.id],
  );
  return NextResponse.json({ projects: rows });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, path = null, device_id = null, claude_device_id = null, instructions = '', default_model = null } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  if (device_id) {
    const d = await queryOne<{ id: string }>(
      `SELECT id FROM pc.devices WHERE id = $1 AND user_id = $2`, [device_id, user.id]);
    if (!d) return NextResponse.json({ error: 'Device not found' }, { status: 400 });
  }
  if (claude_device_id) {
    const cd = await queryOne<{ id: string; agent_logged_in: boolean | null }>(
      `SELECT id, agent_logged_in FROM pc.devices WHERE id = $1 AND user_id = $2`,
      [claude_device_id, user.id],
    );
    if (!cd) return NextResponse.json({ error: 'Claude device not found' }, { status: 400 });
    if (cd.agent_logged_in !== true) {
      return NextResponse.json({ error: 'Claude device has no `claude login`' }, { status: 400 });
    }
  }
  const rows = await query<{ id: string }>(
    `INSERT INTO pc.projects (user_id, device_id, claude_device_id, name, path, instructions, default_model)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [user.id, device_id, claude_device_id, String(name).trim(), path, instructions, default_model],
  );
  return NextResponse.json({ id: rows[0].id });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, name, path, device_id, claude_device_id, instructions, default_model } = await req.json();
  await query(
    `UPDATE pc.projects SET
       name = COALESCE($1, name),
       path = COALESCE($2, path),
       device_id = COALESCE($3, device_id),
       claude_device_id = $4,
       instructions = COALESCE($5, instructions),
       default_model = COALESCE($6, default_model),
       updated_at = NOW()
     WHERE id = $7 AND user_id = $8`,
    [name, path, device_id, claude_device_id ?? null, instructions, default_model, id, user.id],
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await query(`DELETE FROM pc.projects WHERE id = $1 AND user_id = $2`, [id, user.id]);
  return NextResponse.json({ ok: true });
}
