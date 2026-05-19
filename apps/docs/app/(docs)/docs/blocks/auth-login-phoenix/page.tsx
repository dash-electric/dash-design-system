"use client"

import { AuthLoginPhoenix } from "@/registry/dash/blocks/auth-login-phoenix"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AuthLoginPhoenixDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Auth Login — Phoenix"
        description="Phoenix pattern. Brand mark → email + password (inline forgot-link) → FancyButton CTA → OR divider → 2 side-by-side SSO → footer."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add auth-login-phoenix`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Selamat datang kembali"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[600px]">
              <AuthLoginPhoenix />
            </div>
          }
          code={`<AuthLoginPhoenix />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Primary CTA placed <em>before</em> the divider (form-first pattern).</li>
          <li>Forgot-password link sits inline with the password label.</li>
          <li>2 SSO side-by-side via <code>grid grid-cols-2 gap-3</code>, no per-brand label.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
