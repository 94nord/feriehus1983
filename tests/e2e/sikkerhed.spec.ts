import { expect, test } from '@playwright/test';
import { ADMIN_URL } from '../lib/stack';

test('slutbruger-login og registrering er spærret', async ({ request }) => {
  for (const sti of ['/api/auth/local/register', '/api/auth/local', '/api/users', '/api/connect/github']) {
    const res = await request.post(`${ADMIN_URL}${sti}`, { data: {} });
    expect(res.status(), sti).toBe(404);
  }
});

test('API kræver token', async ({ request }) => {
  const res = await request.get(`${ADMIN_URL}/api/nyheder`);
  expect(res.status()).toBe(403);
});
