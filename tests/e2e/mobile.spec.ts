import { test, expect } from '@playwright/test';

const widths = [320, 375, 390, 430];
const paths = ['/', '/blog/', '/knowledge/', '/learning/', '/projects/', '/commands/', '/updates/', '/search/'];

for (const width of widths) {
  test(`all primary routes have no document-level overflow at ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height: 760});
    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth, `Unexpected horizontal overflow on ${path} at ${width}px`).toBeLessThanOrEqual(width+2);
    }
  });
}

test('mobile navigation opens, closes by Escape and follows link', async ({page}) => {
  await page.setViewportSize({width: 375, height: 780});
  await page.goto('/');
  const toggle = page.getByRole('button', {name: '打开导航菜单'});
  const nav = page.getByRole('navigation', {name: '主导航'});
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(page.getByRole('button', {name: '关闭导航菜单'})).toHaveAttribute('aria-expanded','true');
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', {name: '学习路线'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await toggle.click();
  await nav.getByRole('link', {name: '技术文章'}).click();
  await expect(page).toHaveURL(/\/blog\/$/);
});

test('desktop navigation stays visible with mobile toggle hidden',async ({page})=>{
  await page.setViewportSize({width: 1280, height: 800});
  await page.goto('/');
  await expect(page.getByRole('navigation',{name:'主导航'})).toBeVisible();
  await expect(page.getByRole('button',{name:'打开导航菜单'})).toBeHidden();
});

test('article toc, code copy and back-to-top work on small mobile viewport', async ({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.setViewportSize({width: 320, height: 680});
  await page.goto('/blog/agent-loop-reliability/');
  const toc = page.locator('.mobile-reading-toc');
  await expect(toc).toBeVisible();
  await toc.locator('summary').click();
  await expect(toc.locator('nav')).toBeVisible();
  const firstAnchor = toc.locator('nav a').first();
  await firstAnchor.click();
  await expect(toc).not.toHaveAttribute('open', '');
  const copy = page.getByRole('button',{name:'复制代码'}).first();
  await expect(copy).toBeVisible();
  await copy.click();
  await expect(copy).toContainText('已复制');
  await page.evaluate(() => window.scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
  const back = page.getByRole('button',{name:'返回顶部'});
  await expect(back).toBeVisible();
  await back.click();
  await expect.poll(()=>page.evaluate(()=>window.scrollY),{timeout:8000}).toBeLessThan(10);
});

test('reduced motion preference is respected', async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:780});
  await page.goto('/');
  const duration=await page.locator('.cursor').evaluate(el=>getComputedStyle(el).animationDuration);
  expect(Number.parseFloat(duration)).toBeLessThan(0.01);
});


test('cyberpunk home FX can be toggled and persists across navigation', async ({page})=>{
  await page.setViewportSize({width:375,height:780});
  await page.goto('/');
  const fx=page.getByRole('button',{name:'切换动态视觉特效'});
  await expect(fx).toBeVisible();
  await expect(fx).toHaveAttribute('aria-pressed','true');
  await fx.click();
  await expect(fx).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('html')).toHaveClass(/fx-off/);
  await page.goto('/blog/');
  await expect(page.locator('html')).toHaveClass(/fx-off/);
  await page.goto('/');
  await fx.click();
  await expect(fx).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('html')).not.toHaveClass(/fx-off/);
});

test('home runtime is explicitly simulated, and displays browser-local time', async ({page})=>{
  await page.setViewportSize({width:390,height:780});
  await page.goto('/');
  await expect(page.getByText('STATUS : SIMULATED')).toBeVisible();
  await expect(page.locator('#cyber-runtime-lines > div')).toHaveCount(6);
  await expect(page.locator('#hud-local-clock')).toHaveText(/^[0-2][0-9]:[0-5][0-9]$/);
  await expect(page.locator('h1')).toBeVisible();
  const palette = await page.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--neon-yellow').trim());
  expect(palette).toBe('#f3e600');
});

test('cyberpunk visual FX respects reduced-motion OS preference',async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:320,height:780});
  await page.goto('/');
  await expect(page.getByRole('button',{name:'切换动态视觉特效'})).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('html')).toHaveClass(/fx-off/);
  await expect(page.locator('#cyber-runtime-lines > div')).toHaveCount(6);
});
