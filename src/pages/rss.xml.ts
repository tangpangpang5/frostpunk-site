import type { APIRoute } from 'astro';
import { SITE } from '../data/site';

const posts = [
  { title: '在绝对零度里维持一行代码的燃烧', date: '2026-11-12', path: '/' },
  { title: '遥测：把一年的提交摊平成热力图', date: '2026-11-05', path: '/telemetry/' },
  { title: '档案：三本没读完的书与一条技术债', date: '2026-10-28', path: '/archive/' },
  { title: '熔炉：研究树是怎么长出来的', date: '2026-10-19', path: '/foundry/' },
  { title: '声学：六个站点的留声机', date: '2026-10-11', path: '/acoustic/' },
];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = () => {
  const base = SITE.domain.startsWith('http') ? SITE.domain : `https://${SITE.domain}`;
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${base}${p.path}</link>
      <guid isPermaLink="true">${base}${p.path}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(`${SITE.author} · ${SITE.tagline}`)}</description>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.title)}</title>
    <link>${base}</link>
    <description>${esc(SITE.manifesto)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};

