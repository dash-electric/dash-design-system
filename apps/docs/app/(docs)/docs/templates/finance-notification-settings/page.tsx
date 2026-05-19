"use client"

import { FinanceNotificationSettings } from "@/registry/dash/templates/finance-notification-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceNotificationSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Notification Settings"
        description="Settings shell + General Notifications toggle stack + Notification Method toggle stack + Theme Options radio cards (Light/Dark/System). Ported from AlignUI Pro Figma frame 'Notification Settings [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add finance-notification-settings`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinanceNotificationSettings />
            </DocsTemplatePreview>
          }
          code={`<FinanceNotificationSettings />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
