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

## 内容更新

日常维护请直接编辑 `src/content/lessons/` 下的小文件。每篇教程需要保留 frontmatter：

```md
---
title: "教程标题"
description: "教程摘要"
chapter: 1
chapterTitle: "章节标题"
order: 1
chapterOrder: 1
---
```

新增教程时，在对应章节目录中新建文件，例如 `src/content/lessons/chapter-6/140.md`，并填写完整 frontmatter。网站会根据 `order` 生成全站顺序、上一篇/下一篇和搜索索引，根据 `chapterOrder` 显示章节内编号。

## 重新切分

只有在你想从长文重新导入内容时，才运行 `npm run content:split`。这个命令会删除并重建 `src/content/lessons/` 和 `src/data/lesson-manifest.json`，因此会覆盖手工维护的小文件内容。

长文切分格式仍然是：一级章节标题使用 `# 第X章：标题`，每篇教程使用 `## 【教程标题】`。
