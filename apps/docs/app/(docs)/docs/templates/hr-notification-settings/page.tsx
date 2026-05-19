"use client"

import { HrNotificationSettings } from "@/registry/dash/templates/hr-notification-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrNotificationSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Settings"
        title="HR Notification Settings"
        description="Settings page with Notification active panel — 3 toggle rows (News / Reminders / Promotions) + Upgrade promo block. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3892:87292."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hr-notification-settings`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Notification preferences"
          description="Per-channel switches with Learn more link, followed by a Sparkles promo CTA card."
          preview={
            <DocsTemplatePreview background="bg-bg-weak-50" padding="p-6">
              <HrNotificationSettings />
            </DocsTemplatePreview>
          }
          code={`<HrNotificationSettings />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
