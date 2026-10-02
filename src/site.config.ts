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
    label: 'Mi姐',
    href: '/mijie',
  },
} as const;

// Astro 构建时环境变量。线上部署时可以通过环境变量覆盖默认值，
// 避免为了不同环境反复改源码。
const env = typeof process !== 'undefined' ? process.env : {};

export const siteConfig = {
  // 基础站点信息：影响页面标题、SEO、站点地图、robots 和结构化数据。
  name: 'Mi姐交易笔记',
  shortName: 'Mi姐',
  description: '从交易基础到宏观认知的系统化中文教程',
  url: 'https://mi.yanbo.im',
  locale: 'zh-CN',
  themeColor: '#f4f2ed',

  // 公共资源：用于浏览器图标、Open Graph 和 X / Twitter 分享卡片。
  ogImage: '/twitter-card-v3.jpg',
  favicon: '/favicon.svg',

  // 字体配置会在 BaseLayout 中转换成 CSS 变量。
  fonts: {
    // 霞鹜文楷使用本地托管版本，见 public/fonts/lxgw.css。
    // 这样可以减少第三方 CDN 请求，也能控制 font-display 等加载策略。
    stylesheets: ['/fonts/lxgw.css'],
    body: ['"LXGW WenKai"', 'Roboto', '"Microsoft YaHei"', 'sans-serif'],
    heading: ['"LXGW WenKai"', 'Roboto', '"Microsoft YaHei"', 'sans-serif'],
    code: ['"LXGW WenKai"', 'Roboto', '"Source Code Pro"', 'ui-monospace', 'monospace'],
  },

  // 站点活跃状态：用于导航栏里的呼吸灯。
  status: {
    enabled: true,
    label: '持续更新',
    title: '网站仍在维护和更新中',
  },

  // 全站公告：storageKey 变化后，已关闭公告的用户会再次看到新公告。
  announcement: {
    enabled: true,
    storageKey: 'mjie-announcement-2026-08-29',
    eyebrow: '最近更新',
    title: '复盘记录和更新日志已上线',
    description: '新增 Mi 姐复盘分类、结构化文稿展示、更新记录页面，并继续优化教程目录与移动端体验。',
    href: '/changelog',
    action: '查看更新',
    dismissLabel: '知道了',
  },

  // 内容来源与页脚信息。
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

  // 主导航：key 保持唯一，避免移动端菜单、当前态或后续统计出现歧义。
  nav: [
    { key: 'home', label: '知识地图', href: '/' },
    { key: 'tutorial', label: '全部教程', href: '/tutorial' },
    { key: 'reviews', label: 'Mi姐复盘', href: '/reviews' },
    { key: 'resources', label: '资源', href: '/resources' },
    { key: 'about-x', label: '关于我', href: social.x.href, external: true, icon: { type: 'x' } },
    { key: 'mi-x', label: 'Mi姐', href: social.sourceX.href },
    { key: 'repository', label: '源码', href: github.repo, external: true, icon: { type: 'github' } },
  ],

  lessonSidebar: {
    label: '目录',
  },

  search: {
    label: '搜索教程',
    placeholder: '搜索教程…',
  },

  // 网盘资料：资源页直接从这里渲染分类卡片与复制链接。
  resources: {
    providers: [
      {
        key: 'quark',
        name: '夸克网盘',
        description: '适合夸克网盘用户保存和在线查看。',
        links: [
          {
            key: 'zip',
            label: 'ZIP 形式',
            description: '完整压缩包，适合一次性下载后本地保存。',
            href: 'https://pan.quark.cn/s/240b593554b1?pwd=cH57',
          },
          {
            key: 'extracted',
            label: '解压包形式',
            description: '已展开文件目录，适合在线浏览或按需保存。',
            href: 'https://pan.quark.cn/s/edfa066ff632?pwd=jCz2',
          },
        ],
      },
      {
        key: 'baidu',
        name: '百度网盘',
        description: '适合百度网盘用户转存到个人空间。',
        links: [
          {
            key: 'zip',
            label: 'ZIP 形式',
            description: '完整压缩包，适合一次性下载后本地保存。',
            href: 'https://pan.baidu.com/s/1YuMM-dsdC8kMfIrc_Fc9Fw?pwd=5aU6',
          },
          {
            key: 'extracted',
            label: '解压包形式',
            description: '已展开文件目录，适合在线浏览或按需保存。',
            href: 'https://pan.baidu.com/s/1M6xruDl4IpU0JTRPsMPrVg?pwd=KWAS',
          },
        ],
      },
      {
        key: 'guangya',
        name: '光鸭网盘',
        description: '提供另一套下载入口，方便按需选择。',
        links: [
          {
            key: 'zip',
            label: 'ZIP 形式',
            description: '完整压缩包，适合一次性下载后本地保存。',
            href: 'https://www.guangyapan.com/s/1953054097955065935_ar03S7ajOxOWfFgQ?code=nmoy',
          },
          {
            key: 'extracted',
            label: '解压包形式',
            description: '已展开文件目录，适合在线浏览或按需保存。',
            href: 'https://www.guangyapan.com/s/1953055109675724825_ar03S7ajOxOWfFgQ?code=ht25',
          },
        ],
      },
    ],
  },

  // 章节配置：教程目录、首页知识框架、章节页标题均从这里读取。
  // 建议按 number 升序维护，number / numeral / role 三者要保持一一对应。
  chapters: [
    {
      number: 1,
      numeral: '一',
      role: '道',
      title: '交易基础认知',
      summary: '从趋势、风险与交易本质开始，建立进入市场前必须具备的基础认知。',
    },
    {
      number: 2,
      numeral: '二',
      role: '术',
      title: '交易技术指标',
      summary: '理解量价、均线、筹码、MACD 与缠论等常见分析工具。',
    },
    {
      number: 3,
      numeral: '三',
      role: '法',
      title: '交易策略方法',
      summary: '把零散判断组织为可执行、可复盘的交易策略。',
    },
    {
      number: 4,
      numeral: '四',
      role: '用',
      title: '交易技巧认知',
      summary: '聚焦仓位、做 T、解套、抄底与筹码博弈等实战问题。',
    },
    {
      number: 5,
      numeral: '五',
      role: '势',
      title: '宏观经济认知',
      summary: '从流动性、产业周期与全球格局理解市场所处的大环境。',
    },
    {
      number: 6,
      numeral: '六',
      role: '心',
      title: 'Mi 姐谜语',
      summary: '以市场观察、行业线索和投资心法拓展长期判断力。',
    },
    {
      number: 7,
      numeral: '七',
      role: '补',
      title: '最新补充',
      summary: '收录后续新增的市场观察、交易笔记与临时补充内容。',
    },
  ],

  // 页面文案：能配置的展示文字尽量集中在这里，避免散落到 Astro 页面里。
  copy: {
    home: {
      kicker: '从认知到执行',
      titleLines: ['把交易经验，', '整理成一条学习路径。'],
      intro: {
        suffix: ' 篇中文短教程，帮你从基础认知走到独立判断。',
      },
      actions: {
        start: '开始第一课',
        resume: '继续上次阅读',
        search: '搜索主题',
      },
      studyMethod: {
        label: '学习方法',
        title: '一套可以持续的阅读方法',
        steps: [
          { title: '先看框架', description: '明确问题属于认知、工具还是执行。' },
          { title: '每次解决一个问题', description: '短篇阅读，不用一次记住所有内容。' },
          { title: '回到交易中验证', description: '标记已读，用复盘修正自己的判断。' },
        ],
      },
      facts: {
        dimension: '知识维度',
        lessons: '短教程',
        structured: '已结构化文章',
        readingMode: '阅读方式',
        readingModeValue: '顺序学习或按问题进入',
      },
      framework: {
        titleLines: ['多个维度，', '从市场认知走到交易行动。'],
        action: '浏览全部教程',
      },
      closing: {
        title: '先建立自己的判断，再做每一次交易。',
        action: '查看完整目录',
      },
      unit: {
        chapterPrefix: '第',
        article: '篇',
      },
    },
    tutorial: {
      title: '全部教程',
      description: '浏览 {siteName} 的全部章节与教程',
      kicker: '完整课程目录',
      titleLines: ['从一个问题开始，', '逐步建立自己的交易框架。'],
      overview: {
        label: '学习进度',
        record: '学习记录',
        completeTemplate: '已完成 {percent}%',
        resume: '继续阅读',
      },
      filter: {
        label: '学习状态',
        all: '全部',
        unread: '未读',
        read: '已读',
        statusAll: '共 {count} 篇教程',
        statusMatched: '找到 {count} 篇 {filter}教程',
      },
      empty: '当前状态下没有教程。切回“全部”查看完整目录。',
      chapterJumpLabel: '快速跳转到章节',
      chapter: {
        prefix: '第',
        separator: '章，',
        readTemplate: '{read} / {total} 已读',
        enter: '进入章节页',
        collapse: '收起',
        expand: '展开',
      },
    },
    changelog: {
      title: '更新记录',
      description: '记录网站内容、功能、体验与维护更新。',
      kicker: '更新记录',
      titleLines: ['网站做了什么，', '都在这里留下痕迹。'],
      intro: '这里记录站点最近的内容整理、功能迭代和体验优化，方便你快速了解新增了什么。',
      latestLabel: '最新',
      empty: '暂无更新记录。',
    },
    reviews: {
      title: 'Mi姐复盘',
      description: '按时间整理 Mi 姐的市场复盘，支持文字、图片、音频、视频与字幕。',
      kicker: '复盘记录',
      titleLines: ['把市场复盘，', '沉淀成可回看的记录。'],
      empty: '暂无复盘记录。',
      detailBack: '返回复盘列表',
      source: '原始来源',
      transcript: '字幕文件',
      transcriptContent: '字幕整理',
      audio: '复盘音频',
      video: '复盘视频',
    },
    resources: {
      title: '资料资源',
      description: '集中整理 Mi姐交易笔记相关网盘资料，支持直接打开和复制链接。',
      kicker: '资料资源',
      titleLines: ['把资料入口，', '集中放在这里。'],
      intro: '按网盘与文件形式选择，支持直接打开或一键复制链接。',
      guideTitle: '如何选择',
      guide: 'ZIP 适合完整下载和长期保存；解压包适合在线浏览与按需转存。',
      open: '打开链接',
      copy: '复制链接',
      copied: '已复制',
      copyFailed: '复制失败，请手动打开链接复制。',
      notice: '网盘链接由第三方平台提供，如遇失效会在后续更新中维护。',
    },
  },

  // 第三方集成：部署环境设置对应环境变量后会覆盖默认值。
  // allowedHosts 用来限制真实上报域名，避免 localhost / 预览环境污染数据。
  google: {
    // 留空 analyticsId 可以完全关闭 Google Analytics。
    analyticsId: env.GOOGLE_ANALYTICS_ID ?? 'G-5BHRM3XB5M',
    allowedHosts: ['mi.yanbo.im'],
  },
  cloudflare: {
    // 留空 token 可以完全关闭 Cloudflare Web Analytics。
    token: env.CLOUDFLARE_WEB_ANALYTICS_TOKEN ?? 'cf0d6bd9432447b791fc5cd3ff855bc1',
    allowedHosts: ['mi.yanbo.im'],
  },

  // 外部链接配置对象也暴露出去，方便其他模块复用。
  github,
  social,
} as const;

export type SiteNavKey = (typeof siteConfig.nav)[number]['key'];

export const withSiteTitle = (title?: string) => (title ? `${title} | ${siteConfig.name}` : siteConfig.name);

export const getCanonicalSiteURL = () => new URL(siteConfig.url);

// 把内容源文件路径（例如 "chapter-1/001-new-traders-recent-months"）转换成 GitHub 编辑地址。
export const getSourceEditURL = (sourcePath: string) =>
  `${siteConfig.github.repo}/edit/${siteConfig.github.branch}/${siteConfig.github.contentPath}/${sourcePath}.md`;
