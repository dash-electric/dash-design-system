"use client"

import { HrRoleSelection } from "@/registry/dash/templates/hr-role-selection"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrRoleSelectionDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Onboarding"
        title="HR Role Selection"
        description="Onboarding step 2 of 5 — radio cards for Employee or Employer. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3904:29701."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-role-selection`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Role selection"
          description="Two large radio cards (Employee / Employer) with icon + title + description."
          preview={
            <DocsTemplatePreview>
              <div className="relative h-[680px] overflow-hidden">
                <div className="absolute inset-0 [&>*]:!min-h-full">
                  <HrRoleSelection />
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<HrRoleSelection onContinue={(role) => goToPosition(role)} />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
