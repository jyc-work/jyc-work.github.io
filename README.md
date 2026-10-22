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
