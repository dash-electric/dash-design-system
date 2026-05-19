"use client"

import { SettingsNotifications } from "@/registry/dash/blocks/settings-notifications"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SettingsNotificationsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Settings"
        title="Settings Notifications"
        description="Notification preference matrix — dispatch alerts, payout updates, escalations. Per-channel toggles (in-app, email, SMS) for each event class. Tuned for Dash dispatch ops."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add settings-notifications`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Dispatch alerts + payout events"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <SettingsNotifications />
            </div>
          }
          code={`<SettingsNotifications />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Per-event rows: title + <code>FieldDescription</code> + per-channel <code>Switch</code>.</li>
          <li>Channel columns: in-app, email, SMS, push.</li>
          <li>Section groupings — Dispatch / Payout / Mitra / Escalation.</li>
          <li>Dash-domain copy: "Dispatch terlewat", "Lebaran rate freeze", "Mitra suspended".</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> on Settings → Notifications tab.</li>
          <li><strong>Use</strong> as a starting point for any preferences matrix.</li>
          <li><strong>Don't</strong> use for in-app notification feed display — different primitive (use Sheet or Popover).</li>
          <li><strong>Don't</strong> use for marketing email opt-out — those belong to a separate consent flow.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
