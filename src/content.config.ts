import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { optionalGlob } from './lib/optional-glob';

const servicos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/servicos' }),
  schema: z.object({
    order: z.number(),
    slug: z.string(),
    nome: z.string(),
    frase: z.string(),
    entregas: z.array(z.string()),
  }),
});

const cases = defineCollection({
  loader: optionalGlob('cases'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      cliente: z.string(),
      capa: image(),
      imagens: z.array(image()),
      descricao: z.string(),
      desafio: z.string().optional(),
      solucao: z.string().optional(),
      resultado: z.string().optional(),
      data: z.coerce.date(),
    }),
});

const blog = defineCollection({
  loader: optionalGlob('blog'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      descricao: z.string(),
      capa: image(),
      capaAlt: z.string(),
      data: z.coerce.date(),
      autor: z.string(),
    }),
});

export const collections = { servicos, cases, blog };
