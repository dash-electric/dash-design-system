"use client"

import { SettingsTeam } from "@/registry/dash/blocks/settings-team"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
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
      <DocsSection title="Invite-by-email row">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Top of the team page = invite-by-email input. Don't hide invite behind a 'New' button modal — it's the most common action.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-2">
                <div className="flex gap-2"><div className="h-9 flex-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">sari@dash.id</div><div className="h-9 px-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs flex items-center">Member ▾</div><button className="h-9 px-3 rounded-lg bg-primary-base text-static-white text-xs font-medium">Undang</button></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center justify-between text-xs"><span>budi@dash.id</span><span className="text-[9px] text-text-sub-600">Admin</span></div>
              </div>
            ),
            caption: "Email + role + invite button as a single row above the member list. Inviting a teammate is one action wide.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-end"><button className="h-8 px-3 rounded-lg bg-primary-base text-static-white text-xs font-medium">+ Add member</button></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center justify-between text-xs"><span>budi@dash.id</span><span className="text-[9px] text-text-sub-600">Admin</span></div>
                <p className="text-[9px] text-text-soft-400">(clicking '+ Add member' opens a modal with the invite form)</p>
              </div>
            ),
            caption: "Don't gate the invite form behind a modal. Adds a click for the page's #1 action and breaks bulk-invite flows.",
          }}
        />
      </DocsSection>

      <DocsSection title="Pending invite state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Show pending invites distinctly — different visual weight from active members. Pending = grey-tone, with re-send + revoke actions.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-1.5">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center justify-between text-xs"><span>budi@dash.id</span><span className="text-[9px] text-text-sub-600">Admin · Aktif</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-2 flex items-center justify-between text-xs text-text-sub-600"><span>sari@dash.id</span><div className="flex gap-2 items-center"><span className="text-[9px] rounded-full bg-warning-lighter text-warning-dark px-2 py-0.5">Pending</span><button className="text-[9px] text-primary-base underline">Kirim ulang</button></div></div>
              </div>
            ),
            caption: "Pending invite is visually dimmer with explicit 'Pending' badge + resend action. Reader knows the invite hasn't been accepted yet.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm space-y-1.5">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center justify-between text-xs"><span>budi@dash.id</span><span className="text-[9px] text-text-sub-600">Admin</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center justify-between text-xs"><span>sari@dash.id</span><span className="text-[9px] text-text-sub-600">Admin</span></div>
              </div>
            ),
            caption: "Don't render pending invites identical to active members. Admin can't tell who's actually using the team yet.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
