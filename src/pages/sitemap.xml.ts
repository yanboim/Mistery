import { getCollection } from 'astro:content';

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] ?? char);

export async function GET({ site }: { site: URL }) {
  const lessons = (await getCollection('lessons')).sort((a, b) => a.data.order - b.data.order);
  const paths = ['/', '/tutorial', ...lessons.map((lesson) => `/tutorial/${lesson.id}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((path) => {
    const loc = new URL(path, site).href;
    const priority = path === '/' ? '1.0' : path === '/tutorial' ? '0.9' : '0.7';
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
