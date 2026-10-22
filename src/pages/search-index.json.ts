import { getCollection } from 'astro:content';

export async function GET() {
  const [blog, knowledge] = await Promise.all([
    getCollection('blog', ({data}) => !data.draft),
    getCollection('knowledge', ({data}) => !data.draft)
  ]);
  const rows = [
    ...blog.map((entry)=>({type:'文章',title:entry.data.title,description:entry.data.description,url:`/blog/${entry.id}/`,tags:entry.data.tags})),
    ...knowledge.map((entry)=>({type:'知识库',title:entry.data.title,description:entry.data.description,url:`/knowledge/${entry.id}/`,tags:entry.data.tags}))
  ];
  return new Response(JSON.stringify(rows), {headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
