# M姐交易笔记教程站

基于 Astro 与 Markdown 的静态教程网站。`M姐.md` 是内容的唯一源文件，构建前会自动拆分为 6 章、308 篇独立教程。

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址为 `http://localhost:4321`。

## 常用命令

```bash
npm run content:build  # 重新拆分 M姐.md
npm run build          # 生成静态网站到 dist/
npm run preview        # 预览构建结果
npm run verify         # 浏览器端到端验证
```

## 内容更新

直接编辑根目录的 `M姐.md`。一级章节标题使用 `# 第X章：标题`，每篇教程使用 `## 【教程标题】`。运行 `npm run content:build` 后，教程文件和搜索索引会自动更新。

生成的教程位于 `src/content/lessons/`，请不要把它们当作独立内容源手工维护。
