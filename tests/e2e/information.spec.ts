import { expect, test } from '@playwright/test';
import { SIDER } from '../lib/seed';

test('Information viser de faste sider sorteret', async ({ page }) => {
  await page.goto('/');
  const menu = page.getByRole('navigation', { name: 'Hovedmenu' });
  await menu.getByRole('link', { name: 'Information' }).click();
  await expect(page).toHaveURL('/information');
  await expect(menu.getByRole('link', { name: 'Information' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.sideliste a')).toHaveText(SIDER.map((s) => s.titel));
});

test('en fast side åbner med indhold og link tilbage', async ({ page }) => {
  await page.goto('/information');
  await page.getByRole('link', { name: 'Ordensregler' }).click();
  await expect(page).toHaveURL('/information/ordensregler');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ordensregler');
  await expect(page.getByText('Tekst om Ordensregler.')).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'Information' }).click();
  await expect(page).toHaveURL('/information');
});

test('kladdesider vises ikke', async ({ page }) => {
  await page.goto('/information');
  await expect(page.getByText('Kladdeside')).toHaveCount(0);
  const res = await page.goto('/information/kladdeside');
  expect(res?.status()).toBe(404);
});
