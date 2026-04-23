import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, createInvite, listInvites, revokeInvite } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { log } from '@/lib/log';

/** GET — список своих invite-кодов */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const invites = await listInvites(user.id);
  return NextResponse.json({ invites });
}

/** POST — сгенерировать новый invite { ttlDays?, note? } */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Тротлинг создания: 20 кодов в час с одного юзера — должно хватить любым.
  const limited = rateLimit(req, { key: 'invite-create', max: 20, windowMs: 3600_000, perUser: user.id });
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const ttlDays = body.ttlDays ? Math.max(1, Math.min(365, Number(body.ttlDays))) : undefined;
  const note = body.note ? String(body.note).slice(0, 200) : undefined;

  const code = await createInvite(user.id, { ttlDays, note });
  log.info('invite created', { userId: user.id, code, ttlDays, note });
  return NextResponse.json({ code });
}

/** DELETE ?code=XXX — отозвать */
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const code = new URL(req.url).searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });
  const ok = await revokeInvite(user.id, code);
  if (!ok) return NextResponse.json({ error: 'Code not found, already used or not yours' }, { status: 404 });
  log.info('invite revoked', { userId: user.id, code });
  return NextResponse.json({ ok: true });
}
