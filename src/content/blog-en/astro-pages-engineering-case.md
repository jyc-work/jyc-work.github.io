---
title: "Engineering a Static Blog: CI, Deployment Boundaries, and Browser Evidence"
description: "A source-reviewed case study of the JYC Astro site, covering GitHub Pages automation, Playwright regression tests, reproducibility, and the gaps that remain."
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

## Problem: local success is not release evidence

A static technical blog looks simple at first: compile content into HTML, publish the generated files, and let a CDN serve them. As the site grows to include projects, long-form articles, code-copy controls, responsive navigation, learning progress, and data-driven timelines, a successful local preview is no longer enough.

A CSS change can introduce horizontal scrolling on narrow screens. A route change can leave an internal link pointing at a missing page. A client-side interaction can work with a mouse but fail for keyboard users. A deployment can also publish an artifact that was not built from the commit reviewers inspected.

The engineering question is therefore not merely how to publish an Astro site. It is how to make each release traceable to source, subject it to repeatable checks, and state clearly what those checks do not prove.

This article reviews the JYC Engineering Lab repository at the pinned revision `8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f`. It is a source review of the implementation and test definitions, not a claim that every scenario was independently re-executed for this article.

## Environment and version boundaries

The project uses Astro, TypeScript, GitHub Actions, and Playwright. The site is configured for static output, so the published blog does not require a permanently running application server. The workflow uses Node.js 22, builds the static site, runs the editorial quality gate and Python unit tests, installs Chromium, and executes browser-level regression tests before a deployment artifact can be produced.

The reviewed package manifest uses semver ranges, and the workflow uses `npm install`. That leaves room for dependency resolution to change over time. For stronger reproducibility, commit the package lockfile, switch CI to `npm ci`, and retain the toolchain versions and artifact digest alongside the commit SHA.

Three results must remain distinct:

- **Build passed:** Astro checks and generates the static output.
- **Browser tests passed:** the defined assertions passed in the configured Chromium environment.
- **Deployment verified:** the Pages deployment completed and the public site was checked independently.

One result does not imply the next. A green build cannot prove that every external API is available or that a real phone renders every page correctly.

## Design: separate validation from deployment

The workflow responds to pull requests targeting `main`, pushes to `main`, and manual dispatches. Pull requests run the build and test sequence without deploying. Deployment depends on a successful build and is restricted to non-pull-request events.

The following excerpt illustrates the control flow; it is intentionally shortened. The pinned workflow is the authoritative definition of permissions, artifact upload, and deployment steps.

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
      - run: python3 scripts/blog_quality.py
      - run: npm run build
      - run: python3 -m unittest discover -s scripts/tests -v
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
  deploy:
    if: github.event_name != 'pull_request'
    needs: build
~~~

This arrangement creates a practical release boundary: an article or UI change can be reviewed against automated feedback before it reaches the public site. It also avoids granting pull-request code the deployment path used by the main branch.

## Reproduction

Use Node.js 22 and Python 3.11 or newer. From a clean checkout, the core checks are:

~~~bash
npm install
python3 scripts/blog_quality.py
npm run build
python3 -m unittest discover -s scripts/tests -v
npx playwright install chromium
npm run test:e2e
~~~

The GitHub workflow installs Chromium system dependencies with `--with-deps`. On a Linux machine, that is the safer equivalent when the browser package or its shared libraries are missing.

For an auditable release, record the full commit SHA, resolved dependency versions, workflow run URL, test exit codes, and the Pages deployment result. If a test fails, preserve the trace and screenshot before changing the code; otherwise the failure may be fixed without leaving evidence of the original defect.

## Verification: what the browser suite can establish

The Playwright suite checks several viewport widths, navigates primary routes, and asserts that the document does not exceed the viewport width beyond a small rendering tolerance. It also exercises interactions such as mobile navigation, Escape-to-close behavior, code copying, reading navigation, and local learning-progress persistence.

A representative assertion measures the rendered document rather than checking whether a CSS rule exists:

~~~ts
const documentWidth = await page.evaluate(
  () => document.documentElement.scrollWidth
);
expect(documentWidth).toBeLessThanOrEqual(width + 2);
~~~

This is valuable because the user-visible behavior is the contract. A stylesheet can contain a responsive media query and still produce overflow due to a long token, an oversized grid item, or an absolutely positioned element.

The suite remains a finite set of checks. It does not prove correctness on every operating system, browser engine, font configuration, or screen size. Mocked API responses verify UI behavior against controlled data; they do not establish that the upstream service is currently reachable.

## Limitations and next steps

This case study is marked **source-reviewed**. The repository and test definitions are directly inspectable at the pinned revision, but the article does not attach a new, independent execution report for every claim. The verification level must not be upgraded without the corresponding artifacts.

The highest-value improvements are:

1. Commit and enforce the dependency lockfile, then use `npm ci`.
2. Upload Playwright traces, screenshots, and machine-readable test reports when a job fails.
3. Attach the artifact digest and source SHA to each release.
4. Add post-deployment checks for canonical URLs, key routes, and static assets.
5. Expand browser coverage only where the additional browser engine or real-device test addresses a known risk.
6. Document a tested rollback procedure rather than treating redeployment as a rollback plan.

The central engineering lesson is simple: publishing is a pipeline, not a button. The pipeline becomes trustworthy when inputs are pinned, gates are explicit, evidence is retained, and uncovered risks remain visible.
