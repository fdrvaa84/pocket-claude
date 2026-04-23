import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { queryOne } from '@/lib/db';

/**
 * GET /api/sessions/:id/job
 * Для UI: есть ли сейчас активный job для этой сессии?
 * Возвращает накопленный частичный текст и время начала — чтобы показать
 * «выполняется 2 мин / 400 символов пришло» без реального стрима.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: sessionId } = await params;

  const job = await queryOne<{
    id: string; status: string; accumulated_text: string;
    started_at: string; last_event_at: string; prompt: string;
  }>(
    `SELECT j.id, j.status, j.accumulated_text, j.started_at, j.last_event_at, j.prompt
     FROM pc.chat_jobs j
     JOIN pc.sessions s ON s.id = j.session_id AND s.user_id = $1
     WHERE j.session_id = $2 AND j.status = 'running'
     ORDER BY j.started_at DESC LIMIT 1`,
    [user.id, sessionId],
  );

  return NextResponse.json({ job });
}
