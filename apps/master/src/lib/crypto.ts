import crypto from 'node:crypto';

const ALG = 'aes-256-gcm';

function key(): Buffer {
  const raw = process.env.INTEGRATION_KEY || '';
  const buf = Buffer.from(raw, 'hex');
  if (buf.length !== 32) {
    throw new Error('INTEGRATION_KEY must be 32 bytes hex (use `openssl rand -hex 32`)');
  }
  return buf;
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, key(), iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.');
}

export function decrypt(blob: string): string {
  const [ivB, tagB, encB] = blob.split('.');
  const iv = Buffer.from(ivB, 'base64');
  const tag = Buffer.from(tagB, 'base64');
  const enc = Buffer.from(encB, 'base64');
  const dec = crypto.createDecipheriv(ALG, key(), iv);
  dec.setAuthTag(tag);
  return Buffer.concat([dec.update(enc), dec.final()]).toString('utf8');
}

/** Хэш device_token для хранения в БД (bcrypt лишний для random string, SHA-256 достаточно). */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}
