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
  await page.goto('/blog/astro-pages-engineering-case/');
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
  const duration=await page.locator('.cyber-scanline').evaluate(el=>getComputedStyle(el).animationDuration);
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
  await expect(page.getByText('工程流程示例')).toBeVisible();
  await expect(page.getByText('RUN_ID : DEMO-001')).toHaveCount(0);
  await expect(page.getByText('本地演示 · 无实时服务器连接')).toHaveCount(0);
  await expect(page.getByText('INDEPENDENT ENGINEERING JOURNAL')).toHaveCount(0);
  await expect(page.locator('.night-city-signal')).toHaveCount(0);
  await expect(page.locator('.site-footer a[href="/rss.xml"]')).toHaveCount(0);
  await expect(page.locator('#cyber-runtime-lines > div')).toHaveCount(6);
  await expect(page.locator('.hero-telemetry')).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
  const palette = await page.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--neon-primary').trim());
  expect(palette).toBe('#50ddff');
});

test('cyberpunk visual FX respects reduced-motion OS preference',async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:320,height:780});
  await page.goto('/');
  await expect(page.getByRole('button',{name:'切换动态视觉特效'})).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('html')).toHaveClass(/fx-off/);
  await expect(page.locator('#cyber-runtime-lines > div')).toHaveCount(6);
});


test('learning progress self-check persists across refresh and dashboard updates',async({page})=>{
  await page.setViewportSize({width:375,height:780});
  await page.goto('/learning/');
  await expect(page.locator('#learning-progress-total')).toHaveText('0 / 20');
  await page.goto('/learning/agent-engineering/');
  const checkbox=page.getByRole('checkbox',{name:'标记阶段 01完成'});
  await checkbox.check();
  await expect(page.locator('.learning-progress-panel [data-progress-label]')).toHaveText('1 / 4 阶段');
  await page.reload();
  await expect(checkbox).toBeChecked();
  await page.goto('/learning/');
  await expect(page.locator('#learning-progress-total')).toHaveText('1 / 20');
  await expect(page.locator('[data-progress-slug="agent-engineering"] [data-progress-label]')).toHaveText('1 / 4 阶段');
});

test('learning progress backup import updates aggregate while excluding unknown tracks',async({page})=>{
  await page.setViewportSize({width:390,height:780});
  await page.goto('/learning/');
  await page.locator('#learning-import').setInputFiles({
    name:'backup.json',mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify({version:1,progress:{'java-backend':[0,2],'unknown-track':[0,1,2]}}))
  });
  await expect(page.locator('#learning-progress-total')).toHaveText('2 / 20');
  await expect(page.locator('#learning-storage-status')).toContainText('已从备份导入');
  await page.goto('/learning/java-backend/');
  await expect(page.getByRole('checkbox',{name:'标记阶段 01完成'})).toBeChecked();
  await expect(page.getByRole('checkbox',{name:'标记阶段 03完成'})).toBeChecked();
  await expect(page.getByRole('checkbox',{name:'标记阶段 02完成'})).not.toBeChecked();
});

test('technology timeline clearly distinguishes empty upstream history from live public commits',async({page})=>{
  await page.setViewportSize({width:430,height:780});
  await page.route('https://api.github.com/repos/jyc-work/jyc-work.github.io/commits?per_page=5',async route=>{
    const sha='c'.repeat(40);
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([
      {sha,html_url:`https://github.com/jyc-work/jyc-work.github.io/commit/${sha}`,commit:{message:'docs: improve engineering knowledge base',committer:{date:'2026-10-22T09:00:00Z'}}}
    ])});
  });
  await page.goto('/updates/');
  await expect(page.getByText('尚无已发布的上游变化记录')).toBeVisible();
  await page.getByRole('button',{name:'获取最新公开提交'}).click();
  await expect(page.locator('#site-commits')).toContainText('docs: improve engineering knowledge base');
  await expect(page.locator('#site-commits a')).toHaveAttribute('href',/github.com\/jyc-work\/jyc-work.github.io\/commit\//);
});

test('night-city palette and original skyline are present',async ({page})=>{
  await page.setViewportSize({width:390,height:780});
  await page.goto('/');
  const sky=page.locator('.night-city-art');
  await expect(sky).toBeVisible();
  const style=await sky.evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(style).toContain('/night-city-skyline.svg');
  const cssValues=await page.locator('html').evaluate(el=>({
    main:getComputedStyle(el).getPropertyValue('--neon-primary').trim(),
    secondary:getComputedStyle(el).getPropertyValue('--neon-pink').trim()
  }));
  expect(cssValues.main).toBe('#50ddff');
  expect(cssValues.secondary).toBe('#ff4fab');
  await expect(page.locator('.hero-telemetry')).toHaveCount(0);
});

test('Chinese home and navigation do not show decorative English fragments', async ({page}) => {
  await page.setViewportSize({width:375,height:780});
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('让代码成为证据');
  await expect(page.getByRole('button',{name:'切换动态视觉特效'})).toContainText('动效');
  for(const str of ['Selected Projects','Field Notes','LEARNING PATHS','TECH WATCH','SYSTEM READY','JYC / NETWORK','INDEPENDENT ENGINEERING JOURNAL']) {
    await expect(page.getByText(str,{exact:false})).toHaveCount(0);
  }
  await page.goto('/blog/');
  await expect(page.locator('.listing-meta')).toContainText('篇文章');
  await expect(page.locator('.listing-meta a[href="/rss.xml"]')).toHaveCount(0);
});


test('Chinese and English home are reciprocal with canonical language metadata',async({page})=>{
  await page.setViewportSize({width:375,height:780});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href','https://jyc-work.github.io/en/');
  await page.getByRole('link',{name:'View the English version'}).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('h1')).toContainText('Engineering');
  await page.getByRole('button',{name:'Open navigation menu'}).click();
  await expect(page.getByRole('navigation',{name:'Main navigation'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation',{name:'Main navigation'})).toBeHidden();
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute('title','JYC Technical Blog RSS');
  await page.getByRole('link',{name:'Read in Chinese'}).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
});

test('English articles have public evidence, localized TOC, working copy, and real Chinese counterparts',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.setViewportSize({width:390,height:780});
  await page.goto('/en/articles/');
  await expect(page.locator('.article-row')).toHaveCount(2);
  await page.locator('.article-row').first().click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.getByText('Verification:',{exact:false}).first()).toBeVisible();
  await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute('href',/\/blog\//);
  const toc=page.locator('.mobile-reading-toc');
  await expect(toc).toBeVisible();
  await toc.locator('summary').click();
  await expect(toc.locator('summary')).toContainText('Contents');
  const copy=page.getByRole('button',{name:'Copy code'}).first();
  await copy.click();
  await expect(copy).toHaveText('Copied');
  await page.getByRole('link',{name:'Read in Chinese'}).click();
  await expect(page).toHaveURL(/\/blog\/(astro-pages-engineering-case|playwright-mobile-regression)\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
});

for(const width of [320,375,390,430]){
  test('English routes do not overflow at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:760});
    for(const route of ['/en/','/en/articles/','/en/projects/','/en/projects/jyc-engineering-lab/','/en/articles/astro-pages-engineering-case/','/en/articles/playwright-mobile-regression/']){
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang','en');
      const actual=await page.evaluate(()=>document.documentElement.scrollWidth);
      expect(actual, 'overflow at '+route+' in '+width+'px').toBeLessThanOrEqual(width+2);
    }
  });
}

test('No misleading English version switch on untranslated Chinese pages',async({page})=>{
  await page.goto('/learning/');
  await expect(page.locator('.lang-switch')).toHaveCount(0);
  await page.goto('/en/projects/jyc-engineering-lab/');
  await expect(page.getByRole('link',{name:'Read in Chinese'})).toHaveAttribute('href','/projects/jyc-engineering-lab/');
  await expect(page.getByRole('navigation',{name:'Main navigation'})).toBeVisible();
});
