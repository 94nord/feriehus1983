import { randomBytes } from 'node:crypto';
import { chmodSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { seed } from './lib/seed';
import { ADMIN_URL, BASE_URL, ENV_FILE, ROOT, compose, waitFor } from './lib/stack';

const secret = () => randomBytes(32).toString('base64');

function writeEnv(values: Record<string, string>) {
  writeFileSync(ENV_FILE, Object.entries(values).map(([k, v]) => `${k}=${v}`).join('\n') + '\n', { mode: 0o600 });
}

async function adminApi<T>(path: string, jwt: string | null, body?: unknown, method = 'POST'): Promise<T> {
  const res = await fetch(`${ADMIN_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

export default async function globalSetup() {
  const data = path.join(ROOT, 'data-test');
  rmSync(data, { recursive: true, force: true });
  for (const dir of ['db', 'uploads']) {
    mkdirSync(path.join(data, dir), { recursive: true });
    // Strapi runs as the node user (uid 1000) in the container. On a Linux CI runner the
    // folders belong to another uid, so they must be writable for everyone in the test stack.
    chmodSync(path.join(data, dir), 0o777);
  }

  const env = {
    SITE_ADDRESS: BASE_URL,
    ADMIN_ADDRESS: ADMIN_URL,
    CMS_PUBLIC_URL: ADMIN_URL,
    APP_KEYS: `${secret()},${secret()}`,
    API_TOKEN_SALT: secret(),
    ADMIN_JWT_SECRET: secret(),
    TRANSFER_TOKEN_SALT: secret(),
    JWT_SECRET: secret(),
    ENCRYPTION_KEY: secret(),
    SITE_URL: BASE_URL,
    PREVIEW_SECRET: randomBytes(32).toString('hex'),
    STRAPI_CACHE_SECONDS: '0',
    STRAPI_TOKEN: '',
  };
  writeEnv(env);
  try {
    compose('up', '-d', '--build', '--wait');
  } catch (error) {
    // Show why the stack did not start (e.g. Strapi failing to open its database)
    console.error(compose('logs', '--no-color', '--tail', '100', 'cms'));
    throw error;
  }

  const email = 'admin@example.test';
  const password = `Test-${randomBytes(8).toString('hex')}A1`;
  compose('exec', '-T', 'cms', 'node_modules/.bin/strapi', 'admin:create-user',
    '--firstname=Test', '--lastname=Admin', `--email=${email}`, `--password=${password}`);

  const { data: login } = await adminApi<{ data: { token: string } }>('/admin/login', null, { email, password });
  const createToken = (name: string, type: string) =>
    adminApi<{ data: { id: number; accessKey: string } }>('/admin/api-tokens', login.token, { name, type, lifespan: null });

  const readOnly = await createToken('Frontend (read-only)', 'read-only');
  const fullAccess = await createToken('Seed', 'full-access');
  await seed(fullAccess.data.accessKey);
  await adminApi(`/admin/api-tokens/${fullAccess.data.id}`, login.token, undefined, 'DELETE');

  // The frontend is restarted with the read-only token
  writeEnv({ ...env, STRAPI_TOKEN: readOnly.data.accessKey });
  compose('up', '-d', 'web');
  await waitFor(BASE_URL);
}
