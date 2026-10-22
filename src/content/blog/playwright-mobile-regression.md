---
title: "移动端回归测试实战：如何让设计改版不破坏技术博客"
description: "基于 JYC 网站的 Playwright 测试源码，从横向溢出、语义导航、剪贴板到状态持久化，设计可执行的 UI 验收合同。"
date: 2026-10-22
kind: engineering-case
verification: source-reviewed
repository: "https://github.com/jyc-work/jyc-work.github.io"
revision: "8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f"
tags: ["Playwright", "Frontend", "TypeScript", "Accessibility", "Regression"]
evidence:
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/tests/e2e/mobile.spec.ts"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/src/styles/mobile.css"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/src/layouts/Base.astro"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/playwright.config.ts"
---

## 问题背景：视觉改版为何容易引入功能回归

技术网站在反复调整首页配色、霓虹背景与响应式布局时，容易只凭桌面浏览器外观判断是否完成。实际上很多缺陷发生在更窄的视口，例如导航换行、弹层遮挡、代码片段撑破容器、键盘焦点丢失和目录跳转失效。

单纯给样式增加几个 `@media` 规则并不是验收依据。JYC Engineering Lab 的测试以**浏览器观察到的结果**为判断对象，不直接依赖选择器是否“看起来写对了”。本文解读基线提交 `8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f` 的源文件和测试合同，不把这些测试推广为所有移动设备都已验证。

## 测试环境与版本界定

项目采用 Astro 静态站、TypeScript 与 Playwright。Chromium 冒烟测试由 GitHub Actions 在 Node.js 22 的构建之后执行。Playwright 通过 `webServer` 启动站点预览，因此断言作用于已经生成的 HTML/JS/CSS 产物，而不只是孤立的组件函数。

在本地复现时：

~~~bash
npm install
npm run build
npx playwright install chromium
npm run test:e2e
~~~

如果目标环境缺少系统依赖，应参照 GitHub 工作流中 `npx playwright install --with-deps chromium` 的安装策略。仓库的依赖版本为 semver 范围，因此需要同时保留当次测试解析得到的实际版本；仅知道命令相同不保证环境严格一致。

## 验收设计：将布局、操作和状态拆开

浏览器测试首先覆盖 320、375、390、430px 四类典型窄屏宽度，再逐一打开首页、技术文章、项目、学习路线、知识库、命令手册、技术动态与搜索页。

~~~ts
for (const width of [320, 375, 390, 430]) {
  test(`no document-level overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 760 });
    // 实际源码还会遍历每个主导航路由。
    await page.goto('/');
    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    expect(documentWidth).toBeLessThanOrEqual(width + 2);
  });
}
~~~

这里给 2px 的容差用于避免环境中的细小舍入差异，但它不是对所有溢出的放行条件：组件内可横向滚动的代码块需要明确承担滚动责任，页面主体不能因此出现全站水平滚动。

与之相对，桌面端测试会明确断言导航栏可见、手机菜单按钮隐藏。这防止了为了修复手机体验而破坏桌面主导航。

## 功能复现：用角色选择器测试交互合同

在 [移动端测试文件](https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/tests/e2e/mobile.spec.ts) 中，导航功能覆盖了打开、Esc 关闭、重新打开、点击导航链接和实际路径变化。

~~~ts
const nav = page.getByRole('navigation', { name: '主导航' });
const toggle = page.getByRole('button', { name: '打开导航菜单' });
await expect(nav).toBeHidden();
await toggle.click();
await expect(nav).toBeVisible();
await page.keyboard.press('Escape');
await expect(nav).toBeHidden();
~~~

使用 `getByRole` 而不是依赖样式内部类名，可以让测试贴近用户实际可访问的交互语义。如果标签或 `aria-label` 被改坏，测试也会失败；这正是有价值的回归信号。

文章页的折叠目录使用原生 `details/summary`；点击锚点后收起。代码块复制测试申请剪贴板权限，再检查点击后的反馈文字。返回顶部测试先滚动到页面末尾，再等待滚动位置回到近似 0，而不是仅仅断言页面存在一个按钮。

## 状态验证：刷新与导入导出不是同一问题

站点的学习路线允许在浏览器内自评阶段完成度，使用 `localStorage` 保存。测试包含刷新后持久化和聚合统计，另外覆盖导入 JSON 文件时忽略未知路线的逻辑。

这些功能存在明显边界：浏览器内自评不是服务器验证的课程证书，跨设备也不会自动同步；JSON 备份需要用户自主导出导入。若将来引入登录系统，就必须重新评估隐私、安全和服务端接口的权限测试。

技术动态页面另有测试：拦截公开 GitHub API 并返回确定性的模拟 Commit，用以确认 UI 能展示来源链接。**Mock API 测试验证的是前端渲染，不代表 GitHub API 在公网中的实时可用性。**

## 验证证据与故障诊断方式

本案例的直接证据包含四个仓库文件：测试定义、移动端样式、基础布局及 Playwright 配置。人工复核可以按这些步骤执行：

1. 固定提交版本并记录浏览器版本。
2. 本地运行构建与浏览器测试，保存完整命令和退出码。
3. 注入一个非预期的固定宽度卡片，确认水平溢出断言失败。
4. 将移动导航的 `aria-label` 修改为不匹配的字符串，确认角色定位失败。
5. 还原改动，重新运行整套测试并归档结果。

这是**建议的故障注入复现流程**。没有附带本次注入的完整执行日志时，不能把第 3、4 步写成已完成的生产缺陷演练。

## 局限与下一阶段

当前测试为 Chromium 中的视口模拟，并不是 Android/iOS 实机设备矩阵。屏幕尺寸无法覆盖所有安全区、字体渲染和浏览器输入行为。缺少真实设备回归、对比截图审批、性能预算与多浏览器兼容性检查时，应该在发布说明中保留这些限制。

进阶改进包括：采集失败截图与 Trace 到 CI Artifacts；增加 WebKit/Firefox；引入可访问性审计与性能预算；为关键内容页面设定稳定布局契约；在 PR 报告中列出新增与已知缺口。

工程价值不在于写了多少条 CSS，而在于建立了一组可以持续运行的断言，使未来视觉升级不再只依赖主观判断。
