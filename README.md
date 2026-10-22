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

- Responsive Night Circuit neon-noir theme: midnight indigo, electric cyan, purple depth and magenta accents, angular panels and cards
- Simulated runtime terminal events are decorative, explicitly labeled DEMO, and never represent production telemetry
- FX switch controls the decorative glitch/scanline and terminal animation, persisted locally when storage is available
- OS reduced-motion preference always wins; the terminal falls back to a static list
- Local HUD clock displays the browser's local time; repository update feed is CI-driven and reviewed, not a live data stream
- Original mobile navigation, content, search, RSS and keyboard controls remain intact

### Visual correction (Night Circuit)

After feedback that neon yellow reflected the game's promotional posters rather than its immersive night-city atmosphere, the interface moved to midnight blue / electric cyan / violet / magenta. The implementation deliberately uses distinct hues for ambient scene, navigation focus, primary actions, and alert decoration. The header, cards, terminal, article chrome and mobile navigation follow this hierarchy. `public/night-city-skyline.svg` is an original decorative vector composition, not a game screenshot or licensed artwork; FX OFF and OS reduced-motion continue to work. The page remains a static Astro site.
