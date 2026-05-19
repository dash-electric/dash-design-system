"use client"

import { SignupBlock02 } from "@/registry/dash/blocks/signup-02"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SignupBlock02DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Signup 02"
        description="Signup with SSO buttons above the email/password fallback. Matches Login 02 visual pattern so users see consistent auth chrome across login and signup."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add signup-02`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="With SSO"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[520px]">
              <SignupBlock02 />
            </div>
          }
          code={`<SignupBlock02 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Top: <code>SocialButton brand="google"</code> + <code>SocialButton brand="apple"</code>.</li>
          <li><code>Divider</code> with "atau" caption.</li>
          <li>Bottom: name + email + password + terms checkbox + submit.</li>
          <li>Pair with the centered or split <code>AuthShell</code> variant — both work.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> when SSO is the preferred signup path but you still accept fallback emails.</li>
          <li><strong>Use</strong> for tribe leadership and PE invitations (Google Workspace).</li>
          <li><strong>Don't</strong> use for mitra mass-recruitment — they don't have SSO; use <code>Signup 01</code> or stepper.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
