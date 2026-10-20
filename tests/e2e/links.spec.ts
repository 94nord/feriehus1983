import { expect, test } from '@playwright/test';
import { LINKS } from '../lib/seed';

test('nyttige links vises i den valgte rækkefølge', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Hovedmenu' }).getByRole('link', { name: 'Nyttige links' }).click();
  await expect(page).toHaveURL('/links');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nyttige links');

  const links = page.locator('.linkliste a');
  await expect(links).toHaveText(LINKS.map((l) => l.titel));
  for (const [i, link] of LINKS.entries()) {
    await expect(links.nth(i)).toHaveAttribute('href', link.url);
  }
});
