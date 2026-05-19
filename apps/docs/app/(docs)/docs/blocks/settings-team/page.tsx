"use client"

import { SettingsTeam } from "@/registry/dash/blocks/settings-team"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SettingsTeamDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Settings"
        title="Settings Team"
        description="Team membership management — invite by email, pending invites list, role editor. Designed for Halo-dash tribe leadership managing agent roster."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add settings-team`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Halo-dash team"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <SettingsTeam />
            </div>
          }
          code={`<SettingsTeam />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Invite row — email <code>InputRoot</code> + role <code>Select</code> + Send <code>Button</code>.</li>
          <li>Active members table — <code>Avatar</code> + name + email + role + last active + overflow menu.</li>
          <li>Pending invites section — list with Resend/Cancel actions.</li>
          <li>Role <code>Badge</code> color-coded (Lead = primary, L2 = info, L1 = neutral).</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> on Settings → Team tab for tribe leadership.</li>
          <li><strong>Use</strong> for any per-org membership management.</li>
          <li><strong>Don't</strong> use for tribe-wide directory (read-only roster) — use <code>TeamGrid</code>.</li>
          <li><strong>Don't</strong> use for org-wide RBAC config — that needs a dedicated permissions matrix UI.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
