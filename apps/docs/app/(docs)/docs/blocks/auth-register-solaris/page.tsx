"use client"

import { AuthRegisterSolaris } from "@/registry/dash/blocks/auth-register-solaris"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AuthRegisterSolarisDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Auth Register — Solaris"
        description="Solaris pattern. Brand mark → 2 stacked SSO (Google + Apple) → OR divider → single email → FancyButton CTA → footer."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add auth-register-solaris`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Daftar Dash"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[540px]">
              <AuthRegisterSolaris />
            </div>
          }
          code={`<AuthRegisterSolaris />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><code>BrandMark</code> 56×56 round, custom tone with <code>bg-error-base</code>.</li>
          <li>2 SSO stacked vertically via <code>grid grid-cols-1 gap-2</code>.</li>
          <li>Single email field — magic-link / email-first style flow.</li>
          <li><code>FancyButton</code> primary CTA full-width.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
