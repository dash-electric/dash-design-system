/**
 * Registry schema types — mirrors Dash DS registry.json shape.
 */

export type RegistryFile = {
  path: string
  type: string
  target?: string
  content?: string
}

export type RegistryItem = {
  $schema?: string
  name: string
  type: string
  title: string
  description: string
  files?: RegistryFile[]
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  cssVars?: Record<string, Record<string, string>>
  css?: string
  categories?: string[]
  meta?: Record<string, unknown>
}

export type Registry = {
  $schema: string
  name: string
  homepage: string
  items: RegistryItem[]
}

export type RegistryIndex = {
  name: string
  homepage: string
  items: Array<{
    name: string
    type: string
    title: string
    description: string
  }>
}

export type ComponentsJson = {
  $schema?: string
  style?: string
  rsc?: boolean
  tsx?: boolean
  /**
   * Layer-2 Dash theme (`ride` | `logistic` | `travel` | `marketplace` |
   * `trellis-tenant`). Optional — when absent the CLI falls back to "ride"
   * for backward compatibility. Set by `dashkit init --theme <x>` or by hand.
   */
  dashTheme?: string
  tailwind?: {
    config?: string
    css?: string
    baseColor?: string
    cssVariables?: boolean
  }
  aliases?: {
    components?: string
    utils?: string
    ui?: string
    lib?: string
    hooks?: string
  }
  registries?: Record<
    string,
    {
      url: string
      headers?: Record<string, string>
    }
  >
}

export function validateRegistryItem(item: unknown): asserts item is RegistryItem {
  if (!item || typeof item !== "object") {
    throw new Error("Invalid registry item: not an object")
  }
  const i = item as Record<string, unknown>
  if (typeof i.name !== "string") throw new Error("Invalid registry item: name required")
  if (typeof i.type !== "string") throw new Error("Invalid registry item: type required")
  if (typeof i.title !== "string") throw new Error(`Invalid registry item ${i.name}: title required`)
  if (typeof i.description !== "string")
    throw new Error(`Invalid registry item ${i.name}: description required`)
}
