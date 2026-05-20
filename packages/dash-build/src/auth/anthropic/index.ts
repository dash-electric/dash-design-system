// Public surface for the Anthropic auth subsystem.

export {
  startOAuthFlow,
  exchangeCodeForToken,
  callbackUrl,
  ANTHROPIC_OAUTH_BASE,
  ANTHROPIC_CLIENT_ID,
  ANTHROPIC_OAUTH_SCOPE,
  type StartOAuthOpts,
  type StartOAuthResult,
  type CallbackOpts,
  type TokenResponse,
} from "./oauth-flow.js"

export {
  AnthropicTokenStore,
  type AnthropicTokenStoreOptions,
  type StoredTokens,
} from "./token-store.js"

export { refreshIfExpired, REFRESH_BUFFER_MS } from "./refresh.js"

export { BYOKeyStore, type BYOKeyStoreOptions } from "./byo-key.js"

export {
  AuthenticatedAnthropicClient,
  type AnthropicCredentials,
  type AuthenticatedClientOptions,
} from "./client.js"
