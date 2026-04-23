import pg from 'pg';

declare global {
  var __pc_pool: pg.Pool | undefined;
}

function getPool(): pg.Pool {
  if (!globalThis.__pc_pool) {
    globalThis.__pc_pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    });
  }
  return globalThis.__pc_pool;
}

export async function query<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const { rows } = await getPool().query(text, params);
  return rows as T[];
}

export async function queryOne<T = any>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
