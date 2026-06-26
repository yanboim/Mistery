import { getCanonicalSiteURL } from '../site.config';

export function GET({ site }: { site: URL }) {
  const siteURL = site ?? getCanonicalSiteURL();
  return new Response(`User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', siteURL).href}
`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
