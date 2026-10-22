---
title: "Engineering a Static Site Delivery Pipeline with Astro and GitHub Actions"
description: "How a public engineering site separates pull-request verification from deployment, and where reproducibility and operations still need work."
date: 2026-10-22
kind: engineering-case
verification: source-reviewed
repository: "https://github.com/jyc-work/jyc-work.github.io"
revision: "8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f"
zhSlug: "astro-pages-engineering-case"
tags: ["Astro", "GitHub Actions", "CI/CD", "Playwright", "Architecture"]
evidence:
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/.github/workflows/pages.yml"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/package.json"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/src/content.config.ts"
  - "https://github.com/jyc-work/jyc-work.github.io/blob/8848d34d2bd6c8ad642f1103d62a7e2d1e9fcf5f/tests/e2e/mobile.spec.ts"
---

## Problem and operating constraints

A personal website becomes a software product once it has content collections, client-side interactions, user-controlled local state, CI/CD, and a growing set of public links. Visual changes can break mobile layouts; content changes can generate broken URLs; a deployment can succeed at uploading files while still delivering a broken experience.

JYC Engineering Lab is a static Astro website with a public GitHub repository. The engineering problem is to make changes **reviewable before publication**, not merely to obtain a green local build.

This case study inspects the repository at the pinned revision linked above. **Verification level: source-reviewed.** It describes identifiable code and test contracts but does not claim an independently executed deployment or an operational SLO.

## Environment and version boundaries

The repository uses Astro 5, TypeScript, GitHub Actions, and Playwright, with Node.js 22 configured in the publishing workflow. The site compiles into static assets and does not require an always-on Node.js server to serve the public content.

The version boundary matters. Dependency ranges in `package.json` and an installation step based on `npm install` are less deterministic than a committed lockfile installed with `npm ci`. Different dependency resolutions may produce different outputs even if the source commit stays constant.

Run the same checks locally with Node.js 22:

~~~bash
npm install
npm run build
python3 -m unittest discover -s scripts/tests -v
npx playwright install chromium
npm run test:e2e
~~~

These commands describe how to reproduce the development checks. They are not a claim that the commands were independently executed while writing this article.

## Design: validation and release are distinct states

The repository's workflow listens for pull requests and pushes to `main`. Validation happens before publishing. The deployment stage is separate and is not intended to publish a pull-request head as the public site.

The following is a **simplified illustration**; inspect the pinned workflow for the authoritative configuration.

~~~yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

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

The important architectural boundary is not the YAML syntax. It is the state transition:

1. A change enters review as a pull request.
2. Static compilation and automated tests provide bounded evidence.
3. A reviewed change is merged to `main`.
4. A main-branch workflow can publish artifacts.
5. Production reachability and actual rendered behavior still require independent confirmation.

A green build is not the same thing as a successful release. An uploaded artifact is not proof that every route, region, and browser is healthy.

## Reproducing the browser validation

A static build can still contain broken client-side interactions. The Playwright configuration serves the generated website locally and exercises browser behavior.

One assertion checks document-wide overflow across narrow viewports:

~~~ts
const documentWidth = await page.evaluate(
  () => document.documentElement.scrollWidth
);
expect(documentWidth).toBeLessThanOrEqual(width + 2);
~~~

This makes a particular failure mode observable. It does not prove that every component renders correctly, nor does Chromium emulation replace testing on actual Android and iOS devices.

The same test suite covers keyboard-controlled navigation, copy-code controls, reduced-motion preferences, local reading-state persistence, and pages built from content collections. These are functional contracts, rather than a static inspection of CSS file names.

## Verification and evidence interpretation

The pinned evidence links expose the workflow, package definition, content schema, and browser tests. A technical reviewer can inspect whether the described steps exist and which behaviors the tests actually assert.

When documenting a specific CI run, an evidence-complete report should also attach the run URL, commit SHA, job conclusion, exit codes, logs, and ideally test artifacts. Merely showing `npm run build` in documentation is insufficient.

Distinguish these levels carefully:

- **Source-reviewed:** the implementation and declared assertions can be inspected.
- **Runtime-tested:** a traceable execution of specific tests exists for a particular revision.
- **Externally reproduced:** an independent party has executed the procedure and supplied artifacts.

This article deliberately claims only the first.

## Security and reliability boundaries

A static site still has a control plane. The deployment workflow should scope GitHub tokens to the actions that require them, rather than granting broad repository write permission throughout CI.

The separate technology-watch workflow produces source-backed update suggestions through a review process. AI-generated explanations must not bypass editorial review, and API credentials must not be embedded in browser JavaScript or published source.

Client-side demonstration visuals are not production telemetry. A decorative terminal, however convincing, is not an uptime report.

## Limitations and follow-up work

The inspected site has real engineering affordances, but it should not be described as a mature, SLO-backed platform. Its known improvement areas include:

- Pinning dependencies with a lockfile and adopting a deterministic install command.
- Uploading failed browser traces and screenshots to workflow artifacts.
- Testing the deployed domain after publication, independently of the local preview.
- Documenting rollback steps and what it means to restore a known-good revision.
- Expanding device/browser coverage while tracking test flakiness.
- Attaching an explicit release evidence index to public project documentation.

**Outcome:** the repository demonstrates a reviewable static-site delivery structure with documented verification limits. The engineering lesson is to tie each claim to a specific source revision or test result, rather than treating a successful command as proof of production reliability.
