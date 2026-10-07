import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One Markdown file per case study. Each file builds the /projects/<slug>
// page and a slide in the home page carousel, ordered by `order`.
const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    order: z.number(),
    role: z.string(),
    timeline: z.string(),
    year: z.string(),
    overview: z.string(),
    challenge: z.string(),
    cover: z.string(),
    coverAlt: z.string(),
    showcase: z.string(),
    showcaseAlt: z.string(),
    // Optional looping clip shown instead of the showcase image (image is the poster).
    showcaseVideo: z.string().optional(),
    heroImage: z.string(),
    heroAlt: z.string(),
    // Optional looping clip for the carousel slide (heroImage is the poster).
    heroVideo: z.string().optional(),
  }),
});

// One Markdown file per side project. Each file builds a card in the Side
// projects grid and a /side-projects/<slug> page, ordered by `order`. Kept out
// of `projects` so side projects never appear in the carousel.
const sideProjects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/side-projects" }),
  schema: z.object({
    title: z.string(),
    caption: z.string(),
    date: z.string(),
    order: z.number(),
    image: z.string(),
    alt: z.string(),
    links: z.array(z.object({ title: z.string(), url: z.string() })).default([]),
    todo: z.string().optional(),
  }),
});

export const collections = { projects, sideProjects };
