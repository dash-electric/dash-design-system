/**
 * Intake layer — runs before the skill chain to make generation BE-aware.
 *
 * Modules:
 *   - be-endpoint-catalog : scan Next Pages / Next App / Express routes
 *   - db-schema-reader    : parse Prisma / Drizzle / SQL migrations
 *   - scenario-classifier : pick one of six change shapes
 *   - audit-trail-enforcer: enforce CR-3 (audit log for legal/financial fields)
 *
 * Wiring docs: see INTEGRATION-TODO.md in this folder.
 */

export {
  scanBeCatalog,
  type BeCatalog,
  type EndpointEntry,
  type Framework,
  type CatalogFramework,
} from "./be-endpoint-catalog.js"

export {
  readDbSchema,
  type DbCatalog,
  type TableSchema,
  type ColumnSchema,
  type RelationSchema,
  type DbSource,
} from "./db-schema-reader.js"

export {
  classifyPrompt,
  type Scenario,
  type ClassificationResult,
  type ClassificationContext,
} from "./scenario-classifier.js"

export {
  checkAuditTrailRequired,
  type AuditTrailRequirement,
  type AuditTrailPattern,
} from "./audit-trail-enforcer.js"

export {
  readFePatterns,
  extractKeywords,
  scoreFilename,
  type FePattern,
  type ReadFePatternsInput,
  type ReadFePatternsOptions,
} from "./read-fe-patterns.js"

export {
  detectMode,
  type ProjectMode,
  type ModeDetectionInput,
  type ModeDetectionResult,
} from "./mode-detector.js"
