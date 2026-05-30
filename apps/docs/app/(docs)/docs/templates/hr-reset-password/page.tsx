"use client"

import { HrResetPassword } from "@/registry/dash/templates/hr-reset-password"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrResetPasswordDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Auth"
        title="HR Reset Password"
        description="Single-field email reset with try-another-method fallback + go-back link. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3902:26187."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-reset-password`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Reset password form"
          preview={
            <DocsTemplatePreview>
              <div className="relative h-[680px] overflow-hidden">
                <div className="absolute inset-0 [&>*]:!min-h-full">
                  <HrResetPassword />
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<HrResetPassword
  onSubmit={(email) => sendReset(email)}
  onGoBack={() => router.push("/login")}
/>`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
