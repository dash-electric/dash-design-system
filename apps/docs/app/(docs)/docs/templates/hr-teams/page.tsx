"use client"

import { HrTeams } from "@/registry/dash/templates/hr-teams"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrTeamsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management"
        title="HR Teams"
        description="Member table with avatar / title / project / document / status. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3878:62221."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hr-teams`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Members roster"
          description="6 sample members across roles with status badge + paginated footer."
          preview={
            <DocsTemplatePreview padding="p-6">
              <HrTeams />
            </DocsTemplatePreview>
          }
          code={`<HrTeams members={[/* TeamMember[] */]} />`}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for org member directory / team roster.</li>
          <li><strong>Use</strong> when each row has a primary asset (document, contract, profile).</li>
          <li><strong>Don&apos;t</strong> use for generic data tables — use <code>@dash/data-table</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
