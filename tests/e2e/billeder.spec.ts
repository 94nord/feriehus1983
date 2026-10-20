import { expect, test } from '@playwright/test';
import { FOTO_I_TEKST, SENESTE_NYHED } from '../lib/seed';

const STOERRELSER = /\/uploads\/(thumbnail|small|medium|large|xlarge)_/;

test('billede i brødteksten vises med alt-tekst', async ({ page }) => {
  await page.goto(`/nyheder/${SENESTE_NYHED.slug}`);
  const foto = page.getByRole('img', { name: FOTO_I_TEKST.alt });
  await expect(foto).toBeVisible();
  await expect(foto).toHaveAttribute('loading', 'lazy');
  expect(await foto.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('siden bruger kun de genererede størrelser, højst 1600 px', async ({ page }) => {
  await page.goto(`/nyheder/${SENESTE_NYHED.slug}`);
  const foto = page.getByRole('img', { name: FOTO_I_TEKST.alt });

  expect(await foto.getAttribute('src')).toMatch(/\/uploads\/xlarge_/);
  const kandidater = (await foto.getAttribute('srcset'))!.split(', ').map((k) => k.split(' '));
  for (const [url] of kandidater) expect(url).toMatch(STOERRELSER);
  expect(Math.max(...kandidater.map(([, w]) => parseInt(w)))).toBe(1600);
});

test('originalen er skaleret ned til 2400 px og uden EXIF/GPS', async ({ page, request }) => {
  await page.goto(`/nyheder/${SENESTE_NYHED.slug}`);
  const foto = page.getByRole('img', { name: FOTO_I_TEKST.alt });

  // width/height på <img> er originalens mål fra Strapi
  expect(Number(await foto.getAttribute('width'))).toBe(2400);
  expect(Number(await foto.getAttribute('height'))).toBe(1350);

  const original = (await foto.getAttribute('src'))!.replace('/uploads/xlarge_', '/uploads/');
  const res = await request.get(original);
  expect(res.ok()).toBe(true);
  const bytes = await res.body();
  expect(bytes.includes(Buffer.from('Exif\0\0')), 'originalen må ikke have EXIF').toBe(false);
});
