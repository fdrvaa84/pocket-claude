import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    const messages = await query(
      `SELECT id, role, content, tool_events, created_at FROM pc.messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [id],
    );
    return NextResponse.json({ messages });
  }
  const rows = await query(
    `SELECT id, title, project_id, updated_at, claude_session_id FROM pc.sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 100`,
    [user.id],
  );
  return NextResponse.json({ sessions: rows });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await query(`DELETE FROM pc.sessions WHERE id = $1 AND user_id = $2`, [id, user.id]);
  return NextResponse.json({ ok: true });
}
