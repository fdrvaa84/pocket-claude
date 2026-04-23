import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { query, queryOne } from './db';

const SESSION_COOKIE = 'pc_session';

export interface User {
  id: string;
  email: string;
  name: string | null;
  is_admin: boolean;
}

export async function getAuthUser(): Promise<User | null> {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (!sid) return null;
  const user = await queryOne<User>(
    `SELECT u.id, u.email, u.name, u.is_admin
     FROM pc.user_sessions s JOIN pc.users u ON u.id = s.user_id
     WHERE s.id = $1`,
    [sid],
  );
  if (user) {
    await query(`UPDATE pc.user_sessions SET last_active = NOW() WHERE id = $1`, [sid]);
    await query(`UPDATE pc.users SET last_active = NOW() WHERE id = $1`, [user.id]);
  }
  return user;
}

export async function login(email: string, password: string): Promise<User | null> {
  const row = await queryOne<User & { password_hash: string }>(
    `SELECT id, email, name, is_admin, password_hash FROM pc.users WHERE email = $1`,
    [email],
  );
  if (!row || !row.password_hash) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;
  const sid = uuidv4();
  await query(`INSERT INTO pc.user_sessions (id, user_id) VALUES ($1, $2)`, [sid, row.id]);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sid, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, path: '/',
  });
  return { id: row.id, email: row.email, name: row.name, is_admin: row.is_admin };
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (sid) await query(`DELETE FROM pc.user_sessions WHERE id = $1`, [sid]);
  jar.delete(SESSION_COOKIE);
}

export async function register(email: string, password: string, name?: string, isAdmin = false): Promise<User> {
  const hash = await bcrypt.hash(password, 10);
  const rows = await query<{ id: string }>(
    `INSERT INTO pc.users (email, password_hash, name, is_admin) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [email, hash, name || null, isAdmin],
  );
  if (!rows[0]) throw new Error('User already exists');
  return { id: rows[0].id, email, name: name || null, is_admin: isAdmin };
}

export async function hasAnyUser(): Promise<boolean> {
  const r = await queryOne<{ c: string }>(`SELECT COUNT(*)::text as c FROM pc.users`, []);
  return Number(r?.c || '0') > 0;
}
