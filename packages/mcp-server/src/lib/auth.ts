/**
 * Auth helpers for the Dash registry.
 *
 * The registry is protected by a bearer token. Token + base URL come from env:
 *   - DASH_REGISTRY_URL   (default: https://ds.dash.com)
 *   - DASH_REGISTRY_TOKEN (optional but recommended for prod)
 */

export interface RegistryConfig {
  baseUrl: string;
  token: string | undefined;
}

export function loadConfig(): RegistryConfig {
  const baseUrl = (process.env.DASH_REGISTRY_URL ?? "https://ds.dash.com").replace(/\/+$/, "");
  const token = process.env.DASH_REGISTRY_TOKEN?.trim() || undefined;
  return { baseUrl, token };
}

export function authHeaders(config: RegistryConfig): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "dash-mcp-server/0.1.0",
  };
  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }
  return headers;
}
