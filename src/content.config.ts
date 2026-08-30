import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { canonicalTagRegistry } from './data/tag-registry';

const canonicalTag = z.string().superRefine((value, context) => {
  try {
    canonicalTagRegistry.validateCanonicalId(value);
  } catch (error: unknown) {
    context.addIssue({
      code: 'custom',
      message: error instanceof Error ? error.message : 'Invalid canonical tag',
    });
  }
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(canonicalTag).default([]),
  }),
});

export const collections = { blog };
