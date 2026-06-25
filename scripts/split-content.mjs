import { readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'Mi姐.md');
const outputRoot = resolve(root, 'src/content/lessons');
const args = new Set(process.argv.slice(2));

if (args.has('--help') || args.has('-h')) {
  console.log([
    '用法:',
    '  npm run content:build           # 不切分，只提示当前维护方式',
    '  npm run content:split           # 从 Mi姐.md 重新切分并覆盖 lessons',
    '  npm run content:build -- --split',
    '',
    '注意: --split 会删除并重建 src/content/lessons/ 和 src/data/lesson-manifest.json。',
  ].join('\n'));
  process.exit(0);
}

if (!args.has('--split')) {
  console.log([
    '已跳过内容切分。',
    '当前推荐直接维护 src/content/lessons/ 下的小文件。',
    '如需从 Mi姐.md 重新切分并覆盖生成内容，请运行: npm run content:split',
  ].join('\n'));
  process.exit(0);
}

const source = await readFile(sourcePath, 'utf8');

const chapterPattern = /^# 第([一二三四五六七八九十]+)章[：:](.+)$/gm;
const sectionPattern = /^## 【(.+?)】\s*$/gm;
const chineseNumbers = new Map([
  ['一', 1], ['二', 2], ['三', 3], ['四', 4], ['五', 5],
  ['六', 6], ['七', 7], ['八', 8], ['九', 9], ['十', 10],
]);

const chapterMatches = [...source.matchAll(chapterPattern)];
if (chapterMatches.length === 0) throw new Error('没有在 Mi姐.md 中找到章节标题。');

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

let globalOrder = 0;
const manifest = [];

const cleanVisibleText = (value) => value
  .replaceAll('—', '-')
  .replaceAll('–', '-')
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/^#{1,6}\s+/gm, '')
  .replace(/^[-*+]\s+/gm, '')
  .replace(/\s+/g, ' ')
  .trim();

const quote = (value) => JSON.stringify(value);

// Promote only strong, repeatable outline signals. This keeps prose unchanged while
// turning existing section labels into semantic headings for navigation and accessibility.
const structureBody = (value) => {
  let normalizeOutput = false;
  let structured = value
    .replace(/^([一二三四五六七八九十百]+、\s*[^.!?。！？\r\n]{2,48})\r?$/gm, '## $1')
    .replace(/^(\d+[.、]\s*[^.!?。！？\r\n]{2,60})\r?\n(?=(?:\s*\r?\n)*\s*[-*+]\s+)/gm, '### $1\n');

  const numberedColonHeading = /^(\d+[.、]\s*[^：:\r\n]{2,70})[：:]\s*(.+)\r?$/gm;
  if ([...structured.matchAll(numberedColonHeading)].length >= 3) {
    normalizeOutput = true;
    structured = structured.replace(numberedColonHeading, '## $1\n\n$2');
  }

  const numberedStandaloneHeading = /^(\d+[.、]\s*[^.!?。！？\r\n]{2,72})\r?$/gm;
  if ([...structured.matchAll(numberedStandaloneHeading)].length >= 3) {
    normalizeOutput = true;
    structured = structured.replace(numberedStandaloneHeading, '## $1');
  }

  const waveHeading = /^((?:五浪上涨（推动浪）)?第[一二三四五]浪（[^）]+）|三浪调整（修正浪）A\s*浪（[^）]+）|[BC]\s*浪（[^）]+）)\r?$/gm;
  if ([...structured.matchAll(waveHeading)].length >= 4) {
    normalizeOutput = true;
    structured = structured.replace(waveHeading, '## $1');
  }

  const ordinalPoint = /^(第[一二三四五六七八九十百]+、?[，、])([^.!?。！？\r\n]{2,44})。(.+)\r?$/gm;
  if ([...structured.matchAll(ordinalPoint)].length >= 2) {
    structured = structured.replace(ordinalPoint, '## $1$2\n\n$3');
  }

  const hasSequentialLongForm = /首先是[^。]{2,36}。/.test(structured)
    && /其次是[^。]{2,36}。/.test(structured)
    && /第三是[^。]{2,36}。/.test(structured);
  if (hasSequentialLongForm) {
    normalizeOutput = true;
    structured = structured
      .replace(/(^|。)(首先是[^。]{2,36})。/g, '$1\n\n## $2\n\n')
      .replace(/(^|。)(其次是[^。]{2,36})。/g, '$1\n\n## $2\n\n')
      .replace(/(^|。)(第三是[^。]{2,36})。/g, '$1\n\n## $2\n\n')
      .replace(/(^|。)(当然，[^。]{2,40}风险)。(首先是)/g, '$1\n\n## $2\n\n$3')
      .replace(/(^|。)(总体而言，[^。]{2,40})。/g, '$1\n\n## $2\n\n');
  }

  const embeddedMindsetHeadings = [
    '技术只是基础，心态才是灵魂',
    '盈亏面前的心态，决定了交易的成败',
    '交易的修行，是与自己的较量',
    '心态的力量，决定了交易的高度',
  ];
  if (embeddedMindsetHeadings.filter((heading) => structured.includes(heading)).length >= 3) {
    normalizeOutput = true;
    for (const heading of embeddedMindsetHeadings) {
      structured = structured.replace(heading, `\n\n## ${heading}\n\n`);
    }
  }

  return normalizeOutput ? structured.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/[ \t]+$/gm, '') : structured;
};

for (let chapterIndex = 0; chapterIndex < chapterMatches.length; chapterIndex += 1) {
  const chapterMatch = chapterMatches[chapterIndex];
  const chapterNumber = chineseNumbers.get(chapterMatch[1]);
  const chapterTitle = chapterMatch[2].trim();
  const chapterStart = chapterMatch.index + chapterMatch[0].length;
  const chapterEnd = chapterMatches[chapterIndex + 1]?.index ?? source.length;
  const chapterSource = source.slice(chapterStart, chapterEnd);
  const sectionMatches = [...chapterSource.matchAll(sectionPattern)];
  const chapterFolder = `chapter-${chapterNumber}`;
  await mkdir(resolve(outputRoot, chapterFolder), { recursive: true });

  for (let sectionIndex = 0; sectionIndex < sectionMatches.length; sectionIndex += 1) {
    const sectionMatch = sectionMatches[sectionIndex];
    const title = cleanVisibleText(sectionMatch[1]);
    const bodyStart = sectionMatch.index + sectionMatch[0].length;
    const bodyEnd = sectionMatches[sectionIndex + 1]?.index ?? chapterSource.length;
    const body = chapterSource.slice(bodyStart, bodyEnd).trim()
      .replaceAll('—', '-')
      .replaceAll('–', '-');
    const structuredBody = structureBody(body);
    const description = cleanVisibleText(body).slice(0, 110);
    const chapterOrder = sectionIndex + 1;
    globalOrder += 1;
    const lessonId = String(chapterOrder).padStart(3, '0');
    const id = `${chapterFolder}/${lessonId}`;
    const frontmatter = [
      '---',
      `title: ${quote(title)}`,
      `description: ${quote(description)}`,
      `chapter: ${chapterNumber}`,
      `chapterTitle: ${quote(chapterTitle)}`,
      `order: ${globalOrder}`,
      `chapterOrder: ${chapterOrder}`,
      '---',
      '',
    ].join('\n');
    await writeFile(resolve(outputRoot, chapterFolder, `${lessonId}.md`), `${frontmatter}${structuredBody}\n`, 'utf8');
    manifest.push({ id, title, chapter: chapterNumber, chapterTitle, order: globalOrder, chapterOrder, description });
  }
}

await writeFile(resolve(root, 'src/data/lesson-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`已从 Mi姐.md 生成 ${manifest.length} 篇教程。`);
