/**
 * Public surface of the clarification module — consumed by the daemon
 * (Agent B) and the skill chain (Agent E).
 */

export type {
  ClarificationAnswer,
  ClarificationQuestion,
  ClarificationQuestionType,
  ClarificationResult,
  ClarificationSession,
  ClarificationStatus,
} from "./types.js"

export {
  containsVague,
  evaluatePrompt,
  isLargeScope,
  mentionsData,
  mentionsLegalFinancial,
  mentionsMitra,
  mentionsSource,
  mentionsSurface,
} from "./evaluator.js"
export type { EvaluatorInput, EvaluatorOutput } from "./evaluator.js"

export { SessionStore } from "./session-store.js"
export type { SessionStoreOptions } from "./session-store.js"

export { registerClarificationRoutes } from "./api-routes.js"
export type { RegisterOptions } from "./api-routes.js"

export { renderClarificationForm } from "./form-renderer.js"
