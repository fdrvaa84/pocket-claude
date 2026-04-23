import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, login, logout, register, hasAnyUser } from '@/lib/auth';

/** GET — текущий пользователь / нужен ли setup */
export async function GET() {
  const user = await getAuthUser();
  if (user) return NextResponse.json({ user });
  const hasUser = await hasAnyUser();
  return NextResponse.json({ user: null, setup: !hasUser });
}

/** POST — логин */
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 });
  const user = await login(String(email).trim().toLowerCase(), String(password));
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  return NextResponse.json({ user });
}

/** PUT — зарегистрировать первого админа (single-user mode) */
export async function PUT(req: NextRequest) {
  const has = await hasAnyUser();
  if (has) return NextResponse.json({ error: 'Setup already done' }, { status: 409 });
  const { email, password, name } = await req.json();
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: 'Email and password (6+ chars) required' }, { status: 400 });
  }
  const user = await register(String(email).trim().toLowerCase(), String(password), name, true);
  // сразу логиним
  await login(user.email, String(password));
  return NextResponse.json({ user });
}

/** DELETE — logout */
export async function DELETE() {
  await logout();
  return NextResponse.json({ ok: true });
}
