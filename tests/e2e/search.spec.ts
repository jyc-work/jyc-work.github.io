import { test, expect } from '@playwright/test';

test('site search loads the index, filters results, and clears the query', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto('/search/');

  await expect(page.locator('h1')).toContainText('站内搜索');
  const input = page.getByRole('searchbox', { name: '输入关键词' });
  await expect(input).toBeVisible();
  await expect(page.locator('#search-result-count')).toContainText('条可搜索内容');

  await input.fill('Kafka');
  const matchingResult = page.locator('.search-result-item').filter({ hasText: 'Kafka' }).first();
  await expect(matchingResult).toBeVisible();
  await expect(page.locator('#search-result-count')).toContainText('条结果');

  await input.fill('search-term-that-does-not-exist-xyz');
  await expect(page.getByRole('status')).toContainText('没有找到与');

  await page.getByRole('button', { name: '清空搜索关键词' }).click();
  await expect(input).toHaveValue('');
  await expect(page.getByRole('status')).toContainText('输入关键词开始搜索。');
});

test('search results stay within a narrow mobile viewport', async ({ page }) => {
  const width = 320;
  await page.setViewportSize({ width, height: 760 });
  await page.goto('/search/');
  await page.getByRole('searchbox', { name: '输入关键词' }).fill('Agent');
  await expect(page.locator('.search-result-item').first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 2);
});
