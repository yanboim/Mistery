import { getCollection } from 'astro:content';

export async function GET() {
  const lessons = (await getCollection('lessons')).sort((a, b) => a.data.order - b.data.order);
  return new Response(JSON.stringify(lessons.map((lesson) => ({
    title: lesson.data.title,
    chapterTitle: lesson.data.chapterTitle,
    description: lesson.data.description,
    href: `/tutorial/${lesson.id}`,
  }))), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
