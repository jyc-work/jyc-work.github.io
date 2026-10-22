# JYC Engineering Lab

JYC's engineering blog, evidence-based project portfolio, public knowledge base, and curated learning paths.

**Site:** https://jyc-work.github.io/

## Technical stack

- Astro (static generation)
- Astro content collections with Markdown and validation
- GitHub Actions + GitHub Pages
- Lightweight search over public titles, descriptions, and tags
- RSS at `/rss.xml`

## Local development

Requires Node.js 22+.

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Publishing

- Blog articles: `src/content/blog/*.md`
- Knowledge notes: `src/content/knowledge/*.md`
- Project case studies: `src/data/projects.ts`
- Learning paths and eight curated GitHub resources: `src/data/learning.ts`
- Engineering command handbook: `src/content/commands/*.md` (14 topics; 6 database/SQL topics)

Content collections require title, description, date, and optional tags. Add `draft: true` in frontmatter to exclude a document from the public build.

**Safety rule:** Only publish original or appropriately licensed materials. Do not mirror private Notion notes, proprietary code, credentials, private logs or third-party copyrighted courses. A project is not publicly reproducible until links to reproducible artifacts are available.

## Deployment

1. Repository **Settings → Pages → Build and deployment → Source → GitHub Actions**
2. Push or merge to `main`.
3. The `.github/workflows/pages.yml` workflow builds on Node.js 22 and deploys `dist/`.
4. Check **Actions** for the first successful deployment.

Pull requests run build validation without deploying.

## Scope

This website is intentionally focused on software engineering, Agent systems, backend, data engineering and full-stack development. Investing and quantitative-trading content is excluded.

This is the first public version. Project pages explicitly state their evidence and limitations; they are not proof of a production deployment or third-party verification.

## Attribution

The [Agent design patterns tutorial](https://zhiwenliang.github.io/learning/agent-design-patterns/index.html) is linked as an external source. We publish an independent synthesis, not the tutorial's copyrighted text.

## Engineering command handbook

Browse `/commands/` for Linux, Docker, Kubernetes, containerd, Hadoop, Git, Kafka, Flink, generic SQL, MySQL, ClickHouse, PostgreSQL, Redis and GaussDB. Commands are grouped by platform, tagged with version and security cautions, and integrated into the site search and sitemap. No financial or quant research content is published here.

## Mobile compatibility

- Collapsible accessible navigation on narrow screens (keyboard Escape closes the menu)
- Expandable chapter table of contents on mobile reading pages
- One-click code copying and scroll-to-top
- Automated Chromium checks at 320, 375, 390 and 430px viewports, including menu, article controls and overflow
- Run `npm run build && npx playwright install chromium && npm run test:e2e` locally

## Night Circuit: cyberpunk-inspired interactive interface

The original JYC neon district theme is inspired by cyberpunk visual design; it uses no game logos, copied UI assets or protected character artwork. The site remains static-hosted on GitHub Pages.

- Responsive midnight-blue / electric-cyan / violet / magenta neon-noir theme, angular panels and cards
- Simulated runtime terminal events are decorative, explicitly labeled DEMO, and never represent production telemetry
- FX switch controls the decorative glitch/scanline and terminal animation, persisted locally when storage is available
- OS reduced-motion preference always wins; the terminal falls back to a static list
- Local HUD clock displays the browser's local time; repository update feed is CI-driven and reviewed, not a live data stream
- Original mobile navigation, content, search, RSS and keyboard controls remain intact

## Interactive learning progress & source-backed technology timeline

- Each learning track has four self-check stages. Mark a stage complete only after independently completing the work and reviewing the acceptance criteria. This is **self-assessment**, not an automated certification.
- Your checkboxes are stored in browser `localStorage` only (`jyc.learning.progress.v1`); no account, server submission, or tracking is used.
- At `/learning/` you can export the progress to a JSON file and import it on another browser or device. Do not upload a file from an untrusted source.
- `/updates/` groups reviewed upstream GitHub change metadata by observed date, links to original commits, and clearly separates model summaries from independently verified technical outcomes.
- JYC website's public commit history can be fetched on demand from the GitHub public API. No API key is exposed or required.
- Financial or quantitative trading content is not part of this site.

### Night Circuit visual correction

Following feedback that bright yellow resembled promotional artwork rather than a futuristic city at night, the original JYC site now uses midnight blue, electric cyan, violet atmosphere, and magenta signage. The local `public/night-city-skyline.svg` is original vector decoration, not game art. Learning progress, GitHub update timelines, and mobile controls are preserved.

## Engineering-grade publication rules

The blog publishes only source-backed engineering case studies and incident analyses; short reading notes, tutorials without reproducible evidence, and project ideas remain **drafts** or knowledge-base material.

- Public posts require `kind`, `verification`, pinned full `revision`, repository URL and direct source/evidence links.
- The offline publication gate `python3 scripts/blog_quality.py` checks the required metadata and structure.
- The Astro schema validates field shapes. The CI workflow runs the publication gate, Astro build, Python tests and Chromium mobile smoke tests.
- Evidence grades are explicit: `source-reviewed` is **not** independently reproduced; `runtime-tested` needs linked test reports; `externally-reproduced` requires independent artifacts.
- A project without public code or reproducible testing may be documented as **in progress**, never marketed as publicly verified.
- Third-party upstream forks are documented as source studies, not original authored systems.

The publication gate is editorial automation, not a technical truth oracle; human review remains necessary.

Run locally: `python3 scripts/blog_quality.py && python3 -m unittest discover -s scripts/tests -v && npm run build && npm run test:e2e`.
