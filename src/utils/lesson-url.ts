import type { CollectionEntry } from 'astro:content';
import { pinyin } from 'pinyin-pro';

type LessonEntry = CollectionEntry<'lessons'>;

const HAN_RE = /\p{Script=Han}+/gu;

export const getLessonOrderPrefix = (lesson: Pick<LessonEntry, 'data'>) =>
  String(lesson.data.chapterOrder).padStart(3, '0');

export const getLessonStableId = (lesson: Pick<LessonEntry, 'data'>) =>
  `chapter-${lesson.data.chapter}/${getLessonOrderPrefix(lesson)}`;

const slugifyText = (value: string) => {
  const transliterated = value.replace(HAN_RE, (match) =>
    pinyin(match, { toneType: 'none', type: 'array' }).join(' ')
  );

  return transliterated
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
};

export const getLessonSemanticSlug = (lesson: Pick<LessonEntry, 'data'>) =>
  slugifyText(lesson.data.slug?.trim() || lesson.data.title) || 'lesson';

export const getLessonSlug = (lesson: Pick<LessonEntry, 'data'>) =>
  `${getLessonOrderPrefix(lesson)}-${getLessonSemanticSlug(lesson)}`;

export const getLessonSourcePath = (lesson: Pick<LessonEntry, 'data'>) =>
  `chapter-${lesson.data.chapter}/${getLessonSlug(lesson)}`;

export const getLessonURL = (lesson: Pick<LessonEntry, 'id' | 'data'>) =>
  `/tutorial/chapter-${lesson.data.chapter}/${getLessonSlug(lesson)}`;

export const getLegacyLessonURL = (lesson: Pick<LessonEntry, 'data'>) =>
  `/tutorial/${getLessonStableId(lesson)}`;

export const isCanonicalLessonPath = (lesson: Pick<LessonEntry, 'id' | 'data'>, id: string) =>
  id === `chapter-${lesson.data.chapter}/${getLessonSlug(lesson)}`;
