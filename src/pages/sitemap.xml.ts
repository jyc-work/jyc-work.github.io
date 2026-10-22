import { getCollection } from 'astro:content';
import { projects } from '../data/projects';
import { learningPaths } from '../data/learning';

const site = 'https://jyc-work.github.io';
const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const [posts, englishPosts, notes, commands] = await Promise.all([
    getCollection('blog', ({ data }) => !data.draft),
    getCollection('blogEn', ({ data }) => !data.draft),
    getCollection('knowledge', ({ data }) => !data.draft),
    getCollection('commands')
  ]);

  const links = new Set<string>([
    '/', '/en/', '/blog/', '/en/blog/', '/projects/', '/en/projects/',
    '/knowledge/', '/search/', '/learning/', '/commands/', '/updates/',
    ...posts.map((entry) => `/blog/${entry.id}/`),
    ...englishPosts.map((entry) => `/en/blog/${entry.id}/`),
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
  addPair('/blog/', '/en/blog/');
  addPair('/projects/', '/en/projects/');
  const chineseIds = new Set(posts.map((entry) => entry.id));
  for (const entry of englishPosts) {
    if (chineseIds.has(entry.id)) addPair(`/blog/${entry.id}/`, `/en/blog/${entry.id}/`);
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
