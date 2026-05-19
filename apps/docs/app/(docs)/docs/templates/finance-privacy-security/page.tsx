"use client"

import { FinancePrivacySecurity } from "@/registry/dash/templates/finance-privacy-security"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinancePrivacySecurityDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Privacy & Security"
        description="Settings shell + Change Password / Backup Codes / 2FA / Active Sessions action rows + Sessions table with Browser/Location/Last activity/IP columns. Ported from AlignUI Pro Figma frame 'Privacy & Security [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add finance-privacy-security`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinancePrivacySecurity />
            </DocsTemplatePreview>
          }
          code={`<FinancePrivacySecurity />`}
        />
      </DocsSection>
      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "sessions", type: "ActiveSession[]", description: "Active session list — { id, browser, location, lastActivity, ip, current? }. Default = 4 mock rows." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
