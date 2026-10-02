export type ChangelogEntry = {
  date: string;
  title: string;
  summary: string;
  type: 'feature' | 'content' | 'fix' | 'design';
  items: string[];
};

export const changelogEntries: ChangelogEntry[] = [
  {
    date: '2026-10-02',
    title: '新增资料资源页面',
    summary: '把不同网盘和文件形式的资料入口集中整理，减少查找与转存成本。',
    type: 'feature',
    items: ['新增资源导航与分类页面', '支持 ZIP 和解压包两种形式', '每个资源入口支持一键复制链接'],
  },
  {
    date: '2026-08-29',
    title: '新增更新记录与全站公告',
    summary: '让网站最近做了什么可以被直接看到，也给用户一个轻量提醒。',
    type: 'feature',
    items: ['新增更新记录页面', '新增可关闭的全站公告', '导航栏加入“持续更新”呼吸灯'],
  },
  {
    date: '2026-07-16',
    title: '复盘分类上线',
    summary: '支持把 Mi 姐复盘按日期整理，并关联音频、字幕和结构化文稿。',
    type: 'content',
    items: ['新增 Mi姐复盘频道', '支持音频、字幕、TXT 与 HTML 整理稿', '复盘内容按年/月/日目录归档'],
  },
  {
    date: '2026-07-16',
    title: '结构化文稿展示修复',
    summary: '修复外部 HTML 作为附件返回时 iframe 空白的问题。',
    type: 'fix',
    items: ['构建时读取远程结构化 HTML', '页面内使用 srcdoc 稳定展示', '保留原始文件打开入口'],
  },
  {
    date: '2026-07-15',
    title: '教程体验持续优化',
    summary: '围绕目录、阅读、移动端和文章排版做了一轮集中优化。',
    type: 'design',
    items: ['优化教程目录固定与章节切换', '增加回到顶部', '优化 Markdown 表格自适应', '完善文章 slug 与 GitHub 编辑入口'],
  },
];
