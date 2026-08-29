import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const resume = args.includes('--resume');
const positionalArgs = args.filter((arg) => !arg.startsWith('--'));
const sourceDir =
  positionalArgs[0] ??
  '/home/yanbo/.codex/attachments/16fc7ead-69fc-4b91-8c5a-af43bf097f5c';
const outputDir = resolve(root, positionalArgs[1] ?? 'converted-markdown');
const assetRoot = join(outputDir, 'assets');

const encodePathSegment = (segment) =>
  encodeURIComponent(segment)
    .replace(/%2F/g, '/')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');

const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 200 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  return result.stdout;
};

const safeName = (name) =>
  name
    .replace(/\.pdf$/i, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const normalizePageText = (input) => {
  const lines = input
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, '').trim())
    .filter(Boolean);

  if (/^\d+$/.test(lines.at(-1) ?? '')) lines.pop();

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const pageCountOf = (sourcePath) => {
  const info = run('pdfinfo', [sourcePath]);
  const match = info.match(/^Pages:\s+(\d+)/m);
  if (!match) throw new Error(`Cannot read page count from ${sourcePath}`);
  return Number(match[1]);
};

const parseImageList = (sourcePath) => {
  const list = run('pdfimages', ['-list', sourcePath]);
  const records = [];

  for (const line of list.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 6 || !/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) continue;

    const page = Number(parts[0]);
    const num = Number(parts[1]);
    const type = parts[2];
    const width = Number(parts[3]);
    const height = Number(parts[4]);

    if (type !== 'image') continue;
    records.push({ page, num, width, height });
  }

  return records;
};

const extractEmbeddedImages = async (sourcePath, imageDir) => {
  const records = parseImageList(sourcePath);
  if (records.length === 0) return [];

  await mkdir(imageDir, { recursive: true });
  run('pdfimages', ['-png', sourcePath, join(imageDir, 'img')]);

  const linkedImages = records.map((record) => ({
    ...record,
    filename: `img-${String(record.num).padStart(3, '0')}.png`,
  }));
  const linkedNames = new Set(linkedImages.map((image) => image.filename));

  for (const filename of await readdir(imageDir)) {
    if (!linkedNames.has(filename)) await rm(join(imageDir, filename), { force: true });
  }

  return linkedImages;
};

const renderFallbackPage = async (sourcePath, fallbackDir, pageNumber) => {
  await mkdir(fallbackDir, { recursive: true });
  const prefix = join(fallbackDir, `page-${String(pageNumber).padStart(3, '0')}`);
  run('pdftoppm', [
    '-f',
    String(pageNumber),
    '-l',
    String(pageNumber),
    '-r',
    '120',
    '-jpeg',
    '-jpegopt',
    'quality=82',
    sourcePath,
    prefix,
  ]);
  return `page-${String(pageNumber).padStart(3, '0')}-${pageNumber}.jpg`;
};

if (!resume) await rm(outputDir, { recursive: true, force: true });
await mkdir(assetRoot, { recursive: true });

const entries = (await readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
  .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
  .map((entry) => entry.name);

const index = [
  '# PDF 转 Markdown 索引',
  '',
  `来源目录：\`${sourceDir}\``,
  '',
  '> 正文优先使用 PDF 文字层；只提取 PDF 内嵌图片。文字层缺失的页面会额外附页面原图兜底。',
  '',
];

for (const filename of entries) {
  const sourcePath = join(sourceDir, filename);
  const title = basename(filename, extname(filename));
  const docDirName = safeName(filename);
  const embeddedDir = join(assetRoot, docDirName, 'embedded');
  const fallbackDir = join(assetRoot, docDirName, 'fallback-pages');
  const outputName = `${title}.md`;
  const outputPath = join(outputDir, outputName);

  if (resume) {
    try {
      await readdir(join(assetRoot, docDirName));
      await readdir(outputDir);
      const existing = await readdir(outputDir);
      if (existing.includes(outputName)) {
        index.push(`- [${title}](./${encodePathSegment(outputName)})`);
        console.log(`skipped existing: ${filename}`);
        continue;
      }
    } catch {
      // Fall through and regenerate this document.
    }
  }

  await rm(join(assetRoot, docDirName), { recursive: true, force: true });
  const pageCount = pageCountOf(sourcePath);
  const rawText = run('pdftotext', ['-layout', '-enc', 'UTF-8', sourcePath, '-']);
  const pageTexts = rawText.split(/\f/g).slice(0, pageCount).map(normalizePageText);
  const embeddedImages = await extractEmbeddedImages(sourcePath, embeddedDir);
  const imagesByPage = new Map();

  for (const image of embeddedImages) {
    const images = imagesByPage.get(image.page) ?? [];
    images.push(image);
    imagesByPage.set(image.page, images);
  }

  const pageSections = [];
  let fallbackCount = 0;

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const text = pageTexts[pageNumber - 1] ?? '';
    const images = imagesByPage.get(pageNumber) ?? [];
    const section = [`## 第 ${pageNumber} 页`, ''];

    if (text) section.push(text, '');
    for (const image of images) {
      const relativePath = `./assets/${encodePathSegment(docDirName)}/embedded/${image.filename}`;
      section.push(`![第 ${pageNumber} 页图片 ${image.num}](${relativePath})`, '');
    }

    if (!text && images.length === 0) {
      const fallbackName = await renderFallbackPage(sourcePath, fallbackDir, pageNumber);
      const relativePath = `./assets/${encodePathSegment(docDirName)}/fallback-pages/${fallbackName}`;
      section.push(`![第 ${pageNumber} 页原图（文字层缺失）](${relativePath})`, '');
      fallbackCount += 1;
    }

    pageSections.push(section.join('\n').trim());
  }

  const content = [
    `# ${title}`,
    '',
    `> 来源 PDF：${filename}`,
    `> 页数：${pageCount}`,
    `> 内嵌图片：${embeddedImages.length}`,
    `> 文字层缺失兜底页图：${fallbackCount}`,
    '',
    pageSections.join('\n\n---\n\n'),
    '',
  ].join('\n');

  await writeFile(outputPath, content, 'utf8');
  index.push(`- [${title}](./${encodePathSegment(outputName)})`);
  console.log(`converted clean markdown: ${filename} (${pageCount} pages, ${embeddedImages.length} images, ${fallbackCount} fallbacks)`);
}

await writeFile(join(outputDir, 'README.md'), `${index.join('\n')}\n`, 'utf8');
console.log(`done: ${entries.length} PDFs -> ${outputDir}`);
