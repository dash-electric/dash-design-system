"use client"

import { HrPasswordSetup } from "@/registry/dash/templates/hr-password-setup"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrPasswordSetupDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Onboarding"
        title="HR Password Setup"
        description="Onboarding step 4 of 5 — Create + Confirm password with live rule checklist (uppercase / number / 8+ chars). Ported 1:1 (structural parity) from AlignUI Pro Figma node 3908:30106."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-password-setup`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Password setup"
          description="Two password fields with live regex-driven rule checklist."
          preview={
            <DocsTemplatePreview>
              <div className="relative h-[700px] overflow-hidden">
                <div className="absolute inset-0 [&>*]:!min-h-full">
                  <HrPasswordSetup />
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<HrPasswordSetup onContinue={({ password, confirm }) => submit()} />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
