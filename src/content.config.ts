import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const quizzes = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/quizzes' }),
  schema: z.object({
    // Metadata
    title: z.string(),
    titleEn: z.string(),
    description: z.string(),
    descriptionEn: z.string(),
    emoji: z.string(),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),

    // SEO
    ogTitle: z.string(),
    ogDescription: z.string(),
    ogImage: z.string().optional(),

    // Quiz settings
    estimatedMinutes: z.number().int().positive(),
    publishedAt: z.string(),
    isPublished: z.boolean().default(true),

    // Result types
    resultTypes: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        title: z.string(),
        description: z.string(),
        personality: z.string(),
        strengths: z.array(z.string()),
        cta: z.string(),
        shareText: z.string(),
      })
    ).min(2),

    // Questions
    questions: z.array(
      z.object({
        id: z.string(),
        question: z.string(),
        options: z.array(
          z.object({
            text: z.string(),
            scores: z.record(z.string(), z.number()),
          })
        ).min(2).max(8),
        isMeta: z.boolean().optional(),
        weightBonus: z.number().optional(),
      })
    ).min(3),

    // Tiebreaker priority order
    tiebreakerOrder: z.array(z.string()).min(2),
  }),
});

export const collections = { quizzes };
