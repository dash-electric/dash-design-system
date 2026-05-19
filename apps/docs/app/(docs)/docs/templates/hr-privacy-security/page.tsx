"use client"

import { HrPrivacySecurity } from "@/registry/dash/templates/hr-privacy-security"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrPrivacySecurityDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Settings"
        title="HR Privacy & Security"
        description="Settings page with Privacy & Security active panel — Change Password tab with current/new/confirm fields + live rule checklist. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3893:89081."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hr-privacy-security`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Change password"
          description="Sub-tabs for Change Password / 2FA / Active Sessions / Delete Account; default active = Change Password."
          preview={
            <DocsTemplatePreview background="bg-bg-weak-50" padding="p-6">
              <HrPrivacySecurity />
            </DocsTemplatePreview>
          }
          code={`<HrPrivacySecurity />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
