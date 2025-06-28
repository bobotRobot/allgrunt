// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const technologies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    date: z.date()
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    status: z.string(),
    image: z.string()
  })
});

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().pipe(z.coerce.date()),
    imageSrc: z.string().optional(),
    imageAlt: z.string().optional()
  }),
});

const equipment = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    pricePerDay: z.number(),
    pricePerHour: z.number().optional(),
    specifications: z.object({
      power: z.string().optional(),
      weight: z.string().optional(),
      workingWidth: z.string().optional(),
      capacity: z.string().optional(),
    }).optional(),
    features: z.array(z.string()).optional(),
    image: z.string(),
    available: z.boolean().default(true)
  }),
});

export const collections = {
  'technologies': technologies,
  'projects': projects,
  'articles': articles,
  'equipment': equipment
};