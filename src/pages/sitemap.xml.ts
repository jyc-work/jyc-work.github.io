import { getCollection } from 'astro:content';
import { projects } from '../data/projects';
import { learningPaths } from '../data/learning';
export async function GET() {
  const [posts, notes, commands] = await Promise.all([
    getCollection('blog', ({data})=>!data.draft),
    getCollection('knowledge', ({data})=>!data.draft),
    getCollection('commands')
  ]);
  const links = [
    '/', '/blog/', '/projects/', '/knowledge/', '/search/', '/learning/', '/commands/',
    ...posts.map(x=>`/blog/${x.id}/`),
    ...commands.map(x=>`/commands/${x.id}/`),
    ...notes.map(x=>`/knowledge/${x.id}/`),
    ...projects.map(x=>`/projects/${x.slug}/`),
    ...learningPaths.map(x=>`/learning/${x.slug}/`)
  ];
  const xml = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    links.map(link=>`<url><loc>https://jyc-work.github.io${link}</loc></url>`).join('') +
    '</urlset>';
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
