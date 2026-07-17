import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docs = defineCollection({
  loader: glob({ base: "./src/content/docs", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["Getting Started", "Build System", "Running JARVIS", "Reference"]),
    order: z.number(),
  }),
});

export const collections = { docs };
