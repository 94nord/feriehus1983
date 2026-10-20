import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { ADMIN_URL, ENV_FIL } from '../lib/stack';

const env = () => Object.fromEntries(readFileSync(ENV_FIL, 'utf8').trim().split('\n').map((l) => l.split(/=(.*)/s).slice(0, 2)));

async function kladdeId(request: import('@playwright/test').APIRequestContext) {
  const res = await request.get(`${ADMIN_URL}/api/nyheder?status=draft&filters[slug][$eq]=kladde`, {
    headers: { Authorization: `Bearer ${env().STRAPI_TOKEN}` },
  });
  const { data } = await res.json();
  return data[0].documentId as string;
}

test('forhåndsvisning med nøgle viser kladden', async ({ page, request }) => {
  const id = await kladdeId(request);
  const res = await page.goto(`/preview?type=nyhed&id=${id}&status=draft&hemmelighed=${env().PREVIEW_SECRET}`);
  expect(res?.status()).toBe(200);
  expect(res?.headers()['cache-control']).toBe('no-store');
  expect(res?.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kladde');
  await expect(page.getByText('Forhåndsvisning af kladde')).toBeVisible();
});

test('forhåndsvisning uden eller med forkert nøgle giver 404', async ({ page, request }) => {
  const id = await kladdeId(request);
  for (const nøgle of ['', 'forkert']) {
    const res = await page.goto(`/preview?type=nyhed&id=${id}&status=draft&hemmelighed=${nøgle}`);
    expect(res?.status()).toBe(404);
  }
});
