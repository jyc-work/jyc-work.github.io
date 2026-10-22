import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const schema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  source: z.string().url().optional(),
  kind: z.enum(['engineering-case','incident-analysis']).optional(),
  verification: z.enum(['source-reviewed','runtime-tested','externally-reproduced']).optional(),
  repository: z.string().url().optional(),
  revision: z.string().regex(/^[0-9a-f]{40}$/).optional(),
  evidence: z.array(z.string().url()).optional()
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema
});

const blogEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog-en' }),
  schema
});

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/knowledge' }),
  schema
});

const commands = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/commands' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['系统与终端','容器与编排','大数据组件','数据库与 SQL','版本控制']),
    order: z.number().int(),
    keywords: z.array(z.string()).default([]),
    updated: z.coerce.date(),
    source: z.string().url()
  })
});

export const collections = { blog, blogEn, knowledge, commands };
