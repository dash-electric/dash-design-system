"use client"

import { useState } from "react"
import { RiUserLine as User, RiNotification3Line as Bell, RiShieldLine as Shield, RiPlugLine as Plug, RiBuilding2Line as Building2, RiTeamLine as UsersIcon } from "@remixicon/react"
import { SettingsTabsPage } from "@/registry/dash/templates/settings-tabs-page"
import { Field, FieldGroup, FieldDescription } from "@/registry/dash/ui/field"
import { Label } from "@/registry/dash/ui/label"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Switch } from "@/registry/dash/ui/switch"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

const sections = [
  { id: "profile", label: "Profile", icon: <User /> },
  { id: "company", label: "Company", icon: <Building2 /> },
  { id: "team", label: "Team", icon: <UsersIcon /> },
  { id: "notifications", label: "Notifications", icon: <Bell /> },
  { id: "integrations", label: "Integrations", icon: <Plug /> },
  { id: "privacy", label: "Privacy & security", icon: <Shield /> },
]

export default function SettingsTabsPageDocs() {
  const [active, setActive] = useState("profile")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Generic"
        title="Settings Tabs Page"
        description="Settings hub with a left section nav and a right content pane. Use for profile / company / team / notifications / integrations / privacy — pair with the Settings blocks for instant Halo-dash settings."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add settings-tabs-page`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Halo-dash settings"
          description="Click the left nav to switch sections. Profile and Notifications wired; others show a placeholder."
          preview={
            <DocsTemplatePreview padding="p-6">
              <SettingsTabsPage
                description="Pengaturan akun Halo-dash Ops"
                sections={sections}
                activeId={active}
                onChange={setActive}
              >
                {active === "profile" ? (
                  <div className="space-y-5 max-w-lg">
                    <h3 className="text-base font-semibold tracking-tight">Profile</h3>
                    <FieldGroup>
                      <Field>
                        <Label>Nama lengkap</Label>
                        <InputRoot><Input defaultValue="Sigit Permana" /></InputRoot>
                      </Field>
                      <Field>
                        <Label>Email</Label>
                        <InputRoot><Input type="email" defaultValue="sigit@dash.id" /></InputRoot>
                        <FieldDescription>Akan dipakai untuk login + audit log.</FieldDescription>
                      </Field>
                    </FieldGroup>
                    <Button>Save changes</Button>
                  </div>
                ) : active === "notifications" ? (
                  <div className="space-y-4 max-w-lg">
                    <h3 className="text-base font-semibold tracking-tight">Notifications</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dispatch terlewat</Label>
                        <FieldDescription>Notif tiap 3 dispatch terlewat oleh mitra Reservasi.</FieldDescription>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Lebaran rate freeze</Label>
                        <FieldDescription>Notif saat rate freeze otomatis dibuka kembali.</FieldDescription>
                      </div>
                      <Switch />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-stroke-soft-200 p-8 text-center text-sm text-text-sub-600">
                    Konten section <span className="">{active}</span> di sini.
                  </div>
                )}
              </SettingsTabsPage>
            </DocsTemplatePreview>
          }
          code={`<SettingsTabsPage
  sections={sections}
  activeId={active}
  onChange={setActive}
>
  {active === "profile" ? <SettingsProfile /> : null}
  {active === "notifications" ? <SettingsNotifications /> : null}
  {/* …or render based on active.id */}
</SettingsTabsPage>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="Pure layout — drop in the Settings* blocks for instant content."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Left rail — vertical nav driven by <code>sections</code>. Each section is <code>{`{ id, label, icon? }`}</code>.</li>
          <li>Right pane — your content, swapped based on <code>activeId</code>.</li>
          <li>Pairs naturally with the Settings* blocks: <code>SettingsProfile</code>, <code>SettingsTeam</code>, <code>SettingsNotifications</code>, <code>SettingsIntegrations</code>, <code>SettingsPrivacySecurity</code>.</li>
          <li>Selection is controlled — parent owns the active id. Persist to URL search params for deep-link.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> for the user/account settings hub in any backoffice app.</li>
          <li><strong>Use</strong> for tribe-scoped admin settings (company, team, integrations).</li>
          <li><strong>Use</strong> when you have 4-8 settings sections — fewer than 3 doesn't justify nav, more than 10 needs sub-grouping.</li>
          <li><strong>Don't</strong> use for app preferences shown inline (theme toggle, language) — keep those in topbar dropdowns.</li>
          <li><strong>Don't</strong> use for product configuration that affects other users (Auto Suspend rules) — those belong to a dedicated workflow page.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "sections", type: "SettingsSection[]", description: "{ id, label, description?, icon? }[]." },
            { name: "activeId", type: "string", description: "Controlled active section id." },
            { name: "onChange", type: "(id: string) => void", description: "Fires on nav click." },
            { name: "title", type: "ReactNode", defaultValue: '"Settings"', description: "Sidebar heading." },
            { name: "description", type: "ReactNode", description: "Sidebar subhead." },
          ]}
        />
      </DocsSection>
      <DocsSection title="Tab-per-domain">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Settings tabs split by user-mental-model domain: Profile, Notifications, Team, Integrations, Privacy. Don't split by data table.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 space-y-2">
                <div className="flex gap-3 text-xs border-b border-stroke-soft-200"><span className="pb-2 border-b-2 border-primary-base text-text-strong-950">Profil</span><span className="pb-2 text-text-sub-600">Notifikasi</span><span className="pb-2 text-text-sub-600">Tim</span><span className="pb-2 text-text-sub-600">Integrasi</span></div>
                <div className="h-12 rounded bg-bg-weak-50" />
              </div>
            ),
            caption: "Tabs match the user's mental categories. Ops can find 'team invites' under 'Tim' without thinking.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 space-y-2">
                <div className="flex gap-3 text-xs border-b border-stroke-soft-200"><span className="pb-2 border-b-2 border-primary-base">users_table</span><span className="pb-2 text-text-sub-600">invites_table</span><span className="pb-2 text-text-sub-600">notification_prefs</span><span className="pb-2 text-text-sub-600">oauth_apps</span></div>
                <div className="h-12 rounded bg-bg-weak-50" />
              </div>
            ),
            caption: "Don't name tabs after database tables. User doesn't know they need to look in `oauth_apps` to find Slack integration.",
          }}
        />
      </DocsSection>

      <DocsSection title="Tab persistence on URL">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Active tab lives in the URL hash or param. Reloading the page or sharing a link should land on the same tab.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-2 text-xs">
                <div className="font-mono text-[10px] text-text-soft-400">/settings/team</div>
                <div className="flex gap-3"><span className="text-text-sub-600">Profil</span><span className="border-b-2 border-primary-base text-text-strong-950 pb-1">Tim</span></div>
              </div>
            ),
            caption: "URL reflects the active tab. Share `/settings/team` and the recipient lands directly on it.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-2 text-xs">
                <div className="font-mono text-[10px] text-text-soft-400">/settings</div>
                <div className="flex gap-3"><span className="text-text-sub-600">Profil</span><span className="border-b-2 border-primary-base pb-1">Tim</span></div>
                <p className="text-[9px] text-text-soft-400">(refresh → snaps back to Profile)</p>
              </div>
            ),
            caption: "Don't keep tab state in component memory. Refresh = lost state, share = wrong tab.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
