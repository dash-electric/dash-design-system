/**
 * Public skill chain entry — used by the daemon HTTP layer and by Agent C / F
 * integration code.
 */

export { generateWithSkillChain, DEFAULT_MODEL_ID } from "./chain.js"
export { evaluatePromptScope, countPrdSectionsTouched } from "./prd-evaluator.js"
export { loadDesignContext, findRepoRoot } from "./design-loader.js"
export { loadSkillContext } from "./skill-loader.js"
export { composeSystemPrompt, inferRepoContextPack, BANNED_IMPORTS } from "./prompt-composer.js"
export { parseResponse, extractText, isSafePath } from "./response-parser.js"
export { validateOutput } from "./validator.js"

export type {
  GenerateInput,
  GenerateResult,
  ChainDeps,
  AnthropicLike,
  PRDEval,
  PRDEvalInput,
  DesignContext,
  FoundationManifest,
  SkillContext,
  RepoContextPack,
  RepoSurface,
  DashTheme,
  ParsedFile,
  ParsedResponse,
  ValidationError,
  ValidationResult,
  ValidationSeverity,
} from "./types.js"
