"use client"

import { HrPersonalInformation } from "@/registry/dash/templates/hr-personal-information"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrPersonalInformationDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Onboarding"
        title="HR Personal Information"
        description="Onboarding step 1 of 5 — Full Name / Username / Phone with country code. Includes horizontal step indicator. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3903:29361."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-personal-information`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Personal information form"
          description="3-field onboarding step with shared top nav (brand + stepper + close) and bottom bar (Back + footer)."
          preview={
            <DocsTemplatePreview>
              <div className="relative h-[680px] overflow-hidden">
                <div className="absolute inset-0 [&>*]:!min-h-full">
                  <HrPersonalInformation />
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<HrPersonalInformation onContinue={({ fullName, username, phone }) => nextStep()} />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
