/**
 * @dash/registry-schema — runtime zod schemas
 *
 * Single source of truth for Dash registry item shape. TS types in
 * `./index.ts` are kept for backward compatibility but new code should
 * prefer `z.infer<typeof RegistryItemSchema>` from this file.
 *
 * Generated JSON Schema is committed at `schemas/registry-item.json` +
 * `schemas/registry.json` (see `scripts/generate-json-schema.ts`).
 */

// Pin to zod v4 surface explicitly. The default `zod` entry in v4.x still
// ships the v3-compatible API (for back-compat) — `toJSONSchema`, the
// `z.record(key, value)` 2-arg signature, and other v4 features live under
// `zod/v4`.
import { z } from "zod/v4"

/**
 * Registry item kinds. Mirrors shadcn naming + Dash extensions.
 * Values observed in apps/docs/registry.json (2026-05-20):
 *   registry:block, registry:component, registry:file, registry:hook,
 *   registry:lib, registry:page, registry:theme, registry:ui.
 * Extras kept for forward compat with shadcn upstream:
 *   registry:template, registry:pattern, registry:base.
 */
export const RegistryItemTypeSchema = z.enum([
  "registry:ui",
  "registry:component",
  "registry:block",
  "registry:template",
  "registry:page",
  "registry:pattern",
  "registry:hook",
  "registry:lib",
  "registry:file",
  "registry:base",
  "registry:theme",
])

export const RegistryItemFileSchema = z.object({
  path: z.string().min(1),
  type: RegistryItemTypeSchema,
  target: z.string().optional(),
  content: z.string().optional(),
})

/**
 * Per-item meta block. Dash adds layered architecture fields (layer,
 * theme, product). `.passthrough()` allows extra fields without strict
 * reject — registry can evolve forward without breaking older CLI
 * versions.
 */
export const RegistryItemMetaSchema = z
  .object({
    layer: z
      .union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
      .optional(),
    theme: z.string().optional(),
    product: z.string().optional(),
    alias_of: z.string().optional(),
    status: z.enum(["stable", "beta", "wip", "deprecated"]).optional(),
  })
  .passthrough()

export const RegistryItemSchema = z.object({
  $schema: z.string().optional(),
  name: z.string().min(1),
  type: RegistryItemTypeSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  files: z.array(RegistryItemFileSchema).optional(),
  registryDependencies: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  tailwind: z.any().optional(),
  cssVars: z
    .record(z.string(), z.record(z.string(), z.string()))
    .optional(),
  css: z.string().optional(),
  meta: RegistryItemMetaSchema.optional(),
})

export const RegistryIndexEntrySchema = z.object({
  name: z.string().min(1),
  type: RegistryItemTypeSchema,
  title: z.string().optional(),
  description: z.string().optional(),
})

export const RegistryIndexSchema = z.object({
  name: z.string(),
  homepage: z.string(),
  items: z.array(RegistryIndexEntrySchema),
})

export const RegistrySchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  homepage: z.string(),
  items: z.array(RegistryItemSchema),
})

// ── Inferred types — prefer these over hand-written TS in ./index.ts ──
export type RegistryItemType = z.infer<typeof RegistryItemTypeSchema>
export type RegistryItemFile = z.infer<typeof RegistryItemFileSchema>
export type RegistryItemMeta = z.infer<typeof RegistryItemMetaSchema>
export type RegistryItem = z.infer<typeof RegistryItemSchema>
export type RegistryIndexEntry = z.infer<typeof RegistryIndexEntrySchema>
export type RegistryIndex = z.infer<typeof RegistryIndexSchema>
export type Registry = z.infer<typeof RegistrySchema>
