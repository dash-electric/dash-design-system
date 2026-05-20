/**
 * Generate JSON Schema artifacts from zod-schemas for distribution.
 * Outputs:
 *   - schemas/registry-item.json
 *   - schemas/registry.json
 *
 * Run via: `pnpm -F @dash/registry-schema generate:json-schema`
 *
 * Generated files SHOULD be committed — consumers (docs site, external
 * IDE plugins) may fetch them via raw URL without installing the
 * package.
 *
 * Note: uses zod v4's native `z.toJSONSchema` (NOT `zod-to-json-schema`,
 * which targets zod v3 internals and emits empty output against v4).
 */
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod/v4"
import {
  RegistryItemSchema,
  RegistrySchema,
} from "../src/zod-schemas.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, "..", "schemas")
mkdirSync(outDir, { recursive: true })

const itemSchema = z.toJSONSchema(RegistryItemSchema)
const registrySchema = z.toJSONSchema(RegistrySchema)

writeFileSync(
  resolve(outDir, "registry-item.json"),
  JSON.stringify(itemSchema, null, 2) + "\n",
)
writeFileSync(
  resolve(outDir, "registry.json"),
  JSON.stringify(registrySchema, null, 2) + "\n",
)

console.log("Generated:")
console.log(`  ${resolve(outDir, "registry-item.json")}`)
console.log(`  ${resolve(outDir, "registry.json")}`)
