import { expect, test } from '@playwright/test';
import { LATEST_ARTICLE, TEST_ARTICLE_COUNT } from '../lib/seed';

const newsList = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Nyheder' });

const isDesktop = () => test.info().project.name === 'desktop';

test('front page shows the latest article and the 10 newest in the list', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nyheder');
  if (isDesktop()) {
    // On mobile the front page is only the list
    await expect(page.getByRole('heading', { level: 2, name: LATEST_ARTICLE.title })).toBeVisible();
  }

  const items = newsList(page).getByRole('listitem');
  await expect(items).toHaveCount(10);
  await expect(items.first()).toContainText(LATEST_ARTICLE.title);
  await expect(items.nth(1)).toContainText(`Testnyhed nummer ${TEST_ARTICLE_COUNT}`);
  await expect(newsList(page)).toContainText('Side 1 af 3');
});

test('pagination moves forward and back', async ({ page }) => {
  await page.goto('/');
  await newsList(page).getByRole('link', { name: 'Næste' }).click();
  await expect(page).toHaveURL(/\?side=2$/);
  await expect(newsList(page)).toContainText('Side 2 af 3');
  await expect(newsList(page).getByRole('listitem').first()).toContainText('Testnyhed nummer 15');

  await newsList(page).getByRole('link', { name: 'Næste' }).click();
  await expect(newsList(page).getByRole('listitem')).toHaveCount(5);
  await expect(newsList(page).getByRole('link', { name: 'Næste' })).toHaveCount(0);

  await newsList(page).getByRole('link', { name: 'Forrige' }).click();
  await expect(page).toHaveURL(/\?side=2$/);
});

test('a page without articles shows a notice', async ({ page }) => {
  await page.goto('/?side=9');
  await expect(newsList(page)).toContainText('Der er ikke flere nyheder');
});

test('an invalid page number returns 404', async ({ page }) => {
  const res = await page.goto('/?side=abc');
  expect(res?.status()).toBe(404);
});

test('clicking an article opens it on its own page', async ({ page }) => {
  await page.goto('/');
  await newsList(page).getByRole('link', { name: /Testnyhed nummer 24/ }).click();
  await expect(page).toHaveURL('/nyheder/testnyhed-24');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Testnyhed nummer 24');
  await expect(page.getByText('Brødtekst for testnyhed 24.')).toBeVisible();
  if (isDesktop()) {
    await expect(newsList(page).getByRole('link', { name: /Testnyhed nummer 24/ })).toHaveAttribute('aria-current', 'page');
  }
  await expect(page).toHaveTitle('Testnyhed nummer 24 · Feriehusforeningen af 1983');
});

test('on mobile the list and the article are separate pages with a link back', async ({ page }) => {
  test.skip(isDesktop(), 'mobile only');
  await page.goto('/?side=2');
  await expect(page.getByRole('main')).toBeHidden();
  await newsList(page).getByRole('link', { name: /Testnyhed nummer 14/ }).click();
  await expect(page).toHaveURL('/nyheder/testnyhed-14?side=2');
  await expect(newsList(page)).toBeHidden();
  await page.getByRole('link', { name: 'Alle nyheder' }).click();
  await expect(page).toHaveURL('/?side=2');
  await expect(newsList(page)).toContainText('Side 2 af 3');
});

test('on desktop there is no link back to the list', async ({ page }) => {
  test.skip(!isDesktop(), 'desktop only');
  await page.goto('/nyheder/testnyhed-24');
  await expect(page.getByRole('link', { name: 'Alle nyheder' })).toBeHidden();
});

test('paging keeps the open article', async ({ page }) => {
  test.skip(!isDesktop(), 'the list is not shown next to the article on mobile');
  await page.goto('/nyheder/testnyhed-24');
  await newsList(page).getByRole('link', { name: 'Næste' }).click();
  await expect(page).toHaveURL('/nyheder/testnyhed-24?side=2');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Testnyhed nummer 24');
});

test('the main image is shown with alt text and several sizes', async ({ page }) => {
  await page.goto(`/nyheder/${LATEST_ARTICLE.slug}`);
  const image = page.getByRole('img', { name: LATEST_ARTICLE.alt });
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('srcset', /\/uploads\/.+ \d+w/);
  expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('body text from the editor keeps its formatting', async ({ page }) => {
  await page.goto(`/nyheder/${LATEST_ARTICLE.slug}`);
  await expect(page.locator('article strong')).toHaveText('ordinær generalforsamling');
  await expect(page.getByRole('heading', { level: 3, name: 'Dagsorden' })).toBeVisible();
  await expect(page.locator('article ol li')).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'kommunen' })).toHaveAttribute('href', 'https://example.com/kommune');
});

test('html in the body is shown as text and not executed', async ({ page }) => {
  await page.goto(`/nyheder/${LATEST_ARTICLE.slug}`);
  await expect(page.getByText('<script>window.__xss = 1</script>')).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
});

test('drafts are not shown', async ({ page }) => {
  await page.goto('/');
  await expect(newsList(page).getByText('Kladde')).toHaveCount(0);
  const res = await page.goto('/nyheder/kladde');
  expect(res?.status()).toBe(404);
});

test('an unknown article returns 404 with a link to the front page', async ({ page }) => {
  const res = await page.goto('/nyheder/findes-ikke');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Siden findes ikke');
  await page.getByRole('link', { name: 'Gå til forsiden' }).click();
  await expect(page).toHaveURL('/');
});
