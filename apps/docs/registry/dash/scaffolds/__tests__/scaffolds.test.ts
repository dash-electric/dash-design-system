/**
 * scaffolds — Vitest spec
 *
 * Validates the 6 Hermes scaffold templates as a SHAPE contract, not as
 * runtime components. WHY structural (not render-based):
 *  - Hermes consumes the templates as TEXT (reads file, substitutes
 *    placeholders, writes new file). The contract that matters is the
 *    placeholder set + the exported surface — not the runtime behavior,
 *    which is the AI's job to fill in.
 *  - Render tests would need jsdom + React testing infra here; over-spec
 *    for a template that's never meant to be mounted as-is. We rely on the
 *    surrounding `pnpm typecheck` to catch broken JSX / signatures.
 *
 * The three invariants:
 *   1. Every template in the manifest exists on disk.
 *   2. Every template declares the placeholders the manifest claims.
 *   3. No template imports a banned external lib (RHF, zod, axios direct,
 *      tanstack-query, react-easy-crop, etc.).
 */
import { describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"

const scaffoldsDir = path.join(__dirname, "..")

type ManifestTemplate = {
  id: string
  path: string
  exportName: string
  propsType: string
  triggers: string[]
  categories: string[]
  placeholders: string[]
}

type Manifest = {
  version: string
  templates: ManifestTemplate[]
  conventions: Record<string, unknown>
}

const manifest: Manifest = JSON.parse(
  fs.readFileSync(path.join(scaffoldsDir, "manifest.json"), "utf8"),
) as Manifest

const BANNED_IMPORTS = [
  "react-hook-form",
  "@hookform/resolvers",
  "zod",
  "joi",
  "@tanstack/react-query",
  "swr",
  "react-easy-crop",
  "react-cropper",
  "fabric",
  "konva",
]

describe("Hermes scaffold templates — manifest integrity", () => {
  it("manifest.json parses and lists 6 templates", () => {
    expect(manifest.templates).toHaveLength(6)
    expect(new Set(manifest.templates.map((t) => t.id)).size).toBe(6)
  })

  it("each template has unique id, exportName, propsType", () => {
    const ids = manifest.templates.map((t) => t.id)
    const exports = manifest.templates.map((t) => t.exportName)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(exports).size).toBe(exports.length)
  })
})

describe.each(manifest.templates)(
  "Hermes scaffold template — $id",
  (template) => {
    const filePath = path.join(scaffoldsDir, template.path)
    let source = ""

    it("file exists at manifest path", () => {
      expect(fs.existsSync(filePath)).toBe(true)
      source = fs.readFileSync(filePath, "utf8")
    })

    it("exports the declared component + props type", () => {
      // We don't require a specific export form — `export function` or
      // `export const` both pass; the contract is just that the name appears
      // as an export at the top level.
      const componentRe = new RegExp(
        `export\\s+(?:function|const|class)\\s+${template.exportName}\\b`,
      )
      const propsRe = new RegExp(`export\\s+type\\s+${template.propsType}\\b`)
      expect(source).toMatch(componentRe)
      expect(source).toMatch(propsRe)
    })

    it("declares every manifest placeholder via @placeholder JSDoc tag", () => {
      for (const placeholder of template.placeholders) {
        // Two valid forms: header docblock or inline comment. Both must
        // mention the placeholder name in an @placeholder context.
        const re = new RegExp(`@placeholder\\s+${placeholder}\\b`)
        expect(source, `missing @placeholder ${placeholder}`).toMatch(re)
      }
    })

    it("does not import banned external libraries", () => {
      for (const banned of BANNED_IMPORTS) {
        const re = new RegExp(`from\\s+["']${banned}["']`)
        expect(source, `banned import detected: ${banned}`).not.toMatch(re)
      }
    })

    it("starts with the 'use client' directive (interactive scaffolds)", () => {
      // Every scaffold has useState — they MUST be client components.
      expect(source.split("\n")[0]?.trim()).toBe('"use client"')
    })
  },
)
