import { randomBytes } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { seed } from './lib/seed';
import { ADMIN_URL, BASE_URL, ENV_FIL, ROD, compose, ventPaa } from './lib/stack';

const hemmelighed = () => randomBytes(32).toString('base64');

function skrivEnv(strapiToken = '') {
  const linjer = {
    SITE_ADDRESS: BASE_URL,
    ADMIN_ADDRESS: ADMIN_URL,
    CMS_PUBLIC_URL: ADMIN_URL,
    APP_KEYS: `${hemmelighed()},${hemmelighed()}`,
    API_TOKEN_SALT: hemmelighed(),
    ADMIN_JWT_SECRET: hemmelighed(),
    TRANSFER_TOKEN_SALT: hemmelighed(),
    JWT_SECRET: hemmelighed(),
    ENCRYPTION_KEY: hemmelighed(),
    SITE_URL: BASE_URL,
    PREVIEW_SECRET: randomBytes(32).toString('hex'),
    STRAPI_CACHE_SECONDS: '0',
    STRAPI_TOKEN: strapiToken,
  };
  writeFileSync(ENV_FIL, Object.entries(linjer).map(([k, v]) => `${k}=${v}`).join('\n') + '\n', { mode: 0o600 });
  return linjer;
}

async function adminApi<T>(sti: string, jwt: string | null, body?: unknown, method = 'POST'): Promise<T> {
  const res = await fetch(`${ADMIN_URL}${sti}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${sti}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

export default async function globalSetup() {
  const data = path.join(ROD, 'data-test');
  rmSync(data, { recursive: true, force: true });
  mkdirSync(path.join(data, 'db'), { recursive: true });
  mkdirSync(path.join(data, 'uploads'), { recursive: true });

  const env = skrivEnv();
  compose('up', '-d', '--build', '--wait');

  const email = 'admin@example.test';
  const password = `Test-${randomBytes(8).toString('hex')}A1`;
  compose('exec', '-T', 'cms', 'node_modules/.bin/strapi', 'admin:create-user',
    '--firstname=Test', '--lastname=Admin', `--email=${email}`, `--password=${password}`);

  const { data: login } = await adminApi<{ data: { token: string } }>('/admin/login', null, { email, password });
  const opretToken = (name: string, type: string) =>
    adminApi<{ data: { id: number; accessKey: string } }>('/admin/api-tokens', login.token, { name, type, lifespan: null });

  const laes = await opretToken('Frontend (læseadgang)', 'read-only');
  const fuld = await opretToken('Seed', 'full-access');
  await seed(fuld.data.accessKey);
  await adminApi(`/admin/api-tokens/${fuld.data.id}`, login.token, undefined, 'DELETE');

  // Frontenden genstartes med læsetokenet
  writeFileSync(
    ENV_FIL,
    Object.entries({ ...env, STRAPI_TOKEN: laes.data.accessKey }).map(([k, v]) => `${k}=${v}`).join('\n') + '\n',
    { mode: 0o600 },
  );
  compose('up', '-d', 'web');
  await ventPaa(BASE_URL);
}
