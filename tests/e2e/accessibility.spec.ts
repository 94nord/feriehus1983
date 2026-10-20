import { expect, test } from '@playwright/test';
import { LATEST_ARTICLE } from '../lib/seed';

const paths = ['/', `/nyheder/${LATEST_ARTICLE.slug}`, '/links', '/information', '/information/om-foreningen'];

for (const path of paths) {
  test(`basic accessibility on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'da');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    // On mobile the front page shows only the news list, not <main>
    const mobileFrontPage = path === '/' && test.info().project.name === 'mobile';
    await expect(mobileFrontPage ? page.locator('#news-list') : page.getByRole('main')).toBeVisible();
    for (const img of await page.locator('img').all()) {
      await expect(img).toHaveAttribute('alt');
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'the page must not scroll horizontally').toBeLessThanOrEqual(0);
  });
}

test('the skip link leads to the content', async ({ page }) => {
  await page.goto('/information');
  await page.keyboard.press('Tab');
  const link = page.getByRole('link', { name: 'Spring til indhold' });
  await expect(link).toBeFocused();
  await link.press('Enter');
  await expect(page).toHaveURL(/#content$/);
});

test('on the front page the skip link leads to the news list', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.getByRole('link', { name: 'Spring til indhold' }).press('Enter');
  await expect(page).toHaveURL(/#news-list$/);
  await expect(page.locator('#news-list')).toBeVisible();
});
