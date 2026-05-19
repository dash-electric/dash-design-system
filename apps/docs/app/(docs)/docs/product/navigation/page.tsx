"use client"

import * as React from "react"
import {
  RiDashboardLine as Grid,
  RiCalendarLine as CalendarI,
  RiTimer2Line as Timer,
  RiBriefcaseLine as Briefcase,
  RiTeamLine as Team,
  RiSettings3Line as SettingsI,
  RiAppsLine as Apps,
  RiSearchLine as Search,
  RiFlashlightLine as Flash,
  RiNotification3Line as Bell,
  RiArrowDownSLine as ChevronDown,
  RiArrowRightSLine as ChevronRight,
  RiArrowLeftSLine as ChevronLeft,
  RiVerifiedBadgeFill as Verified,
  RiBankCardLine as CardIcon,
  RiExchangeLine as Exchange,
  RiArrowLeftRightLine as Transfer,
  RiHistoryLine as History,
  RiUserLine as UserI,
  RiCloseLine as X,
  RiQuestionLine as Help,
  RiCloudLine as Cloud,
  RiGift2Line as Gift,
  RiHeadphoneLine as Headphone,
  RiVideoChatLine as Video,
  RiSidebarFoldLine as SidebarFold,
  RiSidebarUnfoldLine as SidebarUnfold,
} from "@remixicon/react"
import { DashLogo } from "@/registry/dash/ui/dash-logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Badge } from "@/registry/dash/ui/badge"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Kbd } from "@/registry/dash/ui/kbd"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Product Navigation — Figma 1:1 (11 nodes verified 2026-05-18).
 *
 *   3802:11759   Sidebar gallery — 10 product app variants (Apex / Solaris / etc)
 *   3741:45019   Sidebar nav item primitive — 3 states × 2 layouts
 *   3802:10204   Sidebar header — brand block × 4 states
 *   3789:3886    Sidebar header w/ collapse rail
 *   3802:11038   Sidebar footer user pill × 4 states
 *   3789:5341    Sidebar footer user pill (compact)
 *   3789:3551    Sidebar notice cards — 4 styles × 7 patterns
 *   3814:25274   Topbar — 4 product variants
 *   3802:24588   Topbar nav item primitive × 3 states
 *   3814:24667   Topbar user pill × 3 states
 *   3814:25156   Topbar icon-button × 3 states
 */

const APEX_BLUE = "#3F6FFF"

export default function ProductNavigationDocsPage() {
  const [active, setActive] = React.useState("dashboard")
  const [activeTop, setActiveTop] = React.useState("dashboard")
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Navigation"
        title="Navigation"
        description="Full product navigation kit — sidebar shell (header + items + footer + notice cards) and topbar shell (logo + items + search + actions + user). Compose into dashboard / SaaS / fintech / HR product surfaces. Light + dark, expanded + collapsed, with Dash + AlignUI vertical brand variants."
      />

      {/* SIDEBAR ============================================================ */}

      <DocsSection title="Sidebar — nav item primitive">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Building block of every sidebar. 3 states (default / hover / active) × 2 layouts (label · icon-only). Active = primary-tinted bg + left rail indicator (Figma node 3741:45019).
        </p>
        <DocsExample
          title="Single row × 3 states + icon-only collapsed"
          preview={
            <div className="space-y-2 max-w-xs">
              <SideItem icon={Grid} label="Dashboard" state="default" />
              <SideItem icon={Grid} label="Dashboard" state="hover" />
              <SideItem icon={Grid} label="Dashboard" state="active" />
              <div className="flex gap-3 pt-2">
                <SideItem icon={Grid} state="default" iconOnly />
                <SideItem icon={Grid} state="hover" iconOnly />
                <SideItem icon={Grid} state="active" iconOnly />
              </div>
            </div>
          }
          code={`<SideItem icon={Grid} label="Dashboard" />
<SideItem icon={Grid} label="Dashboard" state="active" />
<SideItem icon={Grid} iconOnly />`}
        />
      </DocsSection>

      <DocsSection title="Sidebar — header (brand block)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Top of every sidebar — brand logo + app name + tagline + collapse toggle. Supports Dash brand or product-vertical brand (Apex / Solaris). Figma nodes 3802:10204 + 3789:3886.
        </p>
        <DocsExample
          title="Brand × 4 states"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <SidebarHeader brand="apex" expanded />
              <SidebarHeader brand="apex" expanded className="bg-bg-weak-50" />
              <SidebarHeader brand="apex" expanded={false} />
              <SidebarHeader brand="apex" expanded={false} className="bg-bg-weak-50" />
            </div>
          }
          code={`<SidebarHeader brand="apex" expanded />
<SidebarHeader brand="apex" expanded={false} />`}
        />
      </DocsSection>

      <DocsSection title="Sidebar — footer user pill">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Bottom of sidebar — avatar + name + email + verified mark + open-menu chevron. Compact (collapsed) variant shows avatar only. Figma nodes 3802:11038 + 3789:5341.
        </p>
        <DocsExample
          title="2 sizes × 2 states"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <UserPill expanded />
              <UserPill expanded className="bg-bg-weak-50" />
              <UserPill expanded={false} />
              <UserPill expanded={false} className="bg-bg-weak-50" />
            </div>
          }
          code={`<UserPill expanded />
<UserPill expanded={false} />`}
        />
      </DocsSection>

      <DocsSection title="Sidebar — notice cards">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Promo / status cards slotted between nav items + footer. 7 patterns × 4 surface styles (white / gray / purple / black). Figma node 3789:3551.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          {(["white", "gray", "purple", "black"] as const).map((style) => (
            <div key={style} className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-text-soft-400">{style}</div>
              <NoticeCard variant={style} type="meeting" />
              <NoticeCard variant={style} type="cloud-capacity" />
              <NoticeCard variant={style} type="upgrade" />
              <NoticeCard variant={style} type="claim" />
              <NoticeCard variant={style} type="support" />
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Sidebar — full assembly">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Header + items + notice + footer composed into a real sidebar shell. Click collapse to toggle rail mode (Figma node 3802:11759).
        </p>
        <DocsExample
          title="Apex Finance sidebar (light, expanded ↔ collapsed)"
          preview={
            <div className="flex gap-3 items-start">
              <Sidebar
                brand="apex"
                collapsed={collapsed}
                active={active}
                onActiveChange={setActive}
                onToggleCollapse={() => setCollapsed((c) => !c)}
              />
              <div className="text-xs text-text-sub-600">
                Active section: <code className="px-1 py-0.5 rounded bg-bg-weak-50">{active}</code>
                <br />
                <button onClick={() => setCollapsed((c) => !c)} className="mt-2 inline-flex items-center gap-1 text-(--primary-base) hover:underline">
                  {collapsed ? <SidebarUnfold className="size-4" /> : <SidebarFold className="size-4" />}
                  {collapsed ? "Expand" : "Collapse"}
                </button>
              </div>
            </div>
          }
          code={`<Sidebar
  brand="apex"
  active={active}
  onActiveChange={setActive}
  collapsed={collapsed}
  onToggleCollapse={() => setCollapsed(c => !c)}
/>`}
        />
        <DocsExample
          title="Dash sidebar (dark surface variant)"
          preview={
            <Sidebar brand="dash" theme="dark" active="dashboard" onActiveChange={() => {}} />
          }
          code={`<Sidebar brand="dash" theme="dark" />`}
        />
      </DocsSection>

      {/* TOPBAR ============================================================= */}

      <DocsSection title="Topbar — nav item primitive">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Horizontal nav pill. 3 states (default / hover / active). Active = bg-weak-50 fill + strong text (Figma node 3802:24588).
        </p>
        <DocsExample
          title="Single item × 3 states"
          preview={
            <div className="flex items-center gap-2">
              <TopItem icon={Grid} label="Dashboard" state="default" />
              <TopItem icon={Grid} label="Dashboard" state="hover" />
              <TopItem icon={Grid} label="Dashboard" state="active" />
            </div>
          }
          code={`<TopItem icon={Grid} label="Dashboard" />
<TopItem icon={Grid} label="Dashboard" state="active" />`}
        />
      </DocsSection>

      <DocsSection title="Topbar — user pill">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Right-side user trigger. Avatar + name + chevron. 3 states (default / hover / open). Figma node 3814:24667.
        </p>
        <DocsExample
          title="3 states"
          preview={
            <div className="flex items-center gap-2">
              <TopUserPill state="default" />
              <TopUserPill state="hover" />
              <TopUserPill state="open" />
            </div>
          }
          code={`<TopUserPill />
<TopUserPill state="open" />`}
        />
      </DocsSection>

      <DocsSection title="Topbar — icon button">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Square icon trigger for actions (search, command, notifications). 3 states (Figma node 3814:25156).
        </p>
        <DocsExample
          title="3 states"
          preview={
            <div className="flex items-center gap-2">
              <TopIconButton icon={Grid} state="default" />
              <TopIconButton icon={Grid} state="hover" />
              <TopIconButton icon={Grid} state="active" />
            </div>
          }
          code={`<TopIconButton icon={Bell} aria-label="Notifications" />`}
        />
      </DocsSection>

      <DocsSection title="Topbar — full assembly">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Logo + nav items + search + action buttons + user pill. 4 product variants — Dash + Apex × icon-only / icon+label (Figma node 3814:25274).
        </p>
        <DocsExample
          title="4 layouts"
          preview={
            <div className="space-y-3">
              <Topbar brand="dash" active={activeTop} onActiveChange={setActiveTop} withIcons={false} />
              <Topbar brand="dash" active={activeTop} onActiveChange={setActiveTop} withIcons />
              <Topbar brand="apex" active={activeTop} onActiveChange={setActiveTop} withIcons={false} />
              <Topbar brand="apex" active={activeTop} onActiveChange={setActiveTop} withIcons />
            </div>
          }
          code={`<Topbar brand="dash" withIcons />
<Topbar brand="apex" withIcons={false} />`}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Sidebar</strong> — primary product navigation for SaaS dashboards w/ 4+ top-level sections, deep IA, persistent context (active workspace, user, status). Sidebar collapses to rail on narrow desktops + hides under sheet on mobile.</li>
          <li>• <strong>Topbar</strong> — flat hierarchy products (settings, marketing app shell, fintech consumer dashboards). Pairs well with vertical-product brand where horizontal real estate is plenty.</li>
          <li>• <strong>Both</strong> — large products combine — sidebar for primary nav + topbar for utilities (search, notifications, account).</li>
          <li>• <strong>Mobile</strong> — sidebar swap to bottom-tab bar (max 5 items) + top app-bar for nav title + back. Don't squeeze full sidebar into mobile drawer for primary flows.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Landmark roles</strong> — wrap sidebar in <code className="text-xs">{`<nav aria-label="Primary">`}</code> + topbar in <code className="text-xs">{`<header>`}</code>.</li>
          <li>• <strong>Active state</strong> — use <code className="text-xs">aria-current=&quot;page&quot;</code> on the currently-active item.</li>
          <li>• <strong>Icon-only</strong> — every collapsed-rail item + icon-action needs <code className="text-xs">aria-label</code>.</li>
          <li>• <strong>Keyboard</strong> — items must be focusable + Enter/Space activates. Skip-link to main content above the topbar.</li>
          <li>• <strong>Collapse toggle</strong> — provide <code className="text-xs">aria-expanded</code> + label like "Collapse sidebar".</li>
        </ul>
      </DocsSection>

      <DocsSection title="API surface">
        <DocsPropsTable
          rows={[
            { name: "SideItem.icon", type: "ElementType", description: "Leading icon (16-20px)." },
            { name: "SideItem.label", type: "string", description: "Visible text. Omit + set iconOnly for collapsed rail." },
            { name: "SideItem.state", type: '"default" | "hover" | "active"', description: "Visual state. Use active for current route." },
            { name: "SideItem.badge", type: "ReactNode", description: "Trailing count or status badge." },
            { name: "SideItem.iconOnly", type: "boolean", description: "Rail mode — square 36px tile." },
            { name: "Sidebar.brand", type: '"dash" | "apex" | "solaris"', description: "Brand pack for header logo + accent color." },
            { name: "Sidebar.theme", type: '"light" | "dark"', description: "Surface treatment." },
            { name: "Sidebar.collapsed", type: "boolean", description: "Switches to rail mode (72px wide)." },
            { name: "Topbar.brand", type: '"dash" | "apex"', description: "Logo + accent color." },
            { name: "Topbar.withIcons", type: "boolean", description: "Show icons next to nav item labels." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}

/* ============================================================================ */
/*  SIDEBAR PRIMITIVES                                                          */
/* ============================================================================ */

function SideItem({
  icon: Icon,
  label,
  state = "default",
  iconOnly,
  badge,
  dark,
  onClick,
}: {
  icon: React.ElementType
  label?: string
  state?: "default" | "hover" | "active"
  iconOnly?: boolean
  badge?: React.ReactNode
  dark?: boolean
  onClick?: () => void
}) {
  const base =
    "flex items-center gap-2 rounded-lg transition-colors w-full text-left h-9 text-sm"
  const states = {
    default: dark ? "text-white/70 hover:bg-white/10" : "text-text-sub-600 hover:bg-bg-weak-50",
    hover: dark ? "bg-white/10 text-white" : "bg-bg-weak-50 text-text-strong-950",
    active: dark
      ? "bg-white/10 text-white"
      : "bg-(--primary-alpha-10) text-(--primary-base) font-medium",
  }[state]
  const railActive = state === "active" && !dark
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={state === "active" ? "page" : undefined}
      aria-label={iconOnly ? label : undefined}
      className={cn(
        base,
        states,
        iconOnly ? "size-9 justify-center px-0" : "px-2.5",
        railActive && iconOnly && "ring-1 ring-inset ring-(--primary-base)",
      )}
    >
      <Icon className={cn("size-4 shrink-0", railActive && "text-(--primary-base)")} />
      {iconOnly ? null : (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge}
        </>
      )}
    </button>
  )
}

function SidebarHeader({
  brand = "apex",
  expanded = true,
  className,
}: {
  brand?: "apex" | "dash" | "solaris"
  expanded?: boolean
  className?: string
}) {
  const accent = brand === "apex" || brand === "solaris" ? APEX_BLUE : undefined
  const logo =
    brand === "dash" ? (
      <DashLogo variant="mark" style="original" size="md" />
    ) : (
      <span
        className="inline-flex size-8 items-center justify-center rounded-md text-white"
        style={{ background: accent }}
      >
        <BrandGlyph />
      </span>
    )
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-2", className)}>
      {logo}
      {expanded ? (
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text-strong-950 truncate">
            {brand === "dash" ? "Dash" : brand === "apex" ? "Apex" : "Solaris"}
          </div>
          <div className="text-xs text-text-sub-600 truncate">Finance & Banking</div>
        </div>
      ) : null}
      {expanded ? (
        <CompactButton variant="ghost" size="sm" aria-label="Collapse"><ChevronDown className="rotate-90" /></CompactButton>
      ) : (
        <CompactButton variant="ghost" size="sm" aria-label="Expand"><SidebarUnfold /></CompactButton>
      )}
    </div>
  )
}

function UserPill({
  expanded = true,
  className,
}: {
  expanded?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1.5", className)}>
      <Avatar size="sm">
        <AvatarImage src="https://i.pravatar.cc/40?u=sophia-w" />
        <AvatarFallback>SW</AvatarFallback>
      </Avatar>
      {expanded ? (
        <>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1">
              <span className="text-sm font-medium text-text-strong-950 truncate">Sophia Williams</span>
              <Verified className="size-3.5 text-(--primary-base) shrink-0" />
            </div>
            <div className="text-xs text-text-sub-600 truncate">sophia@alignui.com</div>
          </div>
          <CompactButton variant="ghost" size="sm" aria-label="Open menu"><ChevronRight /></CompactButton>
        </>
      ) : null}
    </div>
  )
}

type NoticeType =
  | "meeting"
  | "cloud-capacity"
  | "upgrade"
  | "claim"
  | "file-sync"
  | "support"
  | "complete"

function NoticeCard({
  variant = "white",
  type,
}: {
  variant?: "white" | "gray" | "purple" | "black"
  type: NoticeType
}) {
  const dark = variant === "purple" || variant === "black"
  const surface = {
    white: "bg-bg-white-0 border border-stroke-soft-200",
    gray: "bg-bg-weak-50",
    purple: "bg-(--primary-base) text-white",
    black: "bg-bg-strong-950 text-white",
  }[variant]
  const linkCls = dark ? "text-white underline" : "text-(--primary-base) underline"
  const subCls = dark ? "text-white/80" : "text-text-sub-600"

  if (type === "meeting") {
    return (
      <div className={cn("rounded-xl p-3 space-y-2", surface)}>
        <div className="flex items-start justify-between">
          <div className="flex -space-x-2">
            <Avatar size="xs"><AvatarImage src="https://i.pravatar.cc/40?u=1" /></Avatar>
            <Avatar size="xs"><AvatarImage src="https://i.pravatar.cc/40?u=2" /></Avatar>
            <Avatar size="xs"><AvatarImage src="https://i.pravatar.cc/40?u=3" /></Avatar>
            <span className={cn("inline-flex size-5 items-center justify-center rounded-full text-[10px] font-medium border-2 border-bg-white-0", dark ? "bg-white/20 text-white" : "bg-bg-weak-50 text-text-sub-600")}>+4</span>
          </div>
          <CompactButton variant="ghost" size="sm" aria-label="Dismiss" className={cn(dark && "text-white/70 hover:bg-white/10")}><X /></CompactButton>
        </div>
        <div>
          <div className={cn("text-sm font-medium", !dark && "text-text-strong-950")}>Daily Meeting</div>
          <div className={cn("text-xs", subCls)}>9:00 AM - 9:30 AM on Zoom</div>
        </div>
        <a className={cn("inline-flex items-center gap-1 text-xs font-medium", linkCls)}>Join Now <ChevronRight className="size-3" /></a>
      </div>
    )
  }

  if (type === "cloud-capacity") {
    return (
      <div className={cn("rounded-xl p-3 space-y-2", surface)}>
        <div className={cn("text-sm font-medium", !dark && "text-text-strong-950")}>Cloud Capacity</div>
        <div className={cn("text-xs", subCls)}>You're almost out of space.</div>
        <div className={cn("h-1 rounded-full", dark ? "bg-white/20" : "bg-bg-soft-200")}>
          <div className={cn("h-full rounded-full w-2/3", dark ? "bg-white" : "bg-information-base")} />
        </div>
        <a className={cn("inline-block text-xs font-medium", linkCls)}>Upgrade Cloud</a>
      </div>
    )
  }

  if (type === "upgrade") {
    return (
      <div className={cn("rounded-xl p-3 space-y-2 text-center", surface)}>
        <span className={cn("inline-flex size-8 items-center justify-center rounded-full mx-auto", dark ? "bg-white/15" : "bg-bg-weak-50")}>
          <Cloud className={cn("size-4", dark ? "text-white" : "text-icon-sub-600")} />
        </span>
        <div className={cn("text-xs", subCls)}>We have enhanced cloud plans for your needs.</div>
        <a className={cn("inline-block text-xs font-medium", linkCls)}>View Plans</a>
      </div>
    )
  }

  if (type === "claim") {
    return (
      <div className={cn("rounded-xl p-2.5 flex items-center gap-2", surface)}>
        <span className={cn("inline-flex size-7 items-center justify-center rounded-md shrink-0", dark ? "bg-white/15" : "bg-bg-weak-50")}>
          <Gift className={cn("size-4", dark ? "text-white" : "text-icon-sub-600")} />
        </span>
        <div className="flex-1 min-w-0">
          <div className={cn("text-xs font-medium", !dark && "text-text-strong-950")}>Claim your gift!</div>
          <div className={cn("text-[11px]", subCls)}>Find it on Benefits page.</div>
        </div>
      </div>
    )
  }

  if (type === "file-sync") {
    return (
      <div className={cn("rounded-xl p-3 space-y-2", surface)}>
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-medium", !dark && "text-text-strong-950")}>Cloud Storage</span>
          <span className={cn("text-xs tabular-nums", subCls)}>80%</span>
        </div>
        <div className={cn("h-1 rounded-full", dark ? "bg-white/20" : "bg-bg-soft-200")}>
          <div className={cn("h-full rounded-full w-4/5", dark ? "bg-white" : "bg-(--primary-base)")} />
        </div>
        <div className={cn("text-xs", subCls)}>1.6 GB of 2 GB used</div>
        <div className={cn("flex items-center justify-between rounded-lg p-2", dark ? "bg-white/10" : "bg-bg-weak-50")}>
          <span className={cn("text-xs", !dark && "text-text-strong-950")}>File Syncing <span className={subCls}>(Paused)</span></span>
          <CompactButton variant="ghost" size="sm" aria-label="Resume" className={cn(dark && "text-white")}><ChevronRight /></CompactButton>
        </div>
      </div>
    )
  }

  if (type === "support") {
    return (
      <div className={cn("rounded-xl p-3 space-y-2", surface)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphone className={cn("size-4", dark ? "text-white" : "text-icon-sub-600")} />
            <span className={cn("text-sm font-medium", !dark && "text-text-strong-950")}>Need Support</span>
          </div>
          <CompactButton variant="ghost" size="sm" aria-label="Dismiss" className={cn(dark && "text-white/70 hover:bg-white/10")}><X /></CompactButton>
        </div>
        <div className={cn("text-xs", subCls)}>Contact with one of our experts to get support.</div>
      </div>
    )
  }

  // complete
  return (
    <div className={cn("rounded-xl p-3 space-y-2", surface)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", !dark && "text-text-strong-950")}>Cloud Capacity</span>
        <span className={cn("text-xs tabular-nums", subCls)}>0/4</span>
      </div>
      <div className={cn("text-xs", subCls)}>You're almost out of space.</div>
      <div className={cn("h-1 rounded-full", dark ? "bg-white/20" : "bg-bg-soft-200")}>
        <div className={cn("h-full rounded-full w-1/3", dark ? "bg-white" : "bg-(--primary-base)")} />
      </div>
      <a className={cn("inline-flex items-center gap-1 text-xs font-medium", linkCls)}>Complete Now <ChevronRight className="size-3" /></a>
    </div>
  )
}

function Sidebar({
  brand = "apex",
  theme = "light",
  collapsed = false,
  active = "dashboard",
  onActiveChange,
  onToggleCollapse,
}: {
  brand?: "apex" | "dash" | "solaris"
  theme?: "light" | "dark"
  collapsed?: boolean
  active?: string
  onActiveChange?: (k: string) => void
  onToggleCollapse?: () => void
}) {
  const dark = theme === "dark"
  const items =
    brand === "apex"
      ? [
          { key: "dashboard", icon: Grid, label: "Dashboard" },
          { key: "card", icon: CardIcon, label: "My Card" },
          { key: "transfer", icon: Transfer, label: "Transfer" },
          { key: "transactions", icon: History, label: "Transactions" },
          { key: "payments", icon: CardIcon, label: "Payments" },
          { key: "exchange", icon: Exchange, label: "Exchange" },
        ]
      : [
          { key: "dashboard", icon: Grid, label: "Dashboard" },
          { key: "calendar", icon: CalendarI, label: "Calendar" },
          { key: "timeoff", icon: Timer, label: "Time Off" },
          { key: "projects", icon: Briefcase, label: "Projects" },
          { key: "teams", icon: Team, label: "Teams" },
          { key: "settings", icon: SettingsI, label: "Settings" },
        ]

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border shadow-sm h-[560px]",
        dark ? "bg-bg-strong-950 border-bg-strong-950 text-white" : "bg-bg-white-0 border-stroke-soft-200",
        collapsed ? "w-[72px] p-2" : "w-[240px] p-3",
      )}
    >
      <SidebarHeader brand={brand} expanded={!collapsed} />
      <div className="flex flex-col gap-0.5 mt-2">
        {items.map((it) => (
          <SideItem
            key={it.key}
            icon={it.icon}
            label={it.label}
            iconOnly={collapsed}
            state={active === it.key ? "active" : "default"}
            dark={dark}
            onClick={() => onActiveChange?.(it.key)}
          />
        ))}
      </div>
      <div className="flex-1" />
      {!collapsed ? <NoticeCard variant={dark ? "black" : "white"} type="meeting" /> : null}
      <UserPill expanded={!collapsed} />
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className={cn(
          "inline-flex items-center justify-center h-8 rounded-lg text-xs",
          dark ? "bg-white/10 text-white hover:bg-white/15" : "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200",
        )}
      >
        {collapsed ? <SidebarUnfold className="size-4" /> : (<><SidebarFold className="size-4" /> Collapse</>)}
      </button>
    </nav>
  )
}

/* ============================================================================ */
/*  TOPBAR PRIMITIVES                                                           */
/* ============================================================================ */

function TopItem({
  icon: Icon,
  label,
  state = "default",
  withIcon = true,
  onClick,
}: {
  icon?: React.ElementType
  label: string
  state?: "default" | "hover" | "active"
  withIcon?: boolean
  onClick?: () => void
}) {
  const states = {
    default: "text-text-sub-600 hover:bg-bg-weak-50",
    hover: "bg-bg-weak-50 text-text-strong-950",
    active: "bg-bg-weak-50 text-text-strong-950 font-medium",
  }[state]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={state === "active" ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md h-9 px-3 text-sm transition-colors",
        states,
      )}
    >
      {withIcon && Icon ? <Icon className={cn("size-4", state === "active" && "text-(--primary-base)")} /> : null}
      {label}
    </button>
  )
}

function TopUserPill({
  state = "default",
}: {
  state?: "default" | "hover" | "open"
}) {
  const states = {
    default: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50",
    hover: "border-stroke-soft-200 bg-bg-weak-50",
    open: "border-stroke-soft-200 bg-bg-weak-50",
  }[state]
  return (
    <button
      type="button"
      aria-expanded={state === "open"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border h-9 pl-1 pr-2.5 text-sm transition-colors",
        states,
      )}
    >
      <Avatar size="xs"><AvatarImage src="https://i.pravatar.cc/40?u=sophia" /><AvatarFallback>S</AvatarFallback></Avatar>
      <span className="text-text-strong-950">Sophia</span>
      <ChevronDown className={cn("size-3.5 text-text-soft-400 transition-transform", state === "open" && "rotate-180")} />
    </button>
  )
}

function TopIconButton({
  icon: Icon,
  state = "default",
  ariaLabel = "Action",
}: {
  icon: React.ElementType
  state?: "default" | "hover" | "active"
  ariaLabel?: string
}) {
  const states = {
    default: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50 text-text-sub-600",
    hover: "border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950",
    active: "border-(--primary-base) text-(--primary-base) bg-(--primary-alpha-10)",
  }[state]
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn("inline-flex size-9 items-center justify-center rounded-md border transition-colors", states)}
    >
      <Icon className="size-4" />
    </button>
  )
}

function Topbar({
  brand = "dash",
  active = "dashboard",
  onActiveChange,
  withIcons = false,
}: {
  brand?: "dash" | "apex"
  active?: string
  onActiveChange?: (k: string) => void
  withIcons?: boolean
}) {
  const items =
    brand === "apex"
      ? [
          { key: "dashboard", icon: Grid, label: "Dashboard" },
          { key: "card", icon: CardIcon, label: "My Card" },
          { key: "transfer", icon: Transfer, label: "Transfer" },
          { key: "transactions", icon: History, label: "Transactions" },
          { key: "payments", icon: CardIcon, label: "Payments" },
          { key: "exchange", icon: Exchange, label: "Exchange" },
        ]
      : [
          { key: "dashboard", icon: Grid, label: "Dashboard" },
          { key: "calendar", icon: CalendarI, label: "Calendar" },
          { key: "timeoff", icon: Timer, label: "Time Off" },
          { key: "projects", icon: Briefcase, label: "Projects" },
          { key: "teams", icon: Team, label: "Teams" },
          { key: "settings", icon: SettingsI, label: "Settings" },
        ]

  const accent = brand === "apex" ? APEX_BLUE : undefined
  const logo =
    brand === "dash" ? (
      <DashLogo variant="mark" style="original" size="md" />
    ) : (
      <span
        className="inline-flex size-8 items-center justify-center rounded-md text-white"
        style={{ background: accent }}
      >
        <BrandGlyph />
      </span>
    )

  const userName = brand === "apex" ? "Arthur" : "Sophia"
  const userId = brand === "apex" ? "arthur" : "sophia-top"

  return (
    <header className="flex items-center gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm px-3 py-2">
      {logo}
      <div className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto">
        {items.map((it) => (
          <TopItem
            key={it.key}
            icon={it.icon}
            label={it.label}
            withIcon={withIcons}
            state={active === it.key ? "active" : "default"}
            onClick={() => onActiveChange?.(it.key)}
          />
        ))}
        <TopItem icon={Apps} label="Others" state="default" withIcon={withIcons} />
      </div>
      <div className="hidden md:block w-48">
        {withIcons ? null : (
          <InputRoot size="md">
            <InputIcon><Search className="size-4" /></InputIcon>
            <Input placeholder="Search…" />
            <Kbd>⌘1</Kbd>
          </InputRoot>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {withIcons ? <TopIconButton icon={Search} ariaLabel="Search" /> : null}
        <TopIconButton icon={Flash} ariaLabel="Quick actions" />
        <TopIconButton icon={Bell} ariaLabel="Notifications" />
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 hover:bg-bg-weak-50 h-9 pl-1 pr-2.5 text-sm"
        >
          <Avatar size="xs"><AvatarImage src={`https://i.pravatar.cc/40?u=${userId}`} /><AvatarFallback>{userName[0]}</AvatarFallback></Avatar>
          <span className="text-text-strong-950">{userName}</span>
          <ChevronDown className="size-3.5 text-text-soft-400" />
        </button>
      </div>
    </header>
  )
}

function BrandGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M6 4h12v6l-6 4-6-4V4Z" opacity="0.5" />
      <path d="M6 14l6 4 6-4v6H6v-6Z" />
    </svg>
  )
}
