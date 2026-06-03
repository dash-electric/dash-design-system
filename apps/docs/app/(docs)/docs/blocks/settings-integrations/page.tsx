"use client"

import { SettingsIntegrations } from "@/registry/dash/blocks/settings-integrations"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
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
        <DocsCode language="bash" code={`dashkit add settings-integrations`} />
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Each integration card: logo + name + description + status <code>Badge</code> + Connect/Disconnect <code>Button</code>.</li>
          <li>Connected variants show last-sync time + Settings link.</li>
          <li>Dash-domain set: BMKG (cuaca), Slack (alerts), BCA (payout), Twilio (SMS OTP), Mixpanel (analytics).</li>
          <li>Grid responsive: 1 mobile / 2 desktop.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> on Settings → Integrations tab.</li>
          <li><strong>Use</strong> for org-level integration management (admin-only).</li>
          <li><strong>Don't</strong> use for SSO/identity-provider config — that's a separate compliance-critical flow.</li>
          <li><strong>Don't</strong> use for end-user API keys — show in a dedicated Developer tab.</li>
        </ul>
      </DocsSection>
      <DocsSection title="Connected vs available">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Show which integrations are connected at the top, available ones below. Don't intermix them — user wants to see 'what I have' before 'what I could add'.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-3">
                <div className="space-y-2"><p className="text-[10px] text-text-sub-600">Tersambung</p><div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center justify-between text-xs"><span>📊 Mixpanel · workspace dash-prod</span><span className="text-[9px] text-success-dark">Aktif</span></div><div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center justify-between text-xs"><span>💬 Slack · #ops-alerts</span><span className="text-[9px] text-success-dark">Aktif</span></div></div>
                <div className="space-y-2"><p className="text-[10px] text-text-sub-600">Tersedia</p><div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center justify-between text-xs"><span>📅 Google Calendar</span><button className="h-6 px-2 rounded-md border border-stroke-soft-200 text-[9px]">Hubungkan</button></div></div>
              </div>
            ),
            caption: "Connected integrations on top, ready to disconnect or re-auth. Available integrations below with 'Hubungkan' CTAs.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center text-xs">📊 Mixpanel</div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center text-xs">📅 Google Cal</div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center text-xs">💬 Slack</div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center text-xs">🤖 Zapier</div>
              </div>
            ),
            caption: "Don't intermix connected and disconnected without labels. User can't tell what's already wired vs what's a sales pitch.",
          }}
        />
      </DocsSection>

      <DocsSection title="OAuth scope display">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Before connecting, show what permissions will be granted. Don't hide scopes — surface them at the connect step.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3">
                <p className="text-xs font-medium">Hubungkan Slack</p>
                <p className="text-[10px] text-text-sub-600">Dash akan dapat akses:</p>
                <ul className="text-[10px] text-text-sub-600 list-disc pl-4 space-y-0.5"><li>Kirim pesan ke #ops-alerts</li><li>Read channel list</li></ul>
                <button className="h-7 px-3 rounded-md bg-primary-base text-static-white text-[10px] font-medium">Lanjut ke Slack</button>
              </div>
            ),
            caption: "Explicit scope list before OAuth handoff. User knows what they're approving.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center">
                <p className="text-xs font-medium">Slack</p>
                <button className="h-7 px-3 rounded-md bg-primary-base text-static-white text-[10px] font-medium mt-2">Connect</button>
              </div>
            ),
            caption: "Don't shortcut OAuth without scope disclosure. Trust evaporates when users discover Dash reads all their DMs.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
