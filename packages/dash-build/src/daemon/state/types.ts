/**
 * Type definitions for the dash-build daemon state store.
 *
 * The store is the single source of truth for runtime state — auth status,
 * pending prompts, active workspace. Persisted atomically to
 * ~/.dash-build/state.json on every mutation.
 */

export type AuthProvider = "anthropic" | "github"

export interface AnthropicAuthState {
  connected: boolean
  user: string | null
}

export interface GithubAuthState {
  connected: boolean
  repos: string[]
}

export interface AuthState {
  anthropic: AnthropicAuthState
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

export interface AuthUpdateAnthropic {
  connected?: boolean
  user?: string | null
}

export interface AuthUpdateGithub {
  connected?: boolean
  repos?: string[]
}

export type AuthUpdate<P extends AuthProvider> = P extends "anthropic"
  ? AuthUpdateAnthropic
  : AuthUpdateGithub

export const DAEMON_VERSION = "0.1.0"

export function createInitialState(): DaemonState {
  return {
    version: DAEMON_VERSION,
    startedAt: new Date().toISOString(),
    auth: {
      anthropic: { connected: false, user: null },
      github: { connected: false, repos: [] },
    },
    prompts: [],
    workspace: { activeRepo: null, activeBranch: null },
  }
}
