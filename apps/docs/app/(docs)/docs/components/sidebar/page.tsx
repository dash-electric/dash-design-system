"use client"

import { RiDashboardLine as LayoutDashboard, RiTruckLine as Truck, RiTeamLine as Users, RiSettings3Line as Settings, RiLifebuoyLine as LifeBuoy } from "@remixicon/react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarTrigger,
  SidebarInset,
} from "@/registry/dash/ui/sidebar"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SidebarDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Navigation"
        title="Sidebar"
        description="Composable left/right rail for shell layouts. Lightweight: no built-in mobile collapse — pair with Sheet for mobile. Use useSidebar() hook to drive collapsed state."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add sidebar`} />
      </DocsSection>

      <DocsSection title="Example">
        <DocsExample
          title="Halo-dash shell"
          preview={
            <div className="h-80 w-full overflow-hidden rounded-xl border border-stroke-soft-200">
              <SidebarProvider className="h-full">
                <Sidebar>
                  <SidebarHeader>
                    <span className="font-semibold text-text-strong-950">Halo-dash</span>
                  </SidebarHeader>
                  <SidebarContent>
                    <SidebarGroup>
                      <SidebarGroupLabel>Operasi</SidebarGroupLabel>
                      <SidebarItem active>
                        <LayoutDashboard /> Dashboard
                      </SidebarItem>
                      <SidebarItem>
                        <Truck /> Dispatch
                      </SidebarItem>
                      <SidebarItem>
                        <Users /> Mitra
                      </SidebarItem>
                    </SidebarGroup>
                    <SidebarGroup>
                      <SidebarGroupLabel>Support</SidebarGroupLabel>
                      <SidebarItem>
                        <LifeBuoy /> Tickets
                      </SidebarItem>
                    </SidebarGroup>
                  </SidebarContent>
                  <SidebarFooter>
                    <SidebarItem><Settings /> Settings</SidebarItem>
                  </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                  <header className="flex h-14 items-center gap-2 border-b border-stroke-soft-200 px-4">
                    <SidebarTrigger />
                    <span className="text-sm font-semibold">Dashboard</span>
                  </header>
                  <div className="flex-1 p-6 text-sm text-text-sub-600">
                    Konten halaman. Tekan tombol di kiri header untuk collapse sidebar.
                  </div>
                </SidebarInset>
              </SidebarProvider>
            </div>
          }
          code={`<SidebarProvider>
  <Sidebar>
    <SidebarHeader>Halo-dash</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Operasi</SidebarGroupLabel>
        <SidebarItem active><LayoutDashboard /> Dashboard</SidebarItem>
        <SidebarItem><Truck /> Dispatch</SidebarItem>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarItem><Settings /> Settings</SidebarItem>
    </SidebarFooter>
  </Sidebar>
  <SidebarInset>
    <header className="flex h-14 items-center gap-2 px-4 border-b">
      <SidebarTrigger />
      <span>Dashboard</span>
    </header>
    <div className="flex-1 p-6">…</div>
  </SidebarInset>
</SidebarProvider>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Sidebar untuk primary navigation app shell. 5-8 items top level, group by domain. Bukan untuk content scroll list.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-32 text-xs rounded border border-stroke-soft-200 bg-bg-weak-50 p-1 space-y-0.5">
                <div className="text-[9px] uppercase text-text-soft-400 px-2 pt-1">Halo-dash</div>
                <div className="rounded bg-bg-white-0 px-2 py-1">Dispatch</div>
                <div className="rounded px-2 py-1">Mitra</div>
                <div className="rounded px-2 py-1">Outlet</div>
                <div className="border-t border-stroke-soft-200 my-1" />
                <div className="text-[9px] uppercase text-text-soft-400 px-2">Admin</div>
                <div className="rounded px-2 py-1">Settings</div>
              </div>
            ),
            caption: "Group items by domain (Halo-dash, Admin). Active item highlighted. 4-5 items per group ideal.",
          }}
          dont={{
            preview: (
              <div className="w-32 text-xs rounded border border-stroke-soft-200 bg-bg-weak-50 p-1 space-y-0.5 max-h-32 overflow-hidden">
                {["Dispatch", "Allocate", "Track", "Cancel", "Mitra", "Driver", "Partner", "Outlet"].map(i => (
                  <div key={i} className="rounded px-2 py-1">{i}</div>
                ))}
              </div>
            ),
            caption: "Hindari 12+ items flat tanpa grouping. Sidebar scrollable = signal bahwa nav butuh restructure.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Collapsible ke icon-only mode (40px) untuk dispatcher yang butuh real-estate. Tooltip on hover saat collapsed.",
          }}
          dont={{
            caption: "Jangan render Sidebar di mobile permanent. Hide ke off-canvas (Sheet), tampilkan via hamburger.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold text-text-strong-950 pt-2">SidebarProvider</h3>
        <DocsPropsTable
          rows={[
            { name: "defaultState", type: '"expanded" | "collapsed"', defaultValue: '"expanded"', description: "Uncontrolled initial state." },
            { name: "state / onStateChange", type: "controlled", description: "Controlled state pair." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">Sidebar</h3>
        <DocsPropsTable
          rows={[
            { name: "side", type: '"left" | "right"', defaultValue: '"left"', description: "Anchored edge." },
            { name: "collapsedWidth", type: '"none" | "icon"', defaultValue: '"icon"', description: "Width when collapsed. icon = leaves icons visible." },
            { name: "width", type: "string", defaultValue: '"16rem"', description: "Expanded width (CSS length)." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">SidebarHeader / Content / Footer / Group</h3>
        <DocsPropsTable
          rows={[
            { name: "SidebarHeader", type: "slot", description: "Pinned top — usually logo + workspace switcher." },
            { name: "SidebarContent", type: "slot", description: "Scrollable middle area for groups + items." },
            { name: "SidebarFooter", type: "slot", description: "Pinned bottom — settings, sign out, user chip." },
            { name: "SidebarGroup", type: "slot", description: "Logical group of items." },
            { name: "SidebarGroupLabel", type: "label", description: "Uppercase section title (hidden when collapsed)." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">SidebarItem</h3>
        <DocsPropsTable
          rows={[
            { name: "active", type: "boolean", description: "Current-route highlight (purple accent + bg)." },
            { name: "asChild", type: "boolean", description: "Render as Next/Link via Radix Slot." },
            { name: "icon", type: "ReactNode", description: "Leading icon (auto-sized)." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">SidebarTrigger / SidebarInset</h3>
        <DocsPropsTable
          rows={[
            { name: "SidebarTrigger", type: "button", description: "Toggle expand / collapse from anywhere inside provider." },
            { name: "SidebarInset", type: "main slot", description: "Inner content area sibling to Sidebar — header + main." },
            { name: "useSidebar()", type: "hook", description: "{ state, setState, toggle, isCollapsed } from anywhere inside provider." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <code className="text-xs">SidebarProvider</code> wraps the entire shell — owns expand / collapse state.</li>
          <li>• <code className="text-xs">Sidebar</code> sits next to <code className="text-xs">SidebarInset</code> (your page content).</li>
          <li>• Slots inside Sidebar: <code className="text-xs">SidebarHeader</code> → <code className="text-xs">SidebarContent</code> (groups of items) → <code className="text-xs">SidebarFooter</code>.</li>
          <li>• Within Content, group items via <code className="text-xs">SidebarGroup</code> + <code className="text-xs">SidebarGroupLabel</code>.</li>
          <li>• Mobile: render <code className="text-xs">Sheet</code> instead of <code className="text-xs">Sidebar</code> when <code className="text-xs">useMobile()</code> returns true.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <code className="text-xs">Sidebar</code> renders as <code className="text-xs">&lt;aside&gt;</code> with role=&quot;navigation&quot;.</li>
          <li>• Group labels hide when collapsed (icon-only mode) — pair icons with <code className="text-xs">aria-label</code> on each <code className="text-xs">SidebarItem</code>.</li>
          <li>• Active route: set <code className="text-xs">active</code> prop and also <code className="text-xs">aria-current=&quot;page&quot;</code> when wrapping a real Link.</li>
          <li>• <code className="text-xs">SidebarTrigger</code> announces &ldquo;Expand sidebar&rdquo; / &ldquo;Collapse sidebar&rdquo; via <code className="text-xs">aria-label</code>.</li>
          <li>• Persist user preference in localStorage so it survives reloads.</li>
          <li>• Keyboard: <code className="text-xs">Tab</code> reaches each item; <code className="text-xs">Enter</code> activates. No custom arrow nav — items are real links.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
