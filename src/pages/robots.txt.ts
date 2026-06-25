export function GET({ site }: { site: URL }) {
  return new Response(`User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', site).href}
`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
