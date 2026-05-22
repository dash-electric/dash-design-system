import { BYOKeyStore, type BYOKeyStoreOptions } from "./byo-key.js"
import { CodexCliRunner } from "../codex-cli/runner.js"

export type OpenAIAuthMode = "codex-cli" | "byo-key" | "none"

export type AuthenticatedClientOptions = BYOKeyStoreOptions & {
  fetchImpl?: typeof fetch
  byoStore?: BYOKeyStore
  codexCli?: CodexCliRunner
}

export class AuthenticatedOpenAIClient {
  private readonly byoStore: BYOKeyStore
  private readonly fetchImpl: typeof fetch
  private readonly codexCli: CodexCliRunner

  constructor(opts: AuthenticatedClientOptions = {}) {
    this.byoStore = opts.byoStore ?? new BYOKeyStore(opts)
    this.fetchImpl = opts.fetchImpl ?? fetch
    this.codexCli = opts.codexCli ?? new CodexCliRunner()
  }

  async isConnected(): Promise<boolean> {
    return (await this.getMode()) !== "none"
  }

  async getMode(): Promise<OpenAIAuthMode> {
    const probe = await this.codexCli.probe().catch(() => ({
      installed: false,
      authenticated: false,
      version: null,
      statusLine: null,
    }))
    if (probe.installed && probe.authenticated) return "codex-cli"
    const apiKey = await this.byoStore.load().catch(() => null)
    if (apiKey) return "byo-key"
    return "none"
  }

  async getStoredKey(): Promise<string | null> {
    return this.byoStore.load().catch(() => null)
  }

  async complete(
    prompt: string,
    opts: {
      signal?: AbortSignal
      onToken?: (chunk: string) => void
      model?: string
    } = {},
  ): Promise<string> {
    const mode = await this.getMode()

    if (mode === "codex-cli") {
      const result = await this.codexCli.complete({
        prompt,
        signal: opts.signal,
        onToken: opts.onToken,
        model: opts.model,
      })
      return result.content
    }

    if (mode === "byo-key") {
      const apiKey = await this.getStoredKey()
      if (!apiKey) throw new Error("No OpenAI API key stored.")

      const res = await this.fetchImpl("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: opts.model ?? "gpt-5",
          input: prompt,
        }),
        signal: opts.signal,
      })

      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`OpenAI API ${res.status}: ${body || res.statusText}`)
      }

      const data = (await res.json()) as {
        output_text?: string
        output?: Array<{
          type?: string
          content?: Array<{ type?: string; text?: string }>
        }>
      }

      const text = data.output_text ?? extractOutputText(data.output ?? [])
      if (opts.onToken && text) opts.onToken(text)
      return text
    }

    throw new Error(
      "OpenAI not connected. Run `codex login --device-auth` or save an OPENAI_API_KEY in Dash Build settings.",
    )
  }
}

function extractOutputText(
  blocks: Array<{
    type?: string
    content?: Array<{ type?: string; text?: string }>
  }>,
): string {
  return blocks
    .flatMap((block) => block.content ?? [])
    .filter((item) => item.type === "output_text" || item.type === "text")
    .map((item) => item.text ?? "")
    .join("")
}
