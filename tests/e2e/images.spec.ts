import { expect, test } from '@playwright/test';
import { LATEST_ARTICLE, PHOTO_IN_BODY } from '../lib/seed';

const GENERATED_SIZES = /\/uploads\/(thumbnail|small|medium|large|xlarge)_/;

test('an image in the body is shown with alt text', async ({ page }) => {
  await page.goto(`/nyheder/${LATEST_ARTICLE.slug}`);
  const photo = page.getByRole('img', { name: PHOTO_IN_BODY.alt });
  await expect(photo).toBeVisible();
  await expect(photo).toHaveAttribute('loading', 'lazy');
  // The image is lazy-loaded, so bring it into view and wait for it to load
  await photo.scrollIntoViewIfNeeded();
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('the page only uses the generated sizes, at most 1600 px', async ({ page }) => {
  await page.goto(`/nyheder/${LATEST_ARTICLE.slug}`);
  const photo = page.getByRole('img', { name: PHOTO_IN_BODY.alt });

  expect(await photo.getAttribute('src')).toMatch(/\/uploads\/xlarge_/);
  const candidates = (await photo.getAttribute('srcset'))!.split(', ').map((c) => c.split(' '));
  for (const [url] of candidates) expect(url).toMatch(GENERATED_SIZES);
  expect(Math.max(...candidates.map(([, w]) => parseInt(w)))).toBe(1600);
});

test('the original is scaled down to 2400 px and has no EXIF/GPS', async ({ page, request }) => {
  await page.goto(`/nyheder/${LATEST_ARTICLE.slug}`);
  const photo = page.getByRole('img', { name: PHOTO_IN_BODY.alt });

  // width/height on <img> are the original's dimensions from Strapi
  expect(Number(await photo.getAttribute('width'))).toBe(2400);
  expect(Number(await photo.getAttribute('height'))).toBe(1350);

  const original = (await photo.getAttribute('src'))!.replace('/uploads/xlarge_', '/uploads/');
  const res = await request.get(original);
  expect(res.ok()).toBe(true);
  const bytes = await res.body();
  expect(bytes.includes(Buffer.from('Exif\0\0')), 'the original must not contain EXIF').toBe(false);
});
