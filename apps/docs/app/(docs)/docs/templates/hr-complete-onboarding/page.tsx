"use client"

import { HrCompleteOnboarding } from "@/registry/dash/templates/hr-complete-onboarding"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrCompleteOnboardingDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Onboarding"
        title="HR Complete Onboarding"
        description="Onboarding step 5 of 5 — read-only summary of all entered fields with Edit pencil per row + Complete CTA. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3908:30330."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hr-complete-onboarding`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Summary review"
          description="5-row review list (Full Name / Username / Email / Title / Department) each with edit-pencil affordance."
          preview={
            <DocsTemplatePreview>
              <div className="relative h-[700px] overflow-hidden">
                <div className="absolute inset-0 [&>*]:!min-h-full">
                  <HrCompleteOnboarding />
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<HrCompleteOnboarding summary={summary} onComplete={(s) => activate(s)} />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
