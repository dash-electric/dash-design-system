/**
 * Schema types for the Dash registry payloads.
 *
 * The registry follows the shadcn-style registry-item shape with a few
 * Dash-specific extensions (categories, vertical, tokens block).
 */

export type RegistryItemType =
  | "registry:ui"
  | "registry:theme"
  | "registry:block"
  | "registry:template"
  | "registry:file"
  | "ui"
  | "theme"
  | "block"
  | "template"
  | "file";

export interface RegistryFile {
  path: string;
  content?: string;
  type?: string;
  target?: string;
}

export interface RegistryItemSummary {
  name: string;
  type: RegistryItemType;
  title?: string;
  description?: string;
  categories?: string[];
  vertical?: string;
}

export interface RegistryItem extends RegistryItemSummary {
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  cssVars?: Record<string, Record<string, string>>;
  tailwind?: Record<string, unknown>;
  files?: RegistryFile[];
  meta?: Record<string, unknown>;
  tokens?: Record<string, unknown>;
}

export interface RegistryIndex {
  items: RegistryItemSummary[];
  generatedAt?: string;
}

/**
 * Normalises the `type` field from the canonical "registry:ui" form to the
 * short form ("ui") that we expose to MCP clients.
 */
export function shortType(t: RegistryItemType): "ui" | "theme" | "block" | "template" | "file" {
  const raw = String(t).replace(/^registry:/, "");
  if (
    raw === "ui" ||
    raw === "theme" ||
    raw === "block" ||
    raw === "template" ||
    raw === "file"
  ) {
    return raw;
  }
  return "ui";
}
