import { getCollection } from 'astro:content';
import { chapters } from '../data/chapters';
import { getCanonicalSiteURL } from '../site.config';
import { compareLessons, getLessonURL } from '../utils/lesson-url';

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] ?? char);

export async function GET({ site }: { site: URL }) {
  const siteURL = site ?? getCanonicalSiteURL();
  const lessons = (await getCollection('lessons')).sort(compareLessons);
  const chapterPaths = chapters.map((chapter) => `/tutorial/chapter-${chapter.number}`);
  const paths = ['/', '/tutorial', ...chapterPaths, ...lessons.map((lesson) => getLessonURL(lesson))];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((path) => {
    const loc = new URL(path, siteURL).href;
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
