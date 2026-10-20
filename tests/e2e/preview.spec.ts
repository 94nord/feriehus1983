import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { ADMIN_URL, ENV_FILE } from '../lib/stack';

const env = () => Object.fromEntries(readFileSync(ENV_FILE, 'utf8').trim().split('\n').map((l) => l.split(/=(.*)/s).slice(0, 2)));

async function draftId(request: import('@playwright/test').APIRequestContext) {
  const res = await request.get(`${ADMIN_URL}/api/articles?status=draft&filters[slug][$eq]=kladde`, {
    headers: { Authorization: `Bearer ${env().STRAPI_TOKEN}` },
  });
  const { data } = await res.json();
  return data[0].documentId as string;
}

test('preview with the secret shows the draft', async ({ page, request }) => {
  const id = await draftId(request);
  const res = await page.goto(`/preview?type=article&id=${id}&status=draft&secret=${env().PREVIEW_SECRET}`);
  expect(res?.status()).toBe(200);
  expect(res?.headers()['cache-control']).toBe('no-store');
  expect(res?.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kladde');
  await expect(page.getByText('Forhåndsvisning af kladde')).toBeVisible();
});

test('preview without or with a wrong secret returns 404', async ({ page, request }) => {
  const id = await draftId(request);
  for (const secret of ['', 'wrong']) {
    const res = await page.goto(`/preview?type=article&id=${id}&status=draft&secret=${secret}`);
    expect(res?.status()).toBe(404);
  }
});
