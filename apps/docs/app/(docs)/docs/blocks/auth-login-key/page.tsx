"use client"

import { AuthLoginKey } from "@/registry/dash/blocks/auth-login-key"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AuthLoginKeyDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Auth Login (Key icon)"
        description="Login Key pattern. 96×96 key-icon header → email + password → remember + forgot → FancyButton CTA. Minimal no-SSO variant."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add auth-login-key`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Masuk ke akun Anda"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[560px]">
              <AuthLoginKey />
            </div>
          }
          code={`<AuthLoginKey />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>BrandMark size="lg" shape="square" tone="neutral"</code> with <code>KeyRound</code>.</li>
          <li>Width fixed 440 px (slightly wider than Aurora / Solaris / Phoenix / Apex).</li>
          <li>No SSO — pairs well with internal apps or SSO-disabled tenants.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
