"use client"

import { FinanceProfileSettings } from "@/registry/dash/templates/finance-profile-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceProfileSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Profile Settings"
        description="Vertical tab nav (Profile/Company/Notifications/Team/Privacy/Integrations/Localization) + Apex ID + Profile Photo + Full Name + Email + Phone + Legal Address field rows. Ported from AlignUI Pro Figma frame 'Profile Settings [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add finance-profile-settings`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinanceProfileSettings />
            </DocsTemplatePreview>
          }
          code={`<FinanceProfileSettings />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
