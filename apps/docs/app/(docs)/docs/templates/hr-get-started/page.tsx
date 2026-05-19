"use client"

import { HrGetStarted } from "@/registry/dash/templates/hr-get-started"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrGetStartedDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Onboarding"
        title="HR Get Started"
        description="Centered single-column entry page — social SSO + email + T&C + Get Started CTA. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3903:28634."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hr-get-started`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Get started"
          description="Social SSO row + OR divider + email field + T&C checkbox + primary CTA + Login link."
          preview={
            <DocsTemplatePreview>
              <div className="relative h-[680px] overflow-hidden">
                <div className="absolute inset-0 [&>*]:!min-h-full">
                  <HrGetStarted />
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<HrGetStarted onSubmit={({ email, agreed }) => beginOnboarding(email)} />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
