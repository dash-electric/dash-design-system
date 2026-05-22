/**
 * Public surface of the pipeline module. Daemon (Agent B / H wiring) consumes
 * Orchestrator + Worker; HTTP routes consume types only.
 */

export {
  Orchestrator,
  defaultClarificationGateway,
  defaultGithubProvider,
  defaultOpenAIProvider,
  defaultSkillChainRunner,
  generatePromptId,
  mergeAnswers,
  type OrchestratorOptions,
} from "./orchestrator.js"
export { Worker, type WorkerOptions } from "./worker.js"
export {
  STATUS_TRANSITIONS,
  type AnthropicProvider,
  type ApprovePRInput,
  type ApprovePRResult,
  type ClarificationGateway,
  type GenerationArtifact,
  type GithubProvider,
  type Logger,
  type PreviewBundler,
  type PromptWithArtifact,
  type SkillChainRunner,
  type SubmitPromptInput,
  type SubmitPromptResult,
} from "./types.js"
export {
  assertTransition,
  canTransition,
  IllegalTransitionError,
  isTerminal,
  nextStatus,
} from "./status-transitions.js"
export {
  classify,
  describe,
  PipelineError,
  shouldRetry,
  type PipelineErrorKind,
} from "./error-handling.js"
