"use client"

import { SignupBlock03 } from "@/registry/dash/blocks/signup-03"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SignupBlock03DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Signup 03"
        description="Split-screen signup with a branded hero — Dash purple gradient on the left, form on the right. Designed for public Daftar Dash landings where social proof matters."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add signup-03`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Split — branded"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 flex items-center justify-center min-h-[640px]">
              <SignupBlock03 />
            </div>
          }
          code={`<SignupBlock03 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Self-contained rounded card with a 50/50 grid on <code>lg</code>.</li>
          <li>Hero panel: Dash purple gradient + benefit list + tribe-lead testimonial.</li>
          <li>Form panel: SSO + email/password + terms + submit.</li>
          <li>Mobile: form only, hero hidden.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for public mitra/partner signup landing pages.</li>
          <li><strong>Use</strong> when conversion benefits from social proof + brand storytelling.</li>
          <li><strong>Don't</strong> use for internal-only signup — <code>Signup 01</code> ships faster.</li>
          <li><strong>Don't</strong> use inside dialogs — too tall.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
