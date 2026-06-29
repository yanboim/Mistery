import { getCollection } from 'astro:content';
import { chapters } from '../data/chapters';
import { compareLessons, getLessonURL } from '../utils/lesson-url';

export async function GET() {
  const lessons = (await getCollection('lessons')).sort(compareLessons);
  const chapterTitles = new Map(chapters.map((chapter) => [chapter.number, chapter.title]));
  return new Response(JSON.stringify(lessons.map((lesson) => ({
    title: lesson.data.title,
    chapterTitle: chapterTitles.get(lesson.data.chapter) ?? '',
    description: lesson.data.description,
    content: lesson.body.replace(/[#*_>`\[\]()\-]/g, ' ').replace(/\s+/g, ' ').trim(),
    href: getLessonURL(lesson),
  }))), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
