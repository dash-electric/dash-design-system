// @dash/registry-schema — shared registry types
//
// PRIMARY (single source of truth): runtime zod schemas in `./zod-schemas`.
// Use these at fetch / parse boundaries to runtime-validate untrusted JSON.
// The inferred TS types (`RegistryItem`, `RegistryItemFile`, etc.) are
// re-exported below.
//
// Legacy stub types (kept as `*Stub` aliases for any external imports that
// existed before runtime validation landed) are exported with a deprecation
// tag. New code should import from `./zod-schemas` directly.

export * from './zod-schemas.js';

/** @deprecated Use `RegistryItemType` from `./zod-schemas`. */
export type RegistryItemKindStub =
  | 'registry:ui'
  | 'registry:component'
  | 'registry:block'
  | 'registry:hook'
  | 'registry:lib';

/** @deprecated Use `RegistryItemKindStub` (renamed for collision avoidance). */
export type RegistryItemKind = RegistryItemKindStub;
