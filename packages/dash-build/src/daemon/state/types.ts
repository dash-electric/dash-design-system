/**
 * Type definitions for the dash-build daemon state store.
 *
 * The store is the single source of truth for runtime state — auth status,
 * pending prompts, active workspace. Persisted atomically to
 * ~/.dash-build/state.json on every mutation.
 */

export type AuthProvider = "openai" | "github"

export interface OpenAIAuthState {
  connected: boolean
  user: string | null
}

export interface GithubAuthState {
  connected: boolean
  repos: string[]
}

export interface AuthState {
  openai: OpenAIAuthState
  github: GithubAuthState
}

export type PromptStatus =
  | "queued"
  | "clarifying"
  | "generating"
  | "awaiting_approval"
  | "pr_created"
  | "completed"
  | "failed"
  | "cancelled"

export interface PromptRecord {
  id: string
  text: string
  repo: string | null
  branch: string | null
  status: PromptStatus
  createdAt: string
  updatedAt: string
  prUrl: string | null
  error: string | null
}

export interface WorkspaceState {
  activeRepo: string | null
  activeBranch: string | null
}

export interface DaemonState {
  version: string
  startedAt: string
  auth: AuthState
  prompts: PromptRecord[]
  workspace: WorkspaceState
}

export interface AuthUpdateOpenAI {
  connected?: boolean
  user?: string | null
}

export interface AuthUpdateGithub {
  connected?: boolean
  repos?: string[]
}

export type AuthUpdate<P extends AuthProvider> = P extends "openai"
  ? AuthUpdateOpenAI
  : AuthUpdateGithub

export const DAEMON_VERSION = "0.1.0"

export function createInitialState(): DaemonState {
  return {
    version: DAEMON_VERSION,
    startedAt: new Date().toISOString(),
    auth: {
      openai: { connected: false, user: null },
      github: { connected: false, repos: [] },
    },
    prompts: [],
    workspace: { activeRepo: null, activeBranch: null },
  }
}

export function normalizeDaemonState(input: unknown): DaemonState {
  const base = createInitialState()
  const parsed = (input && typeof input === "object" ? input : {}) as Partial<DaemonState> & {
    auth?: {
      openai?: Partial<OpenAIAuthState>
      anthropic?: Partial<OpenAIAuthState>
      github?: Partial<GithubAuthState>
    }
    workspace?: Partial<WorkspaceState>
  }

  return {
    version: typeof parsed.version === "string" ? parsed.version : base.version,
    startedAt:
      typeof parsed.startedAt === "string" ? parsed.startedAt : base.startedAt,
    auth: {
      openai: {
        connected:
          parsed.auth?.openai?.connected ??
          parsed.auth?.anthropic?.connected ??
          base.auth.openai.connected,
        user:
          parsed.auth?.openai?.user ??
          parsed.auth?.anthropic?.user ??
          base.auth.openai.user,
      },
      github: {
        connected: parsed.auth?.github?.connected ?? base.auth.github.connected,
        repos: Array.isArray(parsed.auth?.github?.repos)
          ? parsed.auth!.github!.repos.filter((repo): repo is string => typeof repo === "string")
          : base.auth.github.repos,
      },
    },
    prompts: Array.isArray(parsed.prompts) ? parsed.prompts : base.prompts,
    workspace: {
      activeRepo:
        parsed.workspace?.activeRepo === undefined
          ? base.workspace.activeRepo
          : parsed.workspace.activeRepo,
      activeBranch:
        parsed.workspace?.activeBranch === undefined
          ? base.workspace.activeBranch
          : parsed.workspace.activeBranch,
    },
  }
}
