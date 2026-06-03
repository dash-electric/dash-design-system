"use client"

import { AuthLoginApex } from "@/registry/dash/blocks/auth-login-apex"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AuthLoginApexDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Auth Login — Apex"
        description="Apex pattern. Brand mark → 3 side-by-side SSO (Google/Apple/Microsoft) → OR divider → email + password → remember + forgot → FancyButton CTA → footer."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add auth-login-apex`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Masuk Halo-dash"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[620px]">
              <AuthLoginApex />
            </div>
          }
          code={`<AuthLoginApex />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Icon-only 3-up SSO row via <code>grid grid-cols-3 gap-3</code>.</li>
          <li>Remember + forgot row sits between the form and the CTA.</li>
          <li>Designed for the Halo-dash internal ops portal.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
