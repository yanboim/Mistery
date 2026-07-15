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

const mediaFile = z.object({
  src: z.string(),
  title: z.string().optional(),
  duration: z.string().optional(),
  poster: z.string().optional(),
  captions: z.string().optional(),
});

const reviews = defineCollection({
  loader: glob({ base: './src/content/reviews', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    slug: z.string(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    media: z
      .object({
        audio: mediaFile.optional(),
        video: mediaFile.optional(),
      })
      .optional(),
    transcript: z
      .object({
        type: z.enum(['srt', 'text', 'vtt']).default('srt'),
        src: z.string(),
      })
      .optional(),
    source: z
      .object({
        label: z.string(),
        href: z.string(),
      })
      .optional(),
  }),
});

export const collections = { lessons, reviews };
