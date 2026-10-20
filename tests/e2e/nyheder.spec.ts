import { expect, test } from '@playwright/test';
import { ANTAL_TESTNYHEDER, SENESTE_NYHED } from '../lib/seed';

const nyhedsliste = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Nyheder' });

test('forsiden viser den nyeste nyhed og de 10 nyeste i listen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(SENESTE_NYHED.titel);

  const elementer = nyhedsliste(page).getByRole('listitem');
  await expect(elementer).toHaveCount(10);
  await expect(elementer.first()).toContainText(SENESTE_NYHED.titel);
  await expect(elementer.nth(1)).toContainText(`Testnyhed nummer ${ANTAL_TESTNYHEDER}`);
  await expect(nyhedsliste(page)).toContainText('Side 1 af 3');
});

test('pagination går frem og tilbage', async ({ page }) => {
  await page.goto('/');
  await nyhedsliste(page).getByRole('link', { name: 'Næste' }).click();
  await expect(page).toHaveURL(/\?side=2$/);
  await expect(nyhedsliste(page)).toContainText('Side 2 af 3');
  await expect(nyhedsliste(page).getByRole('listitem').first()).toContainText('Testnyhed nummer 15');

  await nyhedsliste(page).getByRole('link', { name: 'Næste' }).click();
  await expect(nyhedsliste(page).getByRole('listitem')).toHaveCount(5);
  await expect(nyhedsliste(page).getByRole('link', { name: 'Næste' })).toHaveCount(0);

  await nyhedsliste(page).getByRole('link', { name: 'Forrige' }).click();
  await expect(page).toHaveURL(/\?side=2$/);
});

test('en side uden nyheder viser en besked', async ({ page }) => {
  await page.goto('/?side=9');
  await expect(nyhedsliste(page)).toContainText('Der er ikke flere nyheder');
});

test('ugyldigt sidenummer giver 404', async ({ page }) => {
  const res = await page.goto('/?side=abc');
  expect(res?.status()).toBe(404);
});

test('klik på en nyhed åbner den på sin egen side', async ({ page }) => {
  await page.goto('/');
  await nyhedsliste(page).getByRole('link', { name: /Testnyhed nummer 24/ }).click();
  await expect(page).toHaveURL('/nyheder/testnyhed-24');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Testnyhed nummer 24');
  await expect(page.getByText('Brødtekst for testnyhed 24.')).toBeVisible();
  await expect(nyhedsliste(page).getByRole('link', { name: /Testnyhed nummer 24/ })).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveTitle('Testnyhed nummer 24 · Feriehusforeningen af 1983');
});

test('bladring bevarer den åbne nyhed', async ({ page }) => {
  await page.goto('/nyheder/testnyhed-24');
  await nyhedsliste(page).getByRole('link', { name: 'Næste' }).click();
  await expect(page).toHaveURL('/nyheder/testnyhed-24?side=2');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Testnyhed nummer 24');
});

test('hovedbilledet vises med alt-tekst og flere størrelser', async ({ page }) => {
  await page.goto(`/nyheder/${SENESTE_NYHED.slug}`);
  const billede = page.getByRole('img', { name: SENESTE_NYHED.alt });
  await expect(billede).toBeVisible();
  await expect(billede).toHaveAttribute('srcset', /\/uploads\/.+ \d+w/);
  expect(await billede.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('brødtekst fra editoren vises med formatering', async ({ page }) => {
  await page.goto(`/nyheder/${SENESTE_NYHED.slug}`);
  await expect(page.locator('article strong')).toHaveText('ordinær generalforsamling');
  await expect(page.getByRole('heading', { level: 3, name: 'Dagsorden' })).toBeVisible();
  await expect(page.locator('article ol li')).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'kommunen' })).toHaveAttribute('href', 'https://example.com/kommune');
});

test('html i brødteksten vises som tekst og køres ikke', async ({ page }) => {
  await page.goto(`/nyheder/${SENESTE_NYHED.slug}`);
  await expect(page.getByText('<script>window.__xss = 1</script>')).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
});

test('kladder vises ikke', async ({ page }) => {
  await page.goto('/');
  await expect(nyhedsliste(page).getByText('Kladde')).toHaveCount(0);
  const res = await page.goto('/nyheder/kladde');
  expect(res?.status()).toBe(404);
});

test('ukendt nyhed giver 404 med link til forsiden', async ({ page }) => {
  const res = await page.goto('/nyheder/findes-ikke');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Siden findes ikke');
  await page.getByRole('link', { name: 'Gå til forsiden' }).click();
  await expect(page).toHaveURL('/');
});
