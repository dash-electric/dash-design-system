/**
 * Public skill chain entry — used by the daemon HTTP layer and by Agent C / F
 * integration code.
 */

export {
  generateWithSkillChain,
  DEFAULT_MODEL_ID,
  MODEL_TIERS,
  modelForStep,
} from "./chain.js"
export {
  readGstackSkill,
  type SkillReadResult,
  type GstackSkillName,
  type ReadGstackSkillOptions,
} from "./skill-reader.js"
export {
  clarifyWithSkill,
  type LlmClarifyInput,
  type LlmClarifyOutput,
  type CeoMode,
} from "./clarify-llm.js"
export { evaluatePromptScope, countPrdSectionsTouched } from "./prd-evaluator.js"
export { loadDesignContext, findRepoRoot } from "./design-loader.js"
export { loadSkillContext } from "./skill-loader.js"
export {
  composeSystemPrompt,
  inferRepoContextPack,
  renderPrd,
  BANNED_IMPORTS,
  DS_FIRST_DIRECTIVE_BLOCK,
  VOICE_REGISTER_BLOCK,
} from "./prompt-composer.js"
export {
  synthesizePrd,
  writePrdSnapshot,
  fallbackPrd,
  detectLang,
  extractFirstJsonObject,
  type SynthesizePrdInput,
  type SynthesizePrdClassification,
} from "./prd-synthesizer.js"
export {
  loadDSContext,
  parseRegistry,
  renderDSCatalogBlock,
  truncateGlossary,
  hasRegistry,
} from "./ds-catalog-loader.js"
export { parseResponse, extractText, isSafePath, parseFenceHeader } from "./response-parser.js"
export { validateOutput } from "./validator.js"
export { reviewDesignCoverage } from "./design-review.js"
export { runDashQa, type RunDashQaInput } from "./qa.js"
export { introspectRepo } from "./repo-introspector.js"
export {
  detectOutputMode,
  shouldEditExisting,
  describeOutputMode,
  type OutputMode,
} from "./output-mode-detector.js"

export type {
  GenerateInput,
  GenerateResult,
  ChainDeps,
  AnthropicLike,
  PRDEval,
  PRDEvalInput,
  DashPRD,
  PrdSeed,
  DesignContext,
  FoundationManifest,
  SkillContext,
  RepoContextPack,
  RepoSurface,
  DashTheme,
  ParsedFile,
  ParsedPatch,
  ParsedOutput,
  ParsedResponse,
  ValidationError,
  ValidationResult,
  ValidationSeverity,
  RepoIntrospection,
  ExistingFileContent,
  ExistingFilesContext,
  PathResolution,
  DSContext,
  DSCatalog,
  DSCatalogAtom,
  LoadDSContextOpts,
  DesignReviewResult,
  QaIssue,
  QaResult,
  QaSeverity,
} from "./types.js"
