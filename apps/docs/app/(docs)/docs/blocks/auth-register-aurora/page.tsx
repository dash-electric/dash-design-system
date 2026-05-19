"use client"

import { AuthRegisterAurora } from "@/registry/dash/blocks/auth-register-aurora"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AuthRegisterAuroraDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Auth Register — Aurora"
        description="Aurora pattern. Brand mark → single Google SSO → OR divider → 4-field form (first/last/email/password) → FancyButton CTA → footer link to login."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add auth-register-aurora`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Buat akun mitra"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[640px]">
              <AuthRegisterAurora />
            </div>
          }
          code={`<AuthRegisterAurora />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>BrandMark</code> 56×56 round, primary tone.</li>
          <li><code>SocialButton brand="google" block</code> as single full-width SSO.</li>
          <li><code>ContentDivider</code> with "atau" centred between SSO and form.</li>
          <li>First/last name split via <code>grid grid-cols-2 gap-3</code>.</li>
          <li><code>PasswordInput</code> with <code>autoComplete="new-password"</code>.</li>
          <li><code>FancyButton tone="primary" size="lg" w-full</code> as primary CTA.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
