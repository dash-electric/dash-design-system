"use client"

import { MarketingAccountSettings } from "@/registry/dash/templates/marketing-account-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingAccountSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Account Settings"
        description="Catalyst-style account settings ported from AlignUI Pro Figma node 164842:5776. Two-column layout: grouped settings nav (Personal / General) + scrolling profile form."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-account-settings`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Profile active"
          description="Settings nav grouped into Personal Settings (Profile, Notifications, Language, Privacy, Integrations, Appearance) and General Settings (Store, Products, Billing, Shipping). Right pane = avatar + name + email + phone form."
          preview={
            <DocsTemplatePreview padding="p-6">
              <MarketingAccountSettings />
            </DocsTemplatePreview>
          }
          code={`<MarketingAccountSettings
  userName="James Brown"
  userEmail="james@alignui.com"
  userPhone="+1 (012) 345-6789"
  activeItemId="profile"
/>`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Page header + Discard / Save Changes CTAs.</li>
          <li>Left sidebar — two grouped nav lists, icon + label, active highlight.</li>
          <li>Right form — <code>Field</code> rows: Profile Photo, Full Name, Email, Phone Number. Dividers between rows.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "userName", type: "string", description: "Default value for Full Name + avatar fallback." },
            { name: "userEmail", type: "string", description: "Default value for Email Address." },
            { name: "userPhone", type: "string", description: "Default value for Phone Number." },
            { name: "activeItemId", type: "string", description: "ID of the currently selected nav item." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
