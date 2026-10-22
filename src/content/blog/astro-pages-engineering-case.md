---
title: "Astro + GitHub Pages 工程实践：从 PR 构建到浏览器验收"
description: "基于 JYC Engineering Lab 公开源码，剖析静态站构建链、权限隔离、Playwright 回归、自动发布与已知工程缺口。"
date: 2026-10-22
kind: engineering-case
verification: source-reviewed
repository: "https://github.com/jyc-work/jyc-work.github.io"
revision: "8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f"
tags: ["Astro", "CI/CD", "GitHub Actions", "Playwright", "Engineering"]
evidence:
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/.github/workflows/pages.yml"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/tests/e2e/mobile.spec.ts"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/src/content.config.ts"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/package.json"
---

## 问题背景：如何避免“本地能打开，线上才发现坏了”

个人技术博客通常从一套静态页面开始。随着项目作品、知识库、代码块、移动菜单、学习进度、技术动态不断增加，风险不再只有页面是否漂亮：修改样式可能让窄屏出现横向滚动；修改文章路由可能出现 404；引入新客户端交互后，原有键盘功能可能失效。

JYC Engineering Lab 是一个实际维护的 Astro 静态项目。它不需要常驻服务端运行博客，但仍需要**发布前的质量门禁**。本文只针对仓库中能找到源码与测试的工程机制做说明，不将“构建成功”误称为“线上所有设备可靠运行”。

研究基线：固定 Commit `8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f`；通过文首证据链接可以查看对应版本，而不是阅读随时变化的默认分支。

## 运行环境与版本边界

仓库使用 Astro、TypeScript、GitHub Actions 和 Playwright。构建工作流配置 Node.js 22，客户端页面以静态产物形式输出到 `dist/`。

在研究版本的 `package.json` 中，Astro 与 Playwright 使用 semver 范围声明，而工作流安装步骤使用 `npm install`。这意味着**依赖版本不一定逐次完全一致**。如果要把构建提升到可审计的发布流水线，应提交锁文件，使用 `npm ci`，并记录生成产物对应的 Commit 与工具链版本。

本篇区分三个层次：
- **静态构建成功**：Astro 类型检查与产物生成完成。
- **浏览器回归通过**：在预设 Chromium 环境里观察到通过的断言。
- **线上发布成功**：GitHub Pages 的 Deploy Job 完成，且公开域名的资源、链接和页面行为经过单独检查。

三者不可互相替代。

## 系统设计：把“检查”与“发布”分开

实际工作流监听 `pull_request`、`push` 与 `workflow_dispatch`，Build Job 同时为 PR 和主分支运行；Deploy Job 则受到事件条件与构建依赖限制。

~~~yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install --no-fund --no-audit
      - run: npm run build
      - run: python3 -m unittest discover -s scripts/tests -v
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
  deploy:
    if: github.event_name != 'pull_request'
    needs: build
~~~

上面的代码为了展示主要控制逻辑而节选，**完整定义以固定 Commit 的源码为准**。特别是部署步骤、产物上传和权限必须一起查看，不能只复制这一段当作可用工作流。

生产上更可靠的策略是把代码审查、依赖验证、浏览器回归、产物上传与部署拆成可追踪阶段；若构建或 E2E 失败，应停止发布，而不是靠人工记忆“发布前别忘了测试”。

## 运行与复现：从本地到 PR

克隆仓库后，在 Node.js 22 环境下执行：

~~~bash
npm install
npm run build
python3 -m unittest discover -s scripts/tests -v
npx playwright install chromium
npm run test:e2e
~~~

浏览器测试使用仓库内 `playwright.config.ts` 的 `webServer` 启动静态站预览，测试请求 localhost 页面。它不会因为线上 GitHub Pages 暂时不可访问就失去全部测试能力。

验收时应保存：代码 SHA、Node/包管理器版本、CI Job 链接、测试用例报告，以及发布后单独检查的站点地址。只有具备这些材料，才能对外说清楚“哪一次发布通过了哪些测试”。

## 浏览器验证：不是对 CSS 做静态检查

在 [Playwright 测试源码](https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/tests/e2e/mobile.spec.ts) 中，真正执行浏览器验证的重点不是断言 CSS 文件存在，而是模拟 320、375、390、430px 视口，逐页检查文档级溢出：

~~~ts
const documentWidth = await page.evaluate(
  () => document.documentElement.scrollWidth
);
expect(documentWidth).toBeLessThanOrEqual(width + 2);
~~~

同一套测试还检查移动导航、Esc 关闭、章节目录、代码复制、减少动画、学习进度的浏览器本地保存，以及技术时间线如何区分模拟与来源记录。

这些测试能捕获已建模的回归，但并不能证明真实 Android/iOS 上所有系统字体、键盘和浏览器版本都表现一致。因此真实设备验收仍是发布前的重要补充。

## 可靠性与安全：静态托管也有控制面

GitHub Actions 的权限应最小化。项目设置了仓库只读权限，部署阶段单独申请 GitHub Pages 所需的 `pages: write` 与 `id-token: write`。不应该把密钥放进浏览器脚本，更不能因为站点是个人项目就忽略 Secret 扫描。

站点的 AI 技术更新流程独立于页面交互：它从上游 GitHub 收集变更，生成待审阅 PR；没有人工审核便不应直接把模型总结发布成“已验证事实”。官网不是运维控制台，前端的终端动画也明确只是模拟效果。

## 局限、改进项与工程准入

这份案例属于**源码审阅级**工程文章：仓库结构、命令、代码与设计边界可核对，但本文没有提供一次新运行的完整测试产物，也没有宣称跨地区网络可访问性或生产级 SLA。

目前可直接确认的工程改进项包括：

1. 使用锁文件与 `npm ci`，减少构建环境漂移。
2. 给工作流增加依赖安全检查、失败产物上传和部署后的健康检查。
3. 将版本化构建产物与提交 SHA 关联，明确回滚过程。
4. 加入真实手机浏览器抽样验收和性能预算。
5. 将内容发布的元数据、证据链接和验证等级纳入 CI 准入检查。

**结论**：工程文章不能只写“搭建 Astro + Pages 教程”，而要交代可追溯的输入、执行过程、断言结果及未覆盖风险。只有这样，网站本身才具有作品集价值。
