---
title: "Mobile Regression Testing with Playwright: Protecting a Frontend During Visual Redesigns"
description: "A source-reviewed walkthrough of viewport checks, semantic navigation, keyboard behavior, clipboard actions, and the limits of browser-emulated mobile testing."
date: 2026-10-22
kind: engineering-case
verification: source-reviewed
repository: "https://github.com/jyc-work/jyc-work.github.io"
revision: "8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f"
tags: ["Playwright", "Frontend", "TypeScript", "Accessibility", "Regression Testing"]
evidence:
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/tests/e2e/mobile.spec.ts"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/src/styles/mobile.css"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/src/layouts/Base.astro"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/playwright.config.ts"
---

## Problem: a visual redesign can break behavior

Frontend redesigns are often reviewed on a desktop monitor, where the layout has enough room to hide weak assumptions. On a narrow viewport, navigation can wrap unexpectedly, a long code token can stretch the page, a menu can cover the content, and keyboard focus can be lost. A screenshot alone may miss all of these failures.

The JYC Engineering Lab uses Playwright to define browser-observable expectations for the published static site. The goal is not to prove that a design looks attractive; it is to protect important behavior while layout, color, and content continue to change.

This article reviews the test and style sources at commit `8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f`. It describes the checks encoded in the repository. It does not claim that every mobile device or browser has been independently tested.

## Environment and version boundaries

The site is built with Astro and TypeScript. Playwright starts a local preview server, then runs the tests against the generated site rather than an isolated component. The GitHub Actions workflow installs Chromium and runs the browser suite after the static build.

A local reproduction from a clean checkout is:

~~~bash
npm install
npm run build
npx playwright install chromium
npm run test:e2e
~~~

In CI, use the workflow's `npx playwright install --with-deps chromium` command to install the browser and its Linux system dependencies. For reliable comparisons between runs, retain the commit SHA, resolved dependency versions, browser version, and failure artifacts.

## Design: test user-visible contracts

The test suite iterates through narrow viewport widths including 320, 375, 390, and 430 CSS pixels. It visits the main site routes and measures the document's rendered width. The assertion is intentionally about the result observed by the browser:

~~~ts
const documentWidth = await page.evaluate(
  () => document.documentElement.scrollWidth
);
expect(documentWidth).toBeLessThanOrEqual(width + 2);
~~~

The two-pixel tolerance allows for minor subpixel rounding. It should not be used to excuse a layout that requires horizontal scrolling. Code blocks may have their own explicit scrolling container; the document itself should remain within the viewport.

Interaction tests use accessible roles and names instead of relying entirely on implementation-specific CSS classes. The mobile menu must open, close with Escape, and navigate when a link is selected. Desktop tests assert that the full navigation remains visible while the mobile toggle is hidden.

## Reproduction: exercise the interface, not just the stylesheet

For a useful local regression run:

1. Start from the pinned commit and record the toolchain versions.
2. Run the full build and Playwright suite before changing any styles.
3. Introduce a deliberately wide test card in a temporary branch and confirm the viewport assertion fails.
4. Change a navigation button's accessible name and confirm the role-based locator catches the regression.
5. Revert the injected defects, rerun the suite, and retain the passing report.

The two defect-injection steps above are a proposed experiment, not a claim that the experiment was performed for this article. This distinction matters: a test existing in source is not the same as evidence that a particular failure mode was reproduced.

## Verification: cover layout, semantics, and state

The repository's browser tests cover more than viewport width. They exercise mobile navigation, Escape-key behavior, reading-table-of-contents navigation, code-copy feedback, reduced-motion preferences, and learning-progress persistence in browser storage. Some tests mock the GitHub API with deterministic sample data to check how the timeline renders a known response.

That mock is an explicit boundary. It verifies the frontend's behavior against the supplied payload; it does not prove that the public GitHub API is always available, that rate limits will not be reached, or that the live timeline has fresh records.

Browser tests are particularly useful when a redesign changes DOM structure or labels. Accessible-role selectors turn parts of the accessibility contract into regression checks: a missing label can fail the test even when the button still appears visually correct.

## Limitations and next steps

The current suite emulates mobile viewport dimensions in Chromium. It is not equivalent to a device matrix covering Android, iOS, WebKit, system font differences, browser safe areas, and on-screen keyboards. Passing these tests is evidence for the scenarios encoded in the suite, not a blanket compatibility guarantee.

A sensible next stage would add:

- Trace, screenshot, and test-report uploads on CI failure.
- A WebKit or Firefox job when compatibility risk justifies the added maintenance.
- Accessibility checks for keyboard focus, landmark names, and contrast.
- A small real-device smoke-test matrix for the highest-traffic pages.
- A documented policy for distinguishing mocked data from live API results.

The durable benefit of browser regression testing is not the number of assertions. It is the ability to state what must keep working, detect when it stops working, and preserve enough evidence to diagnose the change.
