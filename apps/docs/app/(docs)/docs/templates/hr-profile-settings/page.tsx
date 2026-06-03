"use client"

import { HrProfileSettings } from "@/registry/dash/templates/hr-profile-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrProfileSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management"
        title="HR Profile Settings"
        description="Settings page with vertical tab nav + active panel (Profile / Contact / Social / Export / General / Company / Notifications / Privacy). Ported 1:1 (structural parity) from AlignUI Pro Figma node 3889:79333."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-profile-settings`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Profile Settings tab"
          description="Default render — Profile tab active with photo upload + name + title + biography (200 char limit)."
          preview={
            <DocsTemplatePreview padding="p-6">
              <HrProfileSettings />
            </DocsTemplatePreview>
          }
          code={`<HrProfileSettings
  userName="Sophia Williams"
  userEmail="sophia@company.com"
  activeTab="profile"
/>`}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> for any settings page with 6+ sections that benefits from vertical nav.</li>
          <li><strong>Don&apos;t</strong> use for &lt;4 sections — reach for <code>SettingsTabsPage</code> (horizontal).</li>
          <li>Tab nav state is stub — wire to your router or local state.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
