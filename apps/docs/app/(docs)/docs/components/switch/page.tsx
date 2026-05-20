"use client"

import * as React from "react"
import {
  RiUser3Line as UserIcon,
  RiSettings3Line as Settings,
  RiMoonLine as Moon,
  RiAppsLine as Apps,
  RiLogoutBoxLine as LogoutIcon,
  RiVerifiedBadgeFill as Verified,
  RiNotification3Line as Bell,
  RiInformationFill as Info,
} from "@remixicon/react"
import { Switch } from "@/registry/dash/ui/switch"
import { Label } from "@/registry/dash/ui/label"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Switch — Figma 1:1 (9 nodes verified 2026-05-18).
 *
 *   385:4580        Inline label + sublabel + NEW badge + description + link variants (LTR + RTL)
 *   385:4086        State matrix (Off/On × default/hover/disabled)
 *   385:4733        Card-wrapped variants (text-only / icon / avatar / brand-logo × 4 states)
 *   3678:14609      Microsoft Office 365 card — 4 brand-card layouts (compact, wide, stacked, full)
 *   3682:22138      Account dropdown menu (light) — Dark Mode toggle
 *   3682:22139      Account dropdown menu (dark) — Dark Mode toggle ON
 *   166999:138956   Notification Preferences modal — list of inline switches
 *   166999:138992   Integrations modal — list of brand-logo switch cards
 *   3682:26308      Generic Switch list — 6 leading-element variants
 */

const OFFICE_ICON = (
  <span className="inline-flex size-8 items-center justify-center rounded-md bg-bg-white-0 border border-stroke-soft-200 text-[10px] font-bold text-[#EA3E23]">
    Office
  </span>
)
const ZOOM_ICON = (
  <span className="inline-flex size-8 items-center justify-center rounded-md bg-[#2D8CFF] text-white text-[10px] font-bold">
    Zoom
  </span>
)
const SLACK_ICON = (
  <span className="inline-flex size-8 items-center justify-center rounded-md bg-bg-white-0 border border-stroke-soft-200 text-[10px] font-bold text-[#4A154B]">
    #
  </span>
)
const TRELLO_ICON = (
  <span className="inline-flex size-8 items-center justify-center rounded-md bg-[#0079BF] text-white text-[10px] font-bold">
    T
  </span>
)
const DASH_ICON = (
  <span className="inline-flex size-8 items-center justify-center rounded-md bg-(--primary-alpha-10) text-(--primary-base) text-[10px] font-bold">
    D
  </span>
)

export default function SwitchDocsPage() {
  const [news, setNews] = React.useState(true)
  const [reminders, setReminders] = React.useState(true)
  const [promos, setPromos] = React.useState(false)
  const [office, setOffice] = React.useState(true)
  const [zoom, setZoom] = React.useState(true)
  const [slack, setSlack] = React.useState(true)
  const [trello, setTrello] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(false)
  const [darkMode2, setDarkMode2] = React.useState(true)

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Form"
        title="Switch"
        description="Binary toggle for settings that take effect immediately. Pair with Label (+ optional sublabel, NEW badge, description, link). Compose into card patterns for integrations, notification preferences, dropdown menu rows."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add switch`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { Switch } from "@/registry/dash/ui/switch"
import { Label } from "@/registry/dash/ui/label"

<div className="inline-flex items-center gap-2">
  <Switch id="dark" checked={darkMode} onCheckedChange={setDarkMode} />
  <Label htmlFor="dark">Dark Mode</Label>
</div>`}
        />
      </DocsSection>

      <DocsSection title="State matrix">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          3 states (default / hover / disabled) × 2 values (Off / On). Figma node 385:4086.
        </p>
        <DocsExample
          title="Off / On × default / hover / disabled"
          preview={
            <div className="grid grid-cols-4 gap-3 max-w-md p-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
              <div className="space-y-2 text-center">
                <Switch />
                <Switch defaultChecked />
              </div>
              <div className="space-y-2 text-center">
                <Switch className="bg-stroke-sub-300" />
                <Switch defaultChecked className="bg-primary-darker" />
              </div>
              <div className="space-y-2 text-center">
                <Switch className="bg-stroke-sub-300" />
                <Switch defaultChecked className="bg-primary-darker" />
              </div>
              <div className="space-y-2 text-center">
                <Switch disabled />
                <Switch disabled defaultChecked />
              </div>
            </div>
          }
          code={`<Switch />
<Switch defaultChecked />
<Switch disabled />
<Switch disabled defaultChecked />`}
        />
      </DocsSection>

      <DocsSection title="Inline label + sublabel + NEW badge + description + link">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Inline composition — Switch + Label + optional sublabel + NEW badge + description + LinkButton. Supports both LTR (switch left) and RTL (switch right) layouts (Figma node 385:4580).
        </p>
        <DocsExample
          title="LTR + RTL × 4 row variants"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
              {[
                { ltr: true, withDesc: false, checked: false },
                { ltr: false, withDesc: false, checked: false },
                { ltr: true, withDesc: false, checked: true },
                { ltr: false, withDesc: false, checked: true },
                { ltr: true, withDesc: true, checked: false },
                { ltr: false, withDesc: true, checked: false },
                { ltr: true, withDesc: true, checked: true },
                { ltr: false, withDesc: true, checked: true },
              ].map((row, i) => (
                <div key={i} className={cn("flex gap-3", !row.ltr && "flex-row-reverse text-right")}>
                  <Switch defaultChecked={row.checked} className="mt-0.5 shrink-0" />
                  <div className={cn("flex-1 space-y-1", !row.ltr && "items-end")}>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-sm font-medium text-text-strong-950">Label</span>
                      <span className="text-xs text-text-soft-400">(Sublabel)</span>
                      <Badge size="sm" appearance="lighter" status="information">NEW</Badge>
                    </div>
                    {row.withDesc ? (
                      <>
                        <p className="text-xs text-text-sub-600">Insert the checkbox description here.</p>
                        <LinkButton size="sm">Link Button</LinkButton>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          }
          code={`<div className="flex gap-3">
  <Switch defaultChecked className="mt-0.5" />
  <div className="flex-1 space-y-1">
    <div className="inline-flex items-center gap-1.5">
      <span className="text-sm font-medium">Label</span>
      <span className="text-xs text-text-soft-400">(Sublabel)</span>
      <Badge size="sm" appearance="lighter" status="information">NEW</Badge>
    </div>
    <p className="text-xs text-text-sub-600">Insert the checkbox description here.</p>
    <LinkButton size="sm">Link Button</LinkButton>
  </div>
</div>`}
        />
      </DocsSection>

      <DocsSection title="Card-wrapped variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Wrap the inline composition in a card surface for settings lists. Variants: text-only · with leading icon · with avatar · with brand-logo. 4 states (default / hover / selected / disabled). Selected = ring-primary outline (Figma node 385:4733).
        </p>
        <DocsExample
          title="3 leading types × 4 states"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
              {(["text", "icon", "avatar"] as const).flatMap((leading) =>
                (["default", "hover", "selected", "disabled"] as const).map((state) => (
                  <SwitchCard key={`${leading}-${state}`} leading={leading} state={state} />
                )),
              )}
            </div>
          }
          code={`<SwitchCard leading="icon" state="selected">
  <Label>Microsoft Office 365</Label>
  <Description>Seamless collaboration and document management.</Description>
</SwitchCard>`}
        />
      </DocsSection>

      <DocsSection title="Brand integration cards (Office 365 example)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          4 brand-card layouts for app integration toggles — compact (logo + label + manage + switch), wide (centered logo + manage + switch), stacked (logo top, switch top-right, manage button below), and standalone (logo + label below + switch top-right + manage). Figma node 3678:14609.
        </p>
        <DocsExample
          title="4 layouts"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
              {/* Layout 1: compact horizontal */}
              <div className="flex items-center gap-3 rounded-xl border border-stroke-soft-200 p-3 bg-bg-white-0">
                {OFFICE_ICON}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-strong-950">Microsoft Office 365</span>
                    <Badge size="sm" appearance="lighter" status="information">NEW</Badge>
                  </div>
                  <p className="text-xs text-text-sub-600">Seamless collaboration and document management.</p>
                </div>
                <Button style="stroke" tone="neutral" size="xs"><Settings className="size-3.5" />Manage</Button>
                <Switch defaultChecked />
              </div>
              {/* Layout 2: wide */}
              <div className="flex items-center gap-3 rounded-xl border border-stroke-soft-200 p-3 bg-bg-white-0">
                {OFFICE_ICON}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-strong-950">Microsoft Office 365</span>
                    <Badge size="sm" appearance="lighter" status="information">NEW</Badge>
                  </div>
                  <p className="text-xs text-text-sub-600">Seamless collaboration and document management.</p>
                </div>
                <Button style="stroke" tone="neutral" size="xs"><Settings className="size-3.5" />Manage</Button>
                <Switch />
              </div>
              {/* Layout 3: stacked */}
              <div className="rounded-xl border border-stroke-soft-200 p-3 bg-bg-white-0 space-y-3">
                <div className="flex items-start justify-between">
                  {OFFICE_ICON}
                  <Switch />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-strong-950">Microsoft Office 365</span>
                    <Badge size="sm" appearance="lighter" status="information">NEW</Badge>
                  </div>
                  <p className="text-xs text-text-sub-600">Seamless collaboration and document management.</p>
                </div>
                <Button style="stroke" tone="neutral" className="w-full" size="xs"><Settings className="size-3.5" />Manage</Button>
              </div>
              {/* Layout 4: standalone */}
              <div className="p-1 space-y-3">
                <div className="flex items-start justify-between">
                  {OFFICE_ICON}
                  <Switch />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-strong-950">Microsoft Office 365</span>
                    <Badge size="sm" appearance="lighter" status="information">NEW</Badge>
                  </div>
                  <p className="text-xs text-text-sub-600">Seamless collaboration and document management.</p>
                </div>
                <Button style="stroke" tone="neutral" className="w-full" size="xs"><Settings className="size-3.5" />Manage</Button>
              </div>
            </div>
          }
          code={`<div className="flex items-center gap-3 rounded-xl border p-3">
  {brandIcon}
  <div className="flex-1">
    <Label>Microsoft Office 365</Label>
    <Description>Seamless collaboration and document management.</Description>
  </div>
  <Button style="stroke" tone="neutral" size="xs"><Settings />Manage</Button>
  <Switch checked={enabled} onCheckedChange={setEnabled} />
</div>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Account dropdown menu">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Dropdown menu pattern — profile header + menu rows + Dark Mode switch row. Both light + dark surface variants (Figma nodes 3682:22138 + 3682:22139).
        </p>
        <DocsExample
          title="Light + Dark menu"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Light */}
              <div className="max-w-xs rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-lg p-2">
                <div className="flex items-center gap-3 p-2">
                  <Avatar size="md">
                    <AvatarImage src="https://i.pravatar.cc/40?u=laura" />
                    <AvatarFallback>LP</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-1">
                      <span className="text-sm font-medium text-text-strong-950">Laura Perez</span>
                      <Verified className="size-3.5 text-(--primary-base)" />
                    </div>
                    <div className="text-xs text-text-sub-600">laura@alignui.com</div>
                  </div>
                  <Badge size="sm" appearance="lighter" status="warning">PRO</Badge>
                </div>
                <div className="h-px bg-stroke-soft-200 my-1" />
                <MenuRow icon={UserIcon}>Account Settings</MenuRow>
                <MenuRow icon={Apps}>Integrations</MenuRow>
                <MenuRow icon={Moon} trailing={<Switch checked={darkMode} onCheckedChange={setDarkMode} />}>Dark Mode</MenuRow>
                <div className="h-px bg-stroke-soft-200 my-1" />
                <MenuRow icon={LogoutIcon}>Logout</MenuRow>
              </div>
              {/* Dark */}
              <div className="max-w-xs rounded-2xl bg-bg-strong-950 text-static-white shadow-lg p-2 border border-bg-strong-950">
                <div className="flex items-center gap-3 p-2">
                  <Avatar size="md">
                    <AvatarImage src="https://i.pravatar.cc/40?u=laura" />
                    <AvatarFallback>LP</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-1">
                      <span className="text-sm font-medium">Laura Perez</span>
                      <Verified className="size-3.5 text-(--primary-base)" />
                    </div>
                    <div className="text-xs text-white/60">laura@alignui.com</div>
                  </div>
                  <Badge size="sm" appearance="lighter" status="warning">PRO</Badge>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <MenuRow icon={UserIcon} dark>Account Settings</MenuRow>
                <MenuRow icon={Apps} dark>Integrations</MenuRow>
                <MenuRow icon={Moon} dark trailing={<Switch checked={darkMode2} onCheckedChange={setDarkMode2} />}>Dark Mode</MenuRow>
                <div className="h-px bg-white/10 my-1" />
                <MenuRow icon={LogoutIcon} dark>Logout</MenuRow>
              </div>
            </div>
          }
          code={`<DropdownMenu>
  <ProfileHeader name="Laura Perez" email="laura@alignui.com" badge="PRO" />
  <MenuItem icon={UserIcon}>Account Settings</MenuItem>
  <MenuItem icon={Apps}>Integrations</MenuItem>
  <MenuItem icon={Moon}
    trailing={<Switch checked={darkMode} onCheckedChange={setDarkMode} />}>
    Dark Mode
  </MenuItem>
  <MenuItem icon={LogoutIcon}>Logout</MenuItem>
</DropdownMenu>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Notification Preferences modal">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Modal pattern — header + inline switch rows + info hint + footer actions. Figma node 166999:138956.
        </p>
        <DocsExample
          title="Inline-row preferences list"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-lg p-4 space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-stroke-soft-200">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50">
                  <Bell className="size-4 text-icon-sub-600" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-strong-950">Notification Preferences</div>
                  <div className="text-xs text-text-sub-600">Choose what notifications you want to receive.</div>
                </div>
              </div>
              <PrefRow checked={news} onCheckedChange={setNews} title="News and Updates" description="Stay informed about the latest news, updates, and announcements." />
              <PrefRow checked={reminders} onCheckedChange={setReminders} title="Reminders and Events" description="Get reminders for upcoming events, deadlines, and appointments." />
              <PrefRow checked={promos} onCheckedChange={setPromos} title="Promotions and Offers" description="Receive notifications about special promotions, discounts, and exclusive offers." />
              <div className="flex items-start gap-2 rounded-xl bg-information-lighter p-3">
                <Info className="size-4 text-information-base mt-0.5 shrink-0" />
                <span className="text-xs text-text-strong-950">Maximize your app usage by leaving notification settings active.</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button style="stroke" tone="neutral">Discard</Button>
                <Button>Apply Changes</Button>
              </div>
            </div>
          }
          code={`<Modal>
  <ModalHeader>Notification Preferences</ModalHeader>
  <PrefRow checked={news} onCheckedChange={setNews}
    title="News and Updates" description="..." />
  <PrefRow checked={reminders} onCheckedChange={setReminders} ... />
  <PrefRow checked={promos} onCheckedChange={setPromos} ... />
  <InfoBanner>Maximize your app usage by leaving notification settings active.</InfoBanner>
  <Footer><Discard /><Apply /></Footer>
</Modal>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Integrations modal">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Modal pattern — list of brand-logo switch cards (Office 365 / Zoom / Slack / Trello). Figma node 166999:138992.
        </p>
        <DocsExample
          title="Brand-card list"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-lg p-4 space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-stroke-soft-200">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50">
                  <Settings className="size-4 text-icon-sub-600" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-strong-950">Integrations</div>
                  <div className="text-xs text-text-sub-600">Connect and sync with essential tools and platforms.</div>
                </div>
              </div>
              <IntegrationRow icon={OFFICE_ICON} title="Microsoft Office 365" description="Seamless collaboration and document management." checked={office} onCheckedChange={setOffice} />
              <IntegrationRow icon={ZOOM_ICON} title="Zoom" description="For conducting virtual meetings and interviews." checked={zoom} onCheckedChange={setZoom} />
              <IntegrationRow icon={SLACK_ICON} title="Slack" description="For team communication and real-time collaboration." checked={slack} onCheckedChange={setSlack} />
              <IntegrationRow icon={TRELLO_ICON} title="Trello" description="For task management and project collaboration." checked={trello} onCheckedChange={setTrello} />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button style="stroke" tone="neutral">Discard</Button>
                <Button>Apply Changes</Button>
              </div>
            </div>
          }
          code={`<Modal>
  <ModalHeader>Integrations</ModalHeader>
  {integrations.map(int => (
    <IntegrationRow
      key={int.id}
      icon={int.logo}
      title={int.name}
      description={int.description}
      checked={int.enabled}
      onCheckedChange={(v) => toggle(int.id, v)}
    />
  ))}
  <Footer><Discard /><Apply /></Footer>
</Modal>`}
        />
      </DocsSection>

      <DocsSection title="Generic Switch list — leading element variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          6 leading-element variants in a single column — text-only / generic icon / avatar / Mastercard / Spotify / Dash brand. Figma node 3682:26308.
        </p>
        <DocsExample
          title="6 row types"
          preview={
            <div className="max-w-md space-y-3">
              <SwitchRow leading={null} />
              <SwitchRow leading={<span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-white-0 border border-stroke-soft-200"><UserIcon className="size-4 text-icon-soft-400" /></span>} />
              <SwitchRow leading={<Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/40?u=4" /><AvatarFallback>L</AvatarFallback></Avatar>} />
              <SwitchRow leading={<span className="inline-flex size-8 items-center justify-center rounded-md bg-bg-strong-950 text-[10px] font-bold text-white">MC</span>} />
              <SwitchRow leading={<span className="inline-flex size-8 items-center justify-center rounded-full bg-[#1DB954] text-white text-[10px] font-bold">♫</span>} />
              <SwitchRow leading={DASH_ICON} />
            </div>
          }
          code={`<SwitchRow leading={<Avatar />} />
<SwitchRow leading={brandLogo} />
<SwitchRow leading={null} />`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Dash extension — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm</code> (24×14), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">md</code> (28×16, Figma default), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">lg</code> (36×20).
        </p>
        <DocsExample
          title="sm / md / lg"
          preview={
            <div className="flex items-center gap-4">
              <div className="space-y-2 text-center">
                <Switch size="sm" defaultChecked />
                <div className="text-xs text-text-soft-400">sm</div>
              </div>
              <div className="space-y-2 text-center">
                <Switch size="md" defaultChecked />
                <div className="text-xs text-text-soft-400">md</div>
              </div>
              <div className="space-y-2 text-center">
                <Switch size="lg" defaultChecked />
                <div className="text-xs text-text-soft-400">lg</div>
              </div>
            </div>
          }
          code={`<Switch size="sm" />
<Switch size="md" />
<Switch size="lg" />`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Mitra availability toggle"
          description="Mitra di driver-app toggle status 'siap terima dispatch'. Instant effect — server langsung ubah availability tanpa Submit."
          preview={
            <div className="w-full max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label htmlFor="sw-ex-avail" className="text-sm font-medium">Siap terima dispatch</Label>
                  <p className="text-xs text-text-sub-600 mt-0.5">Anda akan menerima dispatch otomatis selama posisi di area zona aktif.</p>
                </div>
                <Switch id="sw-ex-avail" defaultChecked />
              </div>
            </div>
          }
          code={`<div className="flex items-start justify-between gap-3 ...">
  <div>
    <Label htmlFor="avail">Siap terima dispatch</Label>
    <p className="text-xs text-text-sub-600">
      Anda akan menerima dispatch otomatis selama posisi di area zona aktif.
    </p>
  </div>
  <Switch id="avail" checked={available} onCheckedChange={setAvailable} />
</div>`}
        />

        <DocsExample
          title="Notification channel preferences"
          description="Mitra settings page — pisahkan channel notifikasi. Setiap switch saves on toggle. Dispatcher umumnya leave email + push ON."
          preview={
            <div className="w-full max-w-md divide-y divide-stroke-soft-200 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
              {[
                { id: "ch-push", label: "Push notification", desc: "Dispatch baru & alert urgent", checked: true },
                { id: "ch-sms", label: "SMS", desc: "Hanya untuk konfirmasi pembayaran & verifikasi OTP", checked: true },
                { id: "ch-wa", label: "WhatsApp", desc: "Update non-urgent: jadwal servis, promo, payout", checked: false },
                { id: "ch-email", label: "Email", desc: "Slip payout mingguan & rekap kinerja bulanan", checked: true },
              ].map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 p-3">
                  <div>
                    <Label htmlFor={c.id} className="text-sm font-medium">{c.label}</Label>
                    <p className="text-xs text-text-sub-600 mt-0.5">{c.desc}</p>
                  </div>
                  <Switch id={c.id} defaultChecked={c.checked} />
                </div>
              ))}
            </div>
          }
          code={`<div className="divide-y divide-stroke-soft-200 ...">
  {channels.map((c) => (
    <div key={c.id} className="flex items-center justify-between gap-3 p-3">
      <div>
        <Label htmlFor={c.id}>{c.label}</Label>
        <p className="text-xs text-text-sub-600">{c.desc}</p>
      </div>
      <Switch
        id={c.id}
        checked={c.enabled}
        onCheckedChange={(v) => updateChannel(c.id, v)}
      />
    </div>
  ))}
</div>`}
        />

        <DocsExample
          title="Feature flag — Halo-dash admin"
          description="Admin toggle experimental feature per environment. Disabled state untuk flag yang masih WIP di production."
          preview={
            <div className="w-full max-w-md space-y-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
              <div className="text-sm font-semibold text-text-strong-950">Feature flags · production</div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Auto-suspend mitra</Label>
                  <Badge size="sm" appearance="lighter" status="success">Stable</Badge>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Surge pricing v2</Label>
                  <Badge size="sm" appearance="lighter" status="warning">Beta</Badge>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-text-sub-600">EV swap-battery dispatch</Label>
                  <Badge size="sm" appearance="lighter" status="neutral">WIP</Badge>
                </div>
                <Switch disabled />
              </div>
            </div>
          }
          code={`<Switch defaultChecked />                  {/* stable ON */}
<Switch />                                {/* beta OFF */}
<Switch disabled />                       {/* WIP — locked */}`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Switch = instant toggle on/off, perubahan langsung tersimpan tanpa Save button. Label pakai action verb ('Aktifkan notifikasi'). Untuk pilihan opt-in form yang butuh Submit, pakai Checkbox.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center justify-between w-full max-w-xs gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3">
                <div>
                  <Label htmlFor="dd-sw-1" className="text-xs font-medium">Aktifkan notifikasi delivery</Label>
                  <p className="text-[10px] text-text-sub-600">Email + SMS saat status berubah.</p>
                </div>
                <Switch id="dd-sw-1" defaultChecked />
              </div>
            ),
            caption: "Label action verb 'Aktifkan notifikasi delivery' + description scope (Email+SMS). User pahami efek toggle.",
          }}
          dont={{
            preview: (
              <div className="flex items-center gap-2 w-full max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3">
                <Switch id="dd-sw-2" />
                <Label htmlFor="dd-sw-2" className="text-xs">On / Off</Label>
              </div>
            ),
            caption: "Label 'On / Off' abstrak = user tidak tahu apa yang akan on/off. Pakai action verb spesifik.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 max-w-xs">
                <Label htmlFor="dd-sw-3" className="text-xs">Auto-suspend mitra setelah 3 dispatch terlewat</Label>
                <Switch id="dd-sw-3" defaultChecked />
              </div>
            ),
            caption: "Setting auto-save (langsung apply saat toggle). Tidak perlu Save button untuk setting yang instant-apply.",
          }}
          dont={{
            preview: (
              <div className="flex items-center gap-2 w-full max-w-xs">
                <Switch id="dd-sw-4" />
                <Label htmlFor="dd-sw-4" className="text-xs">Saya menyetujui Syarat & Ketentuan</Label>
              </div>
            ),
            caption: "Untuk consent / opt-in form (TOS, marketing email) pakai Checkbox. Switch implikasi instant-apply, T&C tidak.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "checked", type: "boolean", description: "Controlled state." },
            { name: "defaultChecked", type: "boolean", description: "Uncontrolled initial state." },
            { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Fires on toggle." },
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Track size. md = Figma canonical (28×16)." },
            { name: "disabled", type: "boolean", description: "Disable interaction." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Switch</strong> — Radix Switch.Root with Thumb. Track flips bg on data-state.</li>
          <li>• <strong>Label</strong> — pair via <code className="text-xs">id</code>/<code className="text-xs">htmlFor</code> for click-to-toggle.</li>
          <li>• <strong>Sublabel</strong> — secondary text after label (e.g. " (Sublabel)").</li>
          <li>• <strong>Badge "NEW"</strong> — Badge size=xs appearance=light status=information.</li>
          <li>• <strong>Description + LinkButton</strong> — supporting paragraph below label + action link.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Native role</strong> — Radix provides <code className="text-xs">role=&quot;switch&quot;</code> + <code className="text-xs">aria-checked</code> automatically.</li>
          <li>• <strong>Label wiring</strong> — pass <code className="text-xs">id</code> on Switch + <code className="text-xs">htmlFor</code> on Label.</li>
          <li>• <strong>Keyboard</strong> — <code className="text-xs">Space</code> / <code className="text-xs">Enter</code> toggles. <code className="text-xs">Tab</code> moves focus.</li>
          <li>• <strong>Color-independence</strong> — thumb position changes on toggle (not color alone).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function SwitchCard({
  leading,
  state,
}: {
  leading: "text" | "icon" | "avatar"
  state: "default" | "hover" | "selected" | "disabled"
}) {
  const checked = state === "selected"
  const disabled = state === "disabled"
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 bg-bg-white-0 transition-colors",
        state === "hover" && "bg-bg-weak-50",
        state === "selected" && "border-(--primary-base) ring-1 ring-(--primary-base)",
        state === "default" && "border-stroke-soft-200",
        state === "hover" && "border-stroke-soft-200",
        state === "disabled" && "border-stroke-soft-200 opacity-60",
      )}
    >
      {leading === "icon" ? (
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-white-0 border border-stroke-soft-200">
          <UserIcon className="size-4 text-icon-soft-400" />
        </span>
      ) : leading === "avatar" ? (
        <Avatar size="sm">
          <AvatarImage src="https://i.pravatar.cc/40?u=3" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      ) : null}
      <div className="flex-1 space-y-1">
        <div className="inline-flex items-center gap-1.5">
          <span className="text-sm font-medium text-text-strong-950">Label</span>
          <span className="text-xs text-text-soft-400">(Sublabel)</span>
          <Badge size="sm" appearance="lighter" status="information">NEW</Badge>
        </div>
        <p className="text-xs text-text-sub-600">Insert the checkbox description here.</p>
      </div>
      <Switch defaultChecked={checked} disabled={disabled} />
    </div>
  )
}

function MenuRow({
  icon: Icon,
  trailing,
  dark,
  children,
}: {
  icon: React.ElementType
  trailing?: React.ReactNode
  dark?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer", dark ? "hover:bg-white/10 text-white" : "hover:bg-bg-weak-50 text-text-strong-950")}>
      <Icon className={cn("size-4", dark ? "text-white/70" : "text-icon-soft-400")} />
      <span className="flex-1">{children}</span>
      {trailing}
    </div>
  )
}

function PrefRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex gap-3">
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        <p className="text-xs text-text-sub-600">{description}</p>
      </div>
    </div>
  )
}

function IntegrationRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-stroke-soft-200 p-3 bg-bg-white-0">
      {icon}
      <div className="flex-1">
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        <p className="text-xs text-text-sub-600">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function SwitchRow({ leading }: { leading: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-stroke-soft-200 p-3 bg-bg-white-0">
      {leading}
      <div className="flex-1">
        <div className="inline-flex items-center gap-1.5">
          <span className="text-sm font-medium text-text-strong-950">Label</span>
          <span className="text-xs text-text-soft-400">(Sublabel)</span>
          <Badge size="sm" appearance="lighter" status="information">NEW</Badge>
        </div>
        <p className="text-xs text-text-sub-600">Insert the checkbox description here.</p>
      </div>
      <Switch />
    </div>
  )
}
