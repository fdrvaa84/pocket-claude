import { randomBytes } from 'node:crypto';
import { query, queryOne } from './db';

const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface RfsTokenScope {
  user_id: string;
  project_id: string;
  fs_device_id: string;
  expires_at: string; // ISO
}

/**
 * Выдаёт эфемерный токен для rfs-mcp. Скопирован на (user, project, fs-device).
 * Токен передаётся в env rfs-mcp процесса на claude-device.
 * Expires ~2h — этого достаточно для длинных чатов, после чего токен чистится ниже.
 */
export async function issueRfsToken(
  userId: string,
  projectId: string,
  fsDeviceId: string,
  ttlMs = DEFAULT_TTL_MS,
): Promise<string> {
  const token = 'rfs_' + randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + ttlMs).toISOString();
  await query(
    `INSERT INTO pc.rfs_tokens (token, user_id, project_id, fs_device_id, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [token, userId, projectId, fsDeviceId, expires],
  );
  return token;
}

/** Возвращает scope если токен действителен, иначе null. */
export async function validateRfsToken(token: string): Promise<RfsTokenScope | null> {
  if (!token || !token.startsWith('rfs_')) return null;
  const row = await queryOne<RfsTokenScope>(
    `SELECT user_id, project_id, fs_device_id, expires_at
     FROM pc.rfs_tokens
     WHERE token = $1 AND expires_at > NOW()`,
    [token],
  );
  return row || null;
}

/** Периодический gc истёкших токенов. */
export async function gcExpiredRfsTokens(): Promise<number> {
  const rows = await query<{ token: string }>(
    `DELETE FROM pc.rfs_tokens WHERE expires_at < NOW() RETURNING token`,
    [],
  );
  return rows.length;
}
