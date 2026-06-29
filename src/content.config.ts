import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessons = defineCollection({
  loader: glob({ base: './src/content/lessons', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    chapter: z.number(),
    order: z.number(),
    slug: z.string().optional(),
  }),
});

export const collections = { lessons };
