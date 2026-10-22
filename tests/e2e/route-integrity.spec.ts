import { test, expect } from '@playwright/test';

test('sitemap lists primary routes and every listed page responds successfully', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  const links = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  expect(links.length).toBeGreaterThan(0);
  expect(links).toContain('https://jyc-work.github.io/search/');
  expect(links).toContain('https://jyc-work.github.io/updates/');
  expect(new Set(links).size).toBe(links.length);

  const paths = links.map(href => {
    const url = new URL(href);
    expect(url.origin).toBe('https://jyc-work.github.io');
    return url.pathname;
  });

  const responses = await Promise.all(paths.map(async path => {
    const response = await request.get(path);
    return { path, status: response.status() };
  }));
  expect(responses.filter(response => response.status !== 200)).toEqual([]);
});

test('every search result points to a generated, reachable detail page', async ({ request }) => {
  const response = await request.get('/search-index.json');
  expect(response.status()).toBe(200);
  const data: unknown = await response.json();
  expect(Array.isArray(data)).toBe(true);

  const links = (data as Array<{ url: string }>).map(item => item.url);
  expect(links.length).toBeGreaterThan(0);
  const uniquePaths = [...new Set(links)];
  expect(uniquePaths.every(path => /^\/(?!\/)[^?#]*\/$/.test(path))).toBe(true);

  const responses = await Promise.all(uniquePaths.map(async path => {
    const detail = await request.get(path);
    return { path, status: detail.status() };
  }));
  expect(responses.filter(result => result.status !== 200)).toEqual([]);
});

test('site-wide search link opens the real search UI instead of the generic 404 page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '搜索文章' }).click();
  await expect(page).toHaveURL(/\/search\/$/);
  await expect(page.getByRole('searchbox', { name: '输入关键词' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '站内搜索.' })).toBeVisible();
  await expect(page.getByText('没有找到这个页面')).toHaveCount(0);
});
