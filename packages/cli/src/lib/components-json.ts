/**
 * components.json read/write + alias resolution for path mapping.
 */
import fs from "node:fs"
import path from "node:path"
import type { ComponentsJson } from "./schema.js"

export const COMPONENTS_JSON = "components.json"
export const DEFAULT_REGISTRY_URL =
  process.env.DASH_REGISTRY_URL ?? "http://localhost:3000"

export function readComponentsJson(cwd: string = process.cwd()): ComponentsJson | null {
  const file = path.join(cwd, COMPONENTS_JSON)
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as ComponentsJson
  } catch (err) {
    throw new Error(`Failed to parse components.json: ${(err as Error).message}`)
  }
}

export function writeComponentsJson(
  config: ComponentsJson,
  cwd: string = process.cwd(),
): void {
  const file = path.join(cwd, COMPONENTS_JSON)
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n", "utf-8")
}

export function defaultComponentsJson(opts: {
  registryUrl: string
  tsx: boolean
  rsc: boolean
}): ComponentsJson {
  return {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "default",
    rsc: opts.rsc,
    tsx: opts.tsx,
    tailwind: {
      config: "",
      css: "app/globals.css",
      baseColor: "neutral",
      cssVariables: true,
    },
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    },
    registries: {
      "@dash": {
        url: opts.registryUrl,
        headers: {
          Authorization: "Bearer ${DASH_REGISTRY_TOKEN}",
        },
      },
    },
  }
}

/**
 * Resolve a registry file's `target` (or fall back to `path`) against the
 * consumer's alias config. e.g. `components/ui/button.tsx` → `<aliases.ui>/button.tsx`.
 */
export function resolveTargetPath(
  file: { path: string; target?: string; type: string },
  config: ComponentsJson | null,
  cwd: string,
): string {
  // Prefer explicit target
  let target = file.target ?? file.path

  // Strip leading "registry/<dash>/" prefix if present (build-time source layout)
  target = target.replace(/^registry\/[^/]+\//, "")

  // Alias substitution for shadcn-style "@/..." or alias-prefixed paths
  const aliases = config?.aliases ?? {}
  for (const [key, alias] of Object.entries(aliases)) {
    if (!alias) continue
    const prefix = alias.replace(/^@\//, "") + "/"
    // Resolve `ui/button.tsx` → aliases.ui + "/button.tsx"
    if (key === "ui" && target.startsWith("ui/")) {
      return path.join(cwd, prefix, target.slice(3))
    }
    if (key === "components" && target.startsWith("components/")) {
      return path.join(cwd, prefix, target.slice("components/".length))
    }
    if (key === "lib" && target.startsWith("lib/")) {
      return path.join(cwd, prefix, target.slice("lib/".length))
    }
    if (key === "hooks" && target.startsWith("hooks/")) {
      return path.join(cwd, prefix, target.slice("hooks/".length))
    }
  }

  // Default: resolve target relative to cwd
  return path.join(cwd, target)
}
