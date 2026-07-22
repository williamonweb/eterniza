import { Pool } from 'pg';
import { hashPassword } from './password';

const connectionString = process.env.DATABASE_URL;

let pool;
if (connectionString) {
  if (!global.__eternizaPool) {
    global.__eternizaPool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  pool = global.__eternizaPool;
}

let schemaReady = false;

export function hasDatabase() {
  return Boolean(connectionString);
}

export async function query(text, params = []) {
  if (!pool) throw new Error('DATABASE_URL não configurada. Crie o arquivo .env.local com a conexão do Neon.');
  return pool.query(text, params);
}

export async function ensureSchema() {
  if (schemaReady) return;
  await query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      whatsapp TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cliente',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS tributes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      user_email TEXT,
      category TEXT,
      title TEXT,
      receiver_name TEXT,
      sender_name TEXT,
      special_date DATE,
      plan_id TEXT,
      plan_name TEXT,
      plan_price_cents INTEGER DEFAULT 0,
      music JSONB DEFAULT '{}'::jsonb,
      content JSONB DEFAULT '{}'::jsonb,
      slug TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'rascunho',
      public_url TEXT,
      expires_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS tribute_photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tribute_id UUID REFERENCES tributes(id) ON DELETE CASCADE,
      position INTEGER NOT NULL DEFAULT 0,
      label TEXT,
      url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tribute_id UUID REFERENCES tributes(id) ON DELETE SET NULL,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      plan_id TEXT,
      amount_cents INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pendente',
      provider TEXT DEFAULT 'mercado_pago',
      provider_payment_id TEXT,
      raw_payload JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS tribute_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tribute_id UUID REFERENCES tributes(id) ON DELETE CASCADE,
      user_agent TEXT,
      ip TEXT,
      referrer TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  const adminPassword = hashPassword('eterniza123');
  await query(`
    INSERT INTO users (name, email, whatsapp, password_hash, role)
    VALUES ('Jeslie', 'jeslie@eterniza.com', '', $1, 'admin')
    ON CONFLICT (email) DO UPDATE SET role='admin', name='Jeslie', updated_at=now();
  `, [adminPassword]);
  schemaReady = true;
}
