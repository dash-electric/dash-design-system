"use client"

import { RiDashboardLine as LayoutDashboard, RiTruckLine as Truck, RiTeamLine as Users, RiLifebuoyLine as LifeBuoy, RiBillLine as Receipt, RiNotification3Line as Bell, RiSearchLine as Search } from "@remixicon/react"
import { DashboardShell } from "@/registry/dash/templates/dashboard-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/registry/dash/ui/card"
import { Stat, StatLabel, StatValue, StatTrend } from "@/registry/dash/ui/stat"
import { Badge } from "@/registry/dash/ui/badge"
import { IconButton } from "@/registry/dash/ui/icon-button"
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

export default function DashboardShellDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Generic"
        title="Dashboard Shell"
        description="Sidebar + topbar + content layout — the canonical Dash backoffice page. Compose your own nav groups, header actions, and page body; everything else (responsive collapse, scroll containment, focus management) is handled."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add dashboard-shell`} />
      </DocsSection>

      <DocsSection
        title="Examples"
        description="Same shell, different domains. Swap groups + headerActions + children to change the page."
      >
        <DocsExample
          bare
          title="Halo-dash overview"
          description="3 KPI tiles + tribe activity panel. Default rendering — no headerActions, no user avatar."
          preview={
            <DocsTemplatePreview>
              <DashboardShell
                groups={[
                  {
                    label: "Operasi",
                    items: [
                      { label: "Dashboard", icon: <LayoutDashboard />, active: true },
                      { label: "Dispatch", icon: <Truck /> },
                      { label: "Mitra", icon: <Users /> },
                      { label: "Payouts", icon: <Receipt /> },
                    ],
                  },
                  { label: "Support", items: [{ label: "Tickets", icon: <LifeBuoy /> }] },
                ]}
              >
                <div className="space-y-6">
                  <header>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-text-sub-600">Snapshot dispatch hari ini · 16:30 WIB</p>
                  </header>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <Stat>
                        <StatLabel>Mitra aktif</StatLabel>
                        <StatValue>734</StatValue>
                        <StatTrend trend="up" value="+12">7-day</StatTrend>
                      </Stat>
                    </Card>
                    <Card>
                      <Stat>
                        <StatLabel>Dispatch terkirim</StatLabel>
                        <StatValue>1,284</StatValue>
                        <StatTrend trend="up" value="12.4%">vs kemarin</StatTrend>
                      </Stat>
                    </Card>
                    <Card>
                      <Stat>
                        <StatLabel>Suspended</StatLabel>
                        <StatValue>28</StatValue>
                        <StatTrend trend="down" value="-3">7-day</StatTrend>
                      </Stat>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Tribe activity</CardTitle>
                      <CardDescription>Reservasi · Express · Bulk</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2 flex-wrap">
                      <Badge status="success" appearance="lighter">Reservasi · normal</Badge>
                      <Badge status="warning" appearance="lighter">Express · surge 1.4×</Badge>
                      <Badge status="information" appearance="lighter">Bulk · stable</Badge>
                    </CardContent>
                  </Card>
                </div>
              </DashboardShell>
            </DocsTemplatePreview>
          }
          code={`<DashboardShell
  groups={[
    { label: "Operasi", items: [{ label: "Dashboard", icon: <LayoutDashboard />, active: true }, …] },
    { label: "Support", items: [{ label: "Tickets", icon: <LifeBuoy /> }] },
  ]}
>
  {/* your page body */}
</DashboardShell>`}
        />

        <DocsExample
          bare
          title="With user + header actions"
          description="Full shell — branded sidebar, search + notifications in topbar, user avatar. This is the production config for Tribe-Express dispatch console."
          preview={
            <DocsTemplatePreview>
              <DashboardShell
                brand={<span className="font-semibold tracking-tight">Tribe-Express</span>}
                user={{ name: "Fayzul A.", email: "fayzul@dash.id", initials: "FA" }}
                groups={[
                  {
                    label: "Dispatch",
                    items: [
                      { label: "Live queue", icon: <Truck />, active: true },
                      { label: "Mitra", icon: <Users /> },
                      { label: "Payouts", icon: <Receipt /> },
                    ],
                  },
                ]}
                headerActions={
                  <div className="flex items-center gap-2">
                    <IconButton size="sm" tone="neutral" style="ghost" aria-label="Search">
                      <Search className="size-4" />
                    </IconButton>
                    <IconButton size="sm" tone="neutral" style="ghost" aria-label="Notifications">
                      <Bell className="size-4" />
                    </IconButton>
                    <Button size="sm">New dispatch</Button>
                  </div>
                }
              >
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight">Live dispatch</h1>
                  <p className="text-sm text-text-sub-600">Real-time queue · 18 menit avg lead time</p>
                </div>
              </DashboardShell>
            </DocsTemplatePreview>
          }
          code={`<DashboardShell
  brand={<TribeExpressLogo />}
  user={{ name: "Fayzul A.", email: "fayzul@dash.id", initials: "FA" }}
  groups={[…]}
  headerActions={
    <>
      <IconButton aria-label="Search"><Search /></IconButton>
      <IconButton aria-label="Notifications"><Bell /></IconButton>
      <Button size="sm">New dispatch</Button>
    </>
  }
>
  {children}
</DashboardShell>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="A thin layout shell — no opinions on routing, state, or data fetching."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Sidebar uses the <code>Sidebar</code> primitive — collapsible on mobile, sticky on desktop.</li>
          <li>Topbar uses <code>Topbar</code> with <code>brand</code> on the left and <code>headerActions</code> on the right.</li>
          <li>Main area is a vertically scrollable region; the sidebar and topbar stay pinned.</li>
          <li>NavItems accept <code>href</code> for client-side routing, or <code>onClick</code> for imperative navigation.</li>
          <li>Use <code>active: true</code> to highlight the current route — usually derived from <code>usePathname()</code>.</li>
          <li>Use <code>groups</code> to visually separate Operasi vs Support vs Settings sections.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> as the layout for any signed-in backoffice route — Halo-dash, Tribe-Express, developer admin.</li>
          <li><strong>Use</strong> when you need a persistent sidebar nav across pages.</li>
          <li><strong>Use</strong> when the page has a single primary content area (KPIs, tables, forms).</li>
          <li><strong>Don't</strong> use for 3-pane workflows (list / thread / inspector) — reach for <code>HaloDash3Pane</code>.</li>
          <li><strong>Don't</strong> use for auth, settings, or stepper flows — they have dedicated templates.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "brand", type: "ReactNode", defaultValue: '"Dash"', description: "Sidebar header — logo or wordmark." },
            { name: "groups", type: "Array<{ label?, items: NavItem[] }>", description: "Sidebar nav groups. NavItem = { label, icon, active?, href? }." },
            { name: "user", type: "{ name, email?, initials? }", description: "Avatar shown in topbar's user menu." },
            { name: "headerActions", type: "ReactNode", description: "Extra topbar slot — search, theme toggle, primary CTA." },
            { name: "children", type: "ReactNode", description: "Page body rendered in the main scrollable area." },
          ]}
        />
      </DocsSection>
      <DocsSection title="Sidebar landmark">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Backoffice pages always anchor to a 272px sidebar + 90px sticky header + max-w 1360px content rail. Don't ship full-bleed dashboards without nav.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md h-32 rounded-lg border border-stroke-soft-200 bg-bg-white-0 overflow-hidden grid grid-cols-[80px_1fr]">
                <div className="bg-bg-weak-50 border-r border-stroke-soft-200 p-2 space-y-1.5"><div className="h-3 rounded bg-bg-soft-200" /><div className="h-3 rounded bg-bg-soft-200" /><div className="h-3 rounded bg-primary-base" /><div className="h-3 rounded bg-bg-soft-200" /></div>
                <div className="space-y-2 p-2"><div className="h-4 rounded bg-bg-soft-200 w-24" /><div className="grid grid-cols-3 gap-1.5"><div className="h-12 rounded bg-bg-weak-50" /><div className="h-12 rounded bg-bg-weak-50" /><div className="h-12 rounded bg-bg-weak-50" /></div></div>
              </div>
            ),
            caption: "Persistent sidebar on the left, scrollable content rail on the right. Ops can navigate without losing context.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md h-32 rounded-lg border border-stroke-soft-200 bg-bg-white-0 overflow-hidden p-2 space-y-2">
                <div className="h-4 rounded bg-bg-soft-200 w-24" />
                <div className="grid grid-cols-4 gap-1.5"><div className="h-12 rounded bg-bg-weak-50" /><div className="h-12 rounded bg-bg-weak-50" /><div className="h-12 rounded bg-bg-weak-50" /><div className="h-12 rounded bg-bg-weak-50" /></div>
              </div>
            ),
            caption: "Don't ship full-bleed dashboards with no sidebar. User loses their navigation landmark and can't switch sections.",
          }}
        />
      </DocsSection>

      <DocsSection title="Header actions hierarchy">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Header carries one primary CTA + 2-3 icon buttons (search, notifications, profile). Don't load it with five filled buttons.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 flex items-center justify-between">
                <p className="text-sm font-medium">Live dispatch</p>
                <div className="flex items-center gap-2"><div className="size-7 rounded-md border border-stroke-soft-200" /><div className="size-7 rounded-md border border-stroke-soft-200" /><div className="h-7 px-3 rounded-md bg-primary-base text-static-white text-xs flex items-center">+ Dispatch</div></div>
              </div>
            ),
            caption: "Icon-button utilities sit next to one filled primary CTA. The page action is unambiguous.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium whitespace-nowrap">Live dispatch</p>
                <div className="flex items-center gap-1.5"><div className="h-7 px-2 rounded-md bg-primary-base text-static-white text-[10px] flex items-center">Export</div><div className="h-7 px-2 rounded-md bg-primary-base text-static-white text-[10px] flex items-center">Import</div><div className="h-7 px-2 rounded-md bg-primary-base text-static-white text-[10px] flex items-center">Bulk</div><div className="h-7 px-2 rounded-md bg-primary-base text-static-white text-[10px] flex items-center">+ Dispatch</div></div>
              </div>
            ),
            caption: "Don't paint every header action filled purple. The primary action drowns in equal-weight siblings.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
