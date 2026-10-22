---
title: "Mobile Regression Testing for a Technical Website: An Evidence-Based Playwright Case"
description: "Designing browser-level contracts for responsive layout, navigation, clipboard behavior, reduced motion, and state persistence."
date: 2026-10-22
kind: engineering-case
verification: source-reviewed
repository: "https://github.com/jyc-work/jyc-work.github.io"
revision: "8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f"
zhSlug: "playwright-mobile-regression"
tags: ["Playwright", "TypeScript", "Accessibility", "Testing", "Frontend"]
evidence:
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/tests/e2e/mobile.spec.ts"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/src/styles/mobile.css"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/src/layouts/Base.astro"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/playwright.config.ts"
---

## Problem: visual approval does not imply functional correctness

A cyberpunk-inspired interface can pass a screenshot review and still fail in use. Typical regressions include horizontal scrolling caused by a fixed-width panel, a navigation menu that traps keyboard focus, an unreadable code block, and interface state that disappears on refresh.

JYC Engineering Lab evolves through pull requests that touch CSS, templates, and client-side scripts. The goal of browser testing is to create a limited but repeatable **behavioral contract** that survives visual redesign.

The claims here are based on the pinned repository revision. **Verification level: source-reviewed.** The article explains observable assertions; it does not assert that every physical mobile device has passed.

## Environment and test boundary

The website is built with Astro and TypeScript. Playwright runs browser checks against the generated static preview using Chromium. The established suite covers document widths of 320, 375, 390, and 430 CSS pixels.

To reproduce the suite with the matching source revision, prepare Node.js 22 and run:

~~~bash
npm install
npm run build
npx playwright install chromium
npm run test:e2e
~~~

In CI, the browser installation also includes operating-system dependencies. Test execution and site publication are different workflow stages; failing a test should block publication, not merely produce a warning.

The pinned `playwright.config.ts` is the reference for web-server launch and test settings. Report the exact browser version and dependency resolution when publishing an observed result.

## Design: test user outcomes, not implementation decorations

A mobile layout should not force users to scroll the entire document horizontally. The test reads the document width after navigating to a page:

~~~ts
await page.setViewportSize({ width: 375, height: 760 });
await page.goto('/blog/');

const actual = await page.evaluate(
  () => document.documentElement.scrollWidth
);
expect(actual).toBeLessThanOrEqual(377);
~~~

The small tolerance allows for browser rounding. It should not be used to excuse an actually truncated control or a code block that expands the viewport.

This contract is intentionally independent of specific card shadows, accent colors, and decorative panels. A visual redesign should be possible without rewriting the entire test suite.

Desktop navigation is tested separately. When adapting the site for mobile, a developer must not accidentally hide the navigation at desktop widths.

## Navigation, keyboard controls, and semantics

The mobile menu is selected by accessible role and name, rather than a fragile style class. Its behavior includes opening, closing with Escape, and following a real link to the intended route.

~~~ts
const nav = page.getByRole('navigation', { name: '主导航' });
const toggle = page.getByRole('button', { name: '打开导航菜单' });

await expect(nav).toBeHidden();
await toggle.click();
await expect(nav).toBeVisible();
await page.keyboard.press('Escape');
await expect(nav).toBeHidden();
~~~

The Chinese accessible names above are sourced from the actual Chinese application under test; the commands have not been cosmetically translated into unexecutable pseudo-code.

Role-based assertions help catch regressions where a button remains visually clickable but loses its accessible label. They do not replace a complete accessibility audit involving screen readers, contrast, and multiple input methods.

## Reading tools and local state

The reading interface uses native disclosure controls for its mobile table of contents. The browser test opens the table of contents, follows an anchor, and checks that the disclosure closes.

Copy-code behavior requires a browser clipboard permission in the test. A passing click test should check the resulting state, not only the presence of a button.

The website also offers local progress self-assessment for learning paths. Tests check persistence across refresh and allow importing a JSON backup. These are **local-browser features**: they are not a user account, a server-side learning record, or cross-device synchronization.

A separate technology timeline test mocks a public GitHub API response. Mocked API behavior verifies how the UI renders structured commit information. It does **not** establish upstream availability or the authenticity of a live commit at test time.

## Reproduction and failure injection

To assess test sensitivity, a reviewer can intentionally inject regressions in an isolated branch:

1. Add a fixed-width panel wider than the 320-pixel viewport.
2. Change the mobile-menu accessible name while retaining the visual icon.
3. Remove the code-copy feedback state.
4. Disable state restoration after reloading a learning-path page.
5. Re-run the Playwright suite and compare failures against the expected contract.

These are proposed reproduction exercises. This article does not claim they were executed or that the resulting logs have been archived.

The proper report format is a source SHA, test command, browser/runtime version, failed assertion, trace or screenshot when available, and the corrective commit.

## Verification: what the suite can and cannot establish

Inspect the pinned [mobile test suite](https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/tests/e2e/mobile.spec.ts), the [responsive CSS](https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/src/styles/mobile.css), and the layout's event handlers before relying on a test description.

What a passing Chromium run can support: known viewport widths did not exceed the tested document width; the particular navigation and reading interactions behaved as asserted in that run.

What it cannot support: identical behavior across WebKit, Firefox, native Android browsers, or every assistive technology; absence of visual defects outside tested routes; real-world backend or GitHub API availability.

## Limitations and engineering improvements

The current browser suite is a practical starting point, not a comprehensive release certification. Areas to improve include a device/browser matrix, screenshot diffs with human approval, automated accessibility auditing, published CI traces, and a performance budget for animation-heavy landing pages.

Test names should describe the actual contract. When copy or structure changes intentionally, update the assertion to reflect the new behavior instead of preserving a misleading historical test.

**Outcome:** the repo exposes inspectable examples of turning a visual interface into testable user-facing contracts. The transferable engineering practice is to keep claims, tests, and deployment evidence aligned at the same pinned revision.
