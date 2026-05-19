"use client"

import { FinanceTeamSettings } from "@/registry/dash/templates/finance-team-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceTeamSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Team Settings"
        description="Settings shell + SegmentedControl [All|Active|Invited] filter + Search/Filter/Sort row + Invite CTA + Members table with avatar/name/email/last-activity/role columns. Ported from AlignUI Pro Figma frame 'Team Settings [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add finance-team-settings`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinanceTeamSettings />
            </DocsTemplatePreview>
          }
          code={`<FinanceTeamSettings />`}
        />
      </DocsSection>
      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "members", type: "FinanceTeamMember[]", description: "Member list — { id, name, email, lastActivity, role, status }. Default = 5 mock rows." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
