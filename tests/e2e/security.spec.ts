import { expect, test } from '@playwright/test';
import { ADMIN_URL } from '../lib/stack';

test('end-user login and registration are blocked', async ({ request }) => {
  for (const path of ['/api/auth/local/register', '/api/auth/local', '/api/users', '/api/connect/github']) {
    const res = await request.post(`${ADMIN_URL}${path}`, { data: {} });
    expect(res.status(), path).toBe(404);
  }
});

test('password reset is blocked', async ({ request }) => {
  for (const path of ['/admin/forgot-password', '/admin/reset-password']) {
    const res = await request.post(`${ADMIN_URL}${path}`, { data: { email: 'x@example.test' } });
    expect(res.status(), path).toBe(404);
  }
});

test('the API requires a token', async ({ request }) => {
  const res = await request.get(`${ADMIN_URL}/api/articles`);
  expect(res.status()).toBe(403);
});
