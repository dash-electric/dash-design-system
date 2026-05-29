"use client"

import { HrPositionSelection } from "@/registry/dash/templates/hr-position-selection"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrPositionSelectionDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Onboarding"
        title="HR Position Selection"
        description="Onboarding step 3 of 5 — Department select + Title select + Biography textarea + Skip this step. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3904:29920."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-position-selection`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Position form"
          description="Two select inputs (department / title) + textarea with char counter + skip link."
          preview={
            <DocsTemplatePreview>
              <div className="relative h-[700px] overflow-hidden">
                <div className="absolute inset-0 [&>*]:!min-h-full">
                  <HrPositionSelection />
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<HrPositionSelection onContinue={({ department, title, bio }) => nextStep()} />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
