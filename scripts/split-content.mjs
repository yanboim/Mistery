import { readFile, readdir, rm, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'M姐.md');
const outputRoot = resolve(root, 'src/content/lessons');
const source = await readFile(sourcePath, 'utf8');

const chapterPattern = /^# 第([一二三四五六七八九十]+)章[：:](.+)$/gm;
const sectionPattern = /^## 【(.+?)】\s*$/gm;
const chineseNumbers = new Map([
  ['一', 1], ['二', 2], ['三', 3], ['四', 4], ['五', 5],
  ['六', 6], ['七', 7], ['八', 8], ['九', 9], ['十', 10],
]);

const chapterMatches = [...source.matchAll(chapterPattern)];
if (chapterMatches.length === 0) throw new Error('没有在 M姐.md 中找到章节标题。');

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
    await writeFile(resolve(outputRoot, chapterFolder, `${lessonId}.md`), `${frontmatter}${body}\n`, 'utf8');
    manifest.push({ id, title, chapter: chapterNumber, chapterTitle, order: globalOrder, chapterOrder, description });
  }
}

await writeFile(resolve(root, 'src/data/lesson-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`已从 M姐.md 生成 ${manifest.length} 篇教程。`);
