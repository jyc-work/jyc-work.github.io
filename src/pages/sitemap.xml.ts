import { getCollection } from 'astro:content';
import { projects } from '../data/projects';
import { learningPaths } from '../data/learning';

const site = 'https://jyc-work.github.io';
const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const [posts, notes, commands, englishPosts] = await Promise.all([
    getCollection('blog', ({ data }) => !data.draft),
    getCollection('knowledge', ({ data }) => !data.draft),
    getCollection('commands'),
    getCollection('enBlog', ({ data }) => !data.draft)
  ]);

  const links = new Set<string>([
    '/', '/blog/', '/projects/', '/knowledge/', '/search/', '/learning/', '/commands/', '/updates/',
    '/en/', '/en/articles/', '/en/projects/', '/en/projects/jyc-engineering-lab/',
    ...posts.map((entry) => `/blog/${entry.id}/`),
    ...englishPosts.map((entry) => `/en/articles/${entry.id}/`),
    ...commands.map((entry) => `/commands/${entry.id}/`),
    ...notes.map((entry) => `/knowledge/${entry.id}/`),
    ...projects.map((entry) => `/projects/${entry.slug}/`),
    ...learningPaths.map((entry) => `/learning/${entry.slug}/`)
  ]);

  const pairs = new Map<string, { zh: string; en: string }>();
  const addPair = (zh: string, en: string) => {
    const pair = { zh, en };
    pairs.set(zh, pair);
    pairs.set(en, pair);
  };
  addPair('/', '/en/');
  addPair('/blog/', '/en/articles/');
  addPair('/projects/', '/en/projects/');
  addPair('/projects/jyc-engineering-lab/', '/en/projects/jyc-engineering-lab/');

  const chineseIds = new Set(posts.map((entry) => entry.id));
  for (const entry of englishPosts) {
    if (chineseIds.has(entry.data.zhSlug)) {
      addPair(`/blog/${entry.data.zhSlug}/`, `/en/articles/${entry.id}/`);
    }
  }

  const xml = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    [...links].map((path) => {
      const pair = pairs.get(path);
      const alternates = pair
        ? `<xhtml:link rel="alternate" hreflang="zh-CN" href="${site}${escapeXml(pair.zh)}"/><xhtml:link rel="alternate" hreflang="en" href="${site}${escapeXml(pair.en)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${site}${escapeXml(pair.zh)}"/>`
        : '';
      return `<url><loc>${site}${escapeXml(path)}</loc>${alternates}</url>`;
    }).join('') +
    '</urlset>';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
