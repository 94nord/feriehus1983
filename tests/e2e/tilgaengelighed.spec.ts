import { expect, test } from '@playwright/test';
import { SENESTE_NYHED } from '../lib/seed';

const sider = ['/', `/nyheder/${SENESTE_NYHED.slug}`, '/links', '/information', '/information/om-foreningen'];

for (const sti of sider) {
  test(`grundlæggende tilgængelighed på ${sti}`, async ({ page }) => {
    await page.goto(sti);
    await expect(page.locator('html')).toHaveAttribute('lang', 'da');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('main')).toBeVisible();
    for (const img of await page.locator('img').all()) {
      await expect(img).toHaveAttribute('alt');
    }
    const bredde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(bredde, 'siden må ikke kunne scrolles vandret').toBeLessThanOrEqual(0);
  });
}

test('spring over-linket fører til indholdet', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const link = page.getByRole('link', { name: 'Spring til indhold' });
  await expect(link).toBeFocused();
  await link.press('Enter');
  await expect(page).toHaveURL(/#indhold$/);
});
