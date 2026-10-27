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

const enBlog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/en-blog' }),
  schema: schema.extend({
    kind: z.enum(['engineering-case', 'incident-analysis']),
    verification: z.enum(['source-reviewed', 'runtime-tested', 'externally-reproduced']),
    repository: z.string().url(),
    revision: z.string().regex(/^[0-9a-f]{40}$/),
    evidence: z.array(z.string().url()).min(2),
    zhSlug: z.string().min(1)
  })
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

const tutorials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tutorials' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    track: z.enum(['llm-engineering','agent-engineering','java-backend','data-engineering','fullstack','software-architecture']),
    order: z.number().int().nonnegative(),
    level: z.enum(['入门','进阶','综合']),
    duration: z.string(),
    tags: z.array(z.string()).default([]),
    source: z.string().url().optional(),
    draft: z.boolean().default(false)
  })
});

export const collections = { blog, enBlog, knowledge, commands, tutorials };
