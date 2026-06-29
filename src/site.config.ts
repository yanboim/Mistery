const github = {
  repo: 'https://github.com/yanboim/Mistery',
  branch: 'main',
  contentPath: 'src/content/lessons',
} as const;

const social = {
  x: {
    href: 'https://x.com/ImYanBoss',
  },
  sourceX: {
    label: 'Mi姐 X：@Mimiwftt',
    href: 'https://x.com/Mimiwftt',
  },
} as const;

// Astro build-time environment variables. Values here can override defaults
// without changing source code in production deployments.
const env = typeof process !== 'undefined' ? process.env : {};

export const siteConfig = {
  name: 'Mi姐交易笔记',
  shortName: 'Mi姐',
  description: '从交易基础到宏观认知的系统化中文教程',
  // Used by Astro, canonical URLs, sitemap.xml, robots.txt, and structured data.
  url: 'https://mi.yanbo.im',
  locale: 'zh-CN',
  themeColor: '#f4f2ed',
  // Public asset path used for Open Graph and Twitter preview cards.
  ogImage: '/twitter-card-v3.jpg',
  favicon: '/favicon.svg',
  // Font stacks are exposed as CSS variables by BaseLayout.
  fonts: {
    // Self-hosted subset of LXGW WenKai (see public/fonts/lxgw.css).
    // Switched from cdnjs: removes a cross-origin render-blocking request,
    // the third-party cookies Cloudflare set on it, and adds font-display: swap.
    stylesheets: ['/fonts/lxgw.css'],
    body: ['"LXGW WenKai"', 'Roboto', '"Microsoft YaHei"', 'sans-serif'],
    heading: ['"LXGW WenKai"', 'Roboto', '"Microsoft YaHei"', 'sans-serif'],
    code: ['"LXGW WenKai"', 'Roboto', '"Source Code Pro"', 'ui-monospace', 'monospace'],
  },
  contentSourceTitle: '《Mi姐 · 股市交易文集》',
  footerSource: {
    prefix: '本站内容由 ',
    linkLabel: 'Mistery',
    href: social.sourceX.href,
    suffix: '《Mi姐 · 股市交易文集》整理，仅供学习与交流，不构成投资建议。',
  },
  footerLinks: [],
  copyright: {
    year: new Date().getFullYear(),
    owner: 'YanBo',
    href: social.x.href,
    text: 'All rights reserved.',
  },
  nav: [
    { key: 'home', label: '知识地图', href: '/' },
    { key: 'tutorial', label: '全部教程', href: '/tutorial' },
    { key: 'x', label: '关于我', href: social.x.href, external: true, icon: { type: 'x' } },
    { key: 'repository', label: '源码', href: github.repo, external: true, icon: { type: 'github' } },
  ],
  lessonSidebar: {
    label: '目录',
  },
  search: {
    label: '搜索教程',
    placeholder: '搜索教程…',
  },
  // Set GOOGLE_ANALYTICS_ID in the deployment environment to override this ID.
  // Leave analyticsId empty to disable Google Analytics output entirely.
  google: {
    analyticsId: env.GOOGLE_ANALYTICS_ID ?? 'G-5BHRM3XB5M',
  },
  github,
  social,
} as const;

export type SiteNavKey = (typeof siteConfig.nav)[number]['key'];

export const withSiteTitle = (title?: string) => (title ? `${title} | ${siteConfig.name}` : siteConfig.name);

export const getCanonicalSiteURL = () => new URL(siteConfig.url);

// Maps content collection ids such as "chapter-1/001" to GitHub edit URLs.
export const getSourceEditURL = (contentId: string) =>
  `${siteConfig.github.repo}/edit/${siteConfig.github.branch}/${siteConfig.github.contentPath}/${contentId}.md`;
