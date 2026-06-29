# Mi姐交易笔记教程站

基于 Astro 与 Markdown 的静态教程网站。当前内容源是 `src/content/lessons/` 下的独立 Markdown 教程文件；根目录的 `Mi姐.md` 保留为历史归档，也可以在需要批量导入时作为重新切分的源文件。

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址为 `http://localhost:4321`。

## 常用命令

```bash
npm run dev            # 启动本地开发，不会重新切分内容
npm run build          # 生成静态网站到 dist/，不会重新切分内容
npm run preview        # 预览构建结果
npm run verify         # 浏览器端到端验证
npm run content:build  # 默认不切分，只提示维护方式
npm run content:split  # 从 Mi姐.md 重新切分并覆盖 lessons
```

也可以直接运行：

```bash
npm run content:build -- --split
```

## 站点配置

站点名、正式域名、导航、页脚文案、GitHub 源文件编辑链接等统一维护在 `src/site.config.ts`。

常见修改：

- 改域名：更新 `siteConfig.url`
- 改站点名：更新 `siteConfig.name`
- 改导航：更新 `siteConfig.nav`
- 改 GitHub 编辑入口：更新 `siteConfig.github.repo`、`branch` 或 `contentPath`

## Google 收录与统计

网站已经生成 `/sitemap.xml` 和 `/robots.txt`，可以在 Google Search Console 里提交站点地图：

```txt
https://mi.yanbo.im/sitemap.xml
```

Google Analytics 通过 `siteConfig.google.analyticsId` 配置，当前默认使用：

```txt
G-5BHRM3XB5M
```

部署环境里也可以设置环境变量覆盖：

```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

对应配置在 `src/site.config.ts`：

```ts
google: {
  analyticsId: env.GOOGLE_ANALYTICS_ID ?? 'G-5BHRM3XB5M',
},
```

留空时不会输出 Google Analytics 统计脚本。

## 内容更新

日常维护请直接编辑 `src/content/lessons/` 下的小文件。每篇教程需要保留 frontmatter：

```md
---
title: "教程标题"
description: "教程摘要"
slug: "lesson-semantic-slug"
chapter: 1
order: 1
---
```

新增教程时，在对应章节目录中新建文件，例如 `src/content/lessons/chapter-6/140-lesson-semantic-slug.md`，并填写完整 frontmatter。网站会根据 `chapter + order` 生成全站顺序、上一篇/下一篇和搜索索引，章节标题统一从站点配置读取。

## 重新切分

只有在你想从长文重新导入内容时，才运行 `npm run content:split`。这个命令会删除并重建 `src/content/lessons/` 和 `src/data/lesson-manifest.json`，因此会覆盖手工维护的小文件内容。

长文切分格式仍然是：一级章节标题使用 `# 第X章：标题`，每篇教程使用 `## 【教程标题】`。
