import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', 'migrations');

async function main() {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  await pool.query(`CREATE TABLE IF NOT EXISTS pc_migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const { rows } = await pool.query(`SELECT 1 FROM pc_migrations WHERE name = $1`, [file]);
    if (rows.length) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`[migrate] applying ${file}`);
    await pool.query(sql);
    await pool.query(`INSERT INTO pc_migrations(name) VALUES ($1)`, [file]);
  }
  await pool.end();
  console.log('[migrate] done');
}

main().catch(e => { console.error(e); process.exit(1); });
