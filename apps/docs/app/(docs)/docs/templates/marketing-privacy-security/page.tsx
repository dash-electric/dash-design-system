"use client"

import { MarketingPrivacySecurity } from "@/registry/dash/templates/marketing-privacy-security"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingPrivacySecurityDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Privacy & Security"
        description="Password & 2FA panel — Change Password, Backup Codes, 2FA management, login notifications, data export. Source: Figma node `164843:34880`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-privacy-security`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingPrivacySecurity />
            </DocsTemplatePreview>
          }
          code={`<MarketingPrivacySecurity />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "className", type: "string", description: "Optional className to merge with the root wrapper." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
