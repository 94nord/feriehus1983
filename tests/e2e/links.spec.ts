import { expect, test } from '@playwright/test';
import { LINKS } from '../lib/seed';

test('useful links are shown in the chosen order', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Hovedmenu' }).getByRole('link', { name: 'Nyttige links' }).click();
  await expect(page).toHaveURL('/links');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nyttige links');

  const links = page.locator('.link-list a');
  await expect(links).toHaveText(LINKS.map((l) => l.title));
  for (const [i, link] of LINKS.entries()) {
    await expect(links.nth(i)).toHaveAttribute('href', link.url);
  }
});
