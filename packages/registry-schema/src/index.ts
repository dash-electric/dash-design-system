// @dash/registry-schema — shared registry types
// Phase 0 stub. Real schemas land when extracted from apps/docs/registry.json + scripts/build-registry.ts.

export type RegistryItemKind =
  | 'registry:ui'
  | 'registry:component'
  | 'registry:block'
  | 'registry:hook'
  | 'registry:lib';

export interface RegistryItemFile {
  path: string;
  type: RegistryItemKind;
  target?: string;
}

export interface RegistryItem {
  name: string;
  type: RegistryItemKind;
  registryDependencies?: string[];
  dependencies?: string[];
  devDependencies?: string[];
  files?: RegistryItemFile[];
  tailwind?: Record<string, unknown>;
  cssVars?: Record<string, Record<string, string>>;
  meta?: Record<string, unknown>;
}

export interface RegistryIndexEntry {
  name: string;
  type: RegistryItemKind;
  description?: string;
}
