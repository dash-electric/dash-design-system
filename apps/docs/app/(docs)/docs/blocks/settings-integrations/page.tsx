"use client"

import { SettingsIntegrations } from "@/registry/dash/blocks/settings-integrations"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SettingsIntegrationsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Settings"
        title="Settings Integrations"
        description="Third-party integration manager — BMKG weather feed, Slack alerts, BCA payout API, Twilio SMS. Connect/disconnect + config buttons per integration."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add settings-integrations`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Dash integrations"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <SettingsIntegrations />
            </div>
          }
          code={`<SettingsIntegrations />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Each integration card: logo + name + description + status <code>Badge</code> + Connect/Disconnect <code>Button</code>.</li>
          <li>Connected variants show last-sync time + Settings link.</li>
          <li>Dash-domain set: BMKG (cuaca), Slack (alerts), BCA (payout), Twilio (SMS OTP), Mixpanel (analytics).</li>
          <li>Grid responsive: 1 mobile / 2 desktop.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> on Settings → Integrations tab.</li>
          <li><strong>Use</strong> for org-level integration management (admin-only).</li>
          <li><strong>Don't</strong> use for SSO/identity-provider config — that's a separate compliance-critical flow.</li>
          <li><strong>Don't</strong> use for end-user API keys — show in a dedicated Developer tab.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
