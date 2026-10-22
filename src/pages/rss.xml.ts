import { getCollection } from 'astro:content';
const escape = (s:string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export async function GET(){
  const posts=(await getCollection('blog',({data})=>!data.draft)).sort((a,b)=>b.data.date.getTime()-a.data.date.getTime());
  const items=posts.map(post=>`<item><title>${escape(post.data.title)}</title><link>https://jyc-work.github.io/blog/${post.id}/</link><guid>https://jyc-work.github.io/blog/${post.id}/</guid><description>${escape(post.data.description)}</description><pubDate>${post.data.date.toUTCString()}</pubDate></item>`).join('');
  const body=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>JYC Engineering Lab</title><link>https://jyc-work.github.io/</link><description>Engineering notes and project updates</description><language>zh-cn</language>${items}</channel></rss>`;
  return new Response(body,{headers:{'Content-Type':'application/rss+xml; charset=utf-8'}});
}
