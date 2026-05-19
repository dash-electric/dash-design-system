"use client"

import * as React from "react"
import {
  RiArrowRightSLine,
  RiBillLine,
  RiBox3Line,
  RiEqualizerLine,
  RiHeadphoneLine,
  RiMenuLine,
  RiNotification3Line,
  RiQuestionLine,
  RiSettings2Line,
  RiSidebarUnfoldLine,
  RiStore3Line,
} from "@remixicon/react"
import { IconButton } from "@/registry/dash/ui/icon-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Portal Dashboard Shell. Ported from Dash Next Portal v2 source (2026-05-19).
 * Source: app/[locale]/(dashboard)/layout.tsx + components/sidebar/sidebar.tsx + components/header/DashboardHeader.tsx
 * Layout: fixed left sidebar (272px expanded / 80px collapsed) + content column (max-w-[1360px])
 * with sticky 90px-tall header. Hotkey ⌘B / Ctrl+B toggles collapse.
 */
export default function PortalDashboardShellPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Dashboard Shell"
        description="The canonical Next Portal v2 backoffice layout: fixed left sidebar (272px / 80px collapsed) with role-aware navigation, sticky 90px header with notifications + language select, and a centered content column (max-w-[1360px])."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Expanded sidebar + header + empty content"
          description="Source nav (super-admin role, no sandbox): Deliveries · Address · Billing · Outlets · Developers under MAIN; Settings · Support · Help under OTHERS. Active route uses `bg-bg-weak-50` row + primary-base left rail indicator + chevron right."
          preview={
            <DocsTemplatePreview>
              <PortalDashboardShell>
                <ContentPlaceholder />
              </PortalDashboardShell>
            </DocsTemplatePreview>
          }
          code={`<div className="flex min-h-screen flex-col">
  {/* AnnouncementBar — optional */}
  <div className="grid flex-1 grid-cols-[auto,minmax(0,1fr)]">
    <Sidebar /> {/* fixed left, 272/80 collapsed */}
    <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col gap-4">
      <DashboardHeader /> {/* sticky top 90px */}
      {children}
    </div>
  </div>
</div>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Sidebar header</strong> — clickable Dash logo + collapse toggle (<code>RiSidebarUnfoldLine</code>). Hotkey <code>⌘B</code> / <code>Ctrl+B</code>.</li>
          <li><strong>Main nav</strong> — section label “MAIN” (uppercase subheading-xs text-text-soft-400). Items: Deliveries · Address · Billing · Outlets · Users · Policies · Developers (filtered by <code>userRole</code> + feature flags + client config).</li>
          <li><strong>Settings & support</strong> — section label “OTHERS”: Settings · Support (WhatsApp) · Help (external dash-guides.lovable.app).</li>
          <li><strong>User profile</strong> — sticky <code>UserButton</code> at the bottom of sidebar.</li>
          <li><strong>Mobile</strong> — sidebar hidden under <code>lg</code>, slide-in via <code>RiMenuLine</code> in header (Radix Dialog).</li>
          <li><strong>Header</strong> — sticky <code>top-0 z-30</code>, 90px tall. Right side: <code>AvailabilityStatus</code> · <code>LanguageSelect</code> · <code>DeliveryNotificationBell</code> (or warning icon when permission blocked).</li>
          <li><strong>Sandbox banner</strong> — when <code>envMode==='sandbox'</code>, fixed yellow warning <code>Alert</code> with “Exit Sandbox” link.</li>
          <li><strong>Topbar offset</strong> — body padding-top = announcementBar (40) + sandboxBar (36) when both visible.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>IconButton</code> — mobile menu trigger + collapse toggle.</li>
          <li><code>Avatar</code> + <code>DropdownMenu</code> — user profile button (UserButton in source).</li>
          <li><code>Tooltip</code> — notification bell blocked state.</li>
          <li><code>Divider</code> — section separators.</li>
          <li><code>ScrollArea</code> — sidebar overflow.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Portal Dashboard Shell                                                     */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { icon: RiBox3Line, label: "Deliveries", href: "/deliveries", active: true },
  { icon: RiStore3Line, label: "Address", href: "/addresses" },
  { icon: RiBillLine, label: "Billing", href: "/billing" },
  { icon: RiStore3Line, label: "Outlets", href: "/outlets" },
  { icon: RiEqualizerLine, label: "Developers", href: "/developer" },
] as const

const OTHER_LINKS = [
  { icon: RiSettings2Line, label: "Settings", href: "/setting" },
  { icon: RiHeadphoneLine, label: "Support", href: "#" },
  { icon: RiQuestionLine, label: "Help", href: "#" },
] as const

export function PortalDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[820px]">
      <PortalSidebar />
      <div className="flex flex-1 flex-col bg-bg-white-0">
        <PortalDashboardHeader />
        <div className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col gap-4 px-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export function PortalSidebar() {
  return (
    <aside className="relative z-10 h-auto w-[272px] shrink-0 overflow-hidden border-r border-stroke-soft-200 bg-bg-white-0">
      <div className="flex h-full flex-col overflow-auto">
        {/* Header */}
        <div className="p-3">
          <div className="flex cursor-pointer items-center justify-between p-3">
            <div className="flex items-center gap-2 text-label-md font-semibold tracking-tight text-text-strong-950">
              <span className="grid size-7 place-items-center rounded-md bg-(--dash-purple-600) text-white text-xs">D</span>
              dash
            </div>
            <div className="grid size-6 place-items-center rounded-md border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs">
              <RiSidebarUnfoldLine className="size-5 text-text-sub-600" />
            </div>
          </div>
        </div>
        <div className="px-5">
          <div className="h-px bg-stroke-soft-200" />
        </div>

        {/* Nav */}
        <div className="flex flex-1 flex-col gap-5 px-5 pb-4 pt-5">
          <NavGroup label="Main" items={NAV_LINKS} />
          <NavGroup label="Others" items={OTHER_LINKS} />
        </div>

        <div className="px-5">
          <div className="h-px bg-stroke-soft-200" />
        </div>

        {/* User profile */}
        <div className="p-3">
          <div className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-bg-weak-50">
            <div className="size-9 rounded-full bg-(--dash-purple-100) text-center text-sm leading-9 text-(--dash-purple-700)">
              IP
            </div>
            <div className="flex-1">
              <div className="text-label-sm text-text-strong-950">Irfan Prima</div>
              <div className="text-paragraph-xs text-text-sub-600">Super admin</div>
            </div>
            <RiArrowRightSLine className="size-4 text-text-soft-400" />
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavGroup({
  label,
  items,
}: {
  label: string
  items: readonly { icon: React.ComponentType<{ className?: string }>; label: string; href: string; active?: boolean }[]
}) {
  return (
    <div className="space-y-2">
      <div className="p-1 text-subheading-xs uppercase text-text-soft-400">
        {label}
      </div>
      <div className="space-y-1">
        {items.map(({ icon: Icon, label, active }) => (
          <a
            key={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-text-sub-600 transition duration-200 ease-out hover:bg-bg-weak-50",
              "aria-[current=page]:bg-bg-weak-50",
            )}
          >
            <div
              className={cn(
                "absolute top-1/2 -left-5 h-5 w-1 origin-left -translate-y-1/2 rounded-r-full bg-primary-base transition duration-200 ease-out",
                active ? "scale-100" : "scale-0",
              )}
            />
            <Icon className="size-5 shrink-0 text-text-sub-600 group-aria-[current=page]:text-primary-base" />
            <div className="flex w-[180px] shrink-0 items-center gap-2">
              <div className="flex-1 text-label-sm">{label}</div>
              {active ? <RiArrowRightSLine className="size-5 text-text-sub-600" /> : null}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export function PortalDashboardHeader() {
  return (
    <div className="sticky top-0 z-30 h-[90px] w-full bg-bg-white-0 px-8 py-5">
      <header className="flex h-16 w-full items-center justify-between px-5 lg:justify-end">
        <IconButton style="ghost" tone="neutral" size="md" aria-label="Menu" className="lg:hidden">
          <RiMenuLine className="size-5" />
        </IconButton>
        <div className="flex items-center gap-4">
          <span className="rounded-md bg-success-lighter px-2 py-1 text-paragraph-xs text-success-dark">
            Driver available
          </span>
          <span className="text-sm text-text-sub-600">EN</span>
          <IconButton style="ghost" tone="neutral" size="md" aria-label="Notifications">
            <RiNotification3Line className="size-5" />
          </IconButton>
        </div>
      </header>
      <div className="h-px bg-stroke-soft-200" />
    </div>
  )
}

function ContentPlaceholder() {
  return (
    <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-weak-50 py-32 text-text-soft-400">
      {`{children}`}
    </div>
  )
}
