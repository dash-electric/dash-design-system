"use client"

import * as React from "react"
import {
  RiSearchLine as Search,
  RiNotification3Line as Bell,
  RiCalendarLine as CalendarI,
  RiAddLine as Plus,
  RiUploadLine as Upload,
  RiUser3Line as UserI,
  RiFilter3Line as Filter,
  RiDownloadLine as Download,
  RiShareLine as Share,
  RiPencilLine as Pencil,
  RiDeleteBinLine as Trash,
  RiArrowLeftLine as ArrowLeft,
} from "@remixicon/react"
import { DashLogo } from "@/registry/dash/ui/dash-logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Badge } from "@/registry/dash/ui/badge"
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
 * Product Header — Figma 1:1 (2 nodes verified 2026-05-18).
 *
 *   3829:27898   Page header — title + description + 5 leading variants × action bar (search/bell/Schedule/Create Request)
 *   3880:63403   Page header — same shell × action bar variant (search/Export/Invite Member)
 *
 * Common pattern: leading (none/avatar/icon-placeholder/brand-logo) + title +
 * description + spacer + action row (utility icons + secondary CTA + primary CTA).
 */

const APEX_BLUE = "#3F6FFF"

type Leading = "none" | "avatar" | "placeholder" | "solaris" | "apex"

export default function ProductHeaderDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Header"
        title="Header"
        description="Page-level header strip sitting above product content. Title + description + leading element (avatar / brand glyph) + action row (utility icons + secondary + primary CTA). Use as the topmost row of any dashboard, list, settings, or detail page below the global topbar."
      />

      <DocsSection title="Anatomy">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Same shell, swappable parts. Slot order from left to right: leading element → title + description → spacer → utility icons → secondary CTA → primary CTA.
        </p>
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
          <PageHeader
            leading="apex"
            title="Insert page title here"
            description="Insert page description here."
            utilityIcons={[
              { icon: Search, label: "Search" },
              { icon: Bell, label: "Notifications", dot: true },
            ]}
            secondary={{ label: "Schedule", icon: CalendarI }}
            primary={{ label: "Create Request", icon: Plus }}
          />
        </div>
      </DocsSection>

      <DocsSection title="Leading element variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          5 leading options — <strong>none</strong>, <strong>avatar</strong> (user photo), <strong>placeholder</strong> (generic user icon for empty/uncreated profile), <strong>brand</strong> (Solaris / Apex / Dash glyph). Pick based on page subject: settings = avatar, project = brand, dashboard = none.
        </p>
        <DocsExample
          title="5 leading variants × Schedule/Create Request CTA"
          preview={
            <div className="space-y-3">
              {(["none", "avatar", "placeholder", "solaris", "apex"] as Leading[]).map((L) => (
                <PageHeader
                  key={L}
                  leading={L}
                  title="Insert page title here"
                  description="Insert page description here."
                  utilityIcons={[
                    { icon: Search, label: "Search" },
                    { icon: Bell, label: "Notifications", dot: true },
                  ]}
                  secondary={{ label: "Schedule", icon: CalendarI }}
                  primary={{ label: "Create Request", icon: Plus }}
                />
              ))}
            </div>
          }
          code={`<PageHeader
  leading="apex"
  title="Insert page title here"
  description="Insert page description here."
  utilityIcons={[{ icon: Search }, { icon: Bell, dot: true }]}
  secondary={{ label: "Schedule", icon: Calendar }}
  primary={{ label: "Create Request", icon: Plus }}
/>`}
        />
      </DocsSection>

      <DocsSection title="Action row variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Swap action row by page intent. Search + Export + Invite Member = collaboration page. Search + Bell + Schedule + Create = inbox / request flow. Single primary CTA = focused empty/onboarding state.
        </p>
        <DocsExample
          title="Export + Invite Member"
          preview={
            <div className="space-y-3">
              {(["none", "avatar", "placeholder", "solaris", "apex"] as Leading[]).map((L) => (
                <PageHeader
                  key={L}
                  leading={L}
                  title="Insert page title here"
                  description="Insert page description here."
                  utilityIcons={[{ icon: Search, label: "Search" }]}
                  secondary={{ label: "Export", icon: Upload }}
                  primary={{ label: "Invite Member", icon: Plus }}
                />
              ))}
            </div>
          }
          code={`<PageHeader
  title="Members"
  description="Manage team access."
  utilityIcons={[{ icon: Search }]}
  secondary={{ label: "Export", icon: Upload }}
  primary={{ label: "Invite Member", icon: Plus }}
/>`}
        />
        <DocsExample
          title="Filter + Download + primary"
          preview={
            <PageHeader
              title="Transactions"
              description="9,041 records · last 30 days."
              utilityIcons={[
                { icon: Search, label: "Search" },
                { icon: Filter, label: "Filter" },
              ]}
              secondary={{ label: "Download", icon: Download }}
              primary={{ label: "New Transfer", icon: Plus }}
            />
          }
          code={`<PageHeader
  title="Transactions"
  description="9,041 records · last 30 days."
  utilityIcons={[{ icon: Search }, { icon: Filter }]}
  secondary={{ label: "Download", icon: Download }}
  primary={{ label: "New Transfer", icon: Plus }}
/>`}
        />
        <DocsExample
          title="Single primary CTA (focused empty/onboarding)"
          preview={
            <PageHeader
              leading="avatar"
              title="Welcome back, Sophia"
              description="Continue setting up your workspace."
              primary={{ label: "Get started", icon: Plus }}
            />
          }
          code={`<PageHeader
  leading="avatar"
  title="Welcome back, Sophia"
  description="Continue setting up your workspace."
  primary={{ label: "Get started", icon: Plus }}
/>`}
        />
      </DocsSection>

      <DocsSection title="With back navigation">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Detail pages — prepend a back arrow + breadcrumb. Leading slot becomes optional.
        </p>
        <DocsExample
          title="Detail header with back + breadcrumb"
          preview={
            <PageHeader
              backHref="#"
              breadcrumb={[
                { label: "Members", href: "#" },
                { label: "Sophia Williams" },
              ]}
              leading="avatar"
              title="Sophia Williams"
              description="Editor · sophia@alignui.com"
              utilityIcons={[
                { icon: Share, label: "Share" },
                { icon: Pencil, label: "Edit" },
              ]}
              secondary={{ label: "Suspend", icon: Trash, danger: true }}
              primary={{ label: "Save changes", icon: Plus }}
            />
          }
          code={`<PageHeader
  backHref="/members"
  breadcrumb={[
    { label: "Members", href: "/members" },
    { label: "Sophia Williams" },
  ]}
  leading="avatar"
  title="Sophia Williams"
  description="Editor · sophia@alignui.com"
  primary={{ label: "Save changes" }}
/>`}
        />
      </DocsSection>

      <DocsSection title="With metadata pill row">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Add a metadata row below the description — status badge + counts + small chips. Common in record-detail pages.
        </p>
        <DocsExample
          title="Header w/ status + meta chips"
          preview={
            <PageHeader
              leading="apex"
              title="Apex Bank"
              description="Q3 2026 settlement window."
              meta={
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm" appearance="lighter" status="success">Active</Badge>
                  <span className="text-xs text-text-sub-600">12 accounts</span>
                  <span className="text-text-soft-400">•</span>
                  <span className="text-xs text-text-sub-600">last sync 2m ago</span>
                </div>
              }
              utilityIcons={[{ icon: Search, label: "Search" }]}
              primary={{ label: "Open settings" }}
            />
          }
          code={`<PageHeader
  title="Apex Bank"
  description="Q3 2026 settlement window."
  meta={
    <div className="flex items-center gap-2">
      <Badge status="success">Active</Badge>
      <span>12 accounts</span>
    </div>
  }
/>`}
        />
      </DocsSection>

      <DocsSection title="Sticky behavior">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Wrap in <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sticky top-0 z-10</code> with a backdrop on scroll. Reserve space so content below doesn't jump.
        </p>
        <DocsCode
          language="tsx"
          code={`<div className="sticky top-0 z-10 bg-bg-white-0/95 backdrop-blur border-b border-stroke-soft-200">
  <PageHeader {...props} />
</div>`}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Dashboard / list / detail page</strong> — yes. Always wrap content in this header.</li>
          <li>• <strong>Modal / sheet / popover</strong> — no. Use their own header conventions (ModalHeader / SheetHeader).</li>
          <li>• <strong>Marketing / landing</strong> — no. Use Hero block instead.</li>
          <li>• <strong>Step-based flow</strong> — no. Use Step Indicator + a thinner FlowHeader pattern.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Heading semantics</strong> — title renders as <code className="text-xs">{`<h1>`}</code>. One per page.</li>
          <li>• <strong>Icon buttons</strong> — every utility icon needs <code className="text-xs">aria-label</code>.</li>
          <li>• <strong>Notification dot</strong> — pair with text count for screen readers ("3 unread notifications").</li>
          <li>• <strong>Skip link</strong> — provide a top-of-page skip-to-main-content link landing after this header.</li>
          <li>• <strong>Back navigation</strong> — render as real anchor <code className="text-xs">{`<a href>`}</code>; don't bind to history.back() alone.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "title", type: "string", description: "Page heading. Renders as h1." },
            { name: "description", type: "string", description: "Supporting subhead. One line." },
            { name: "leading", type: '"none" | "avatar" | "placeholder" | "solaris" | "apex" | "dash"', defaultValue: '"none"', description: "Leading visual element. Match to page subject." },
            { name: "utilityIcons", type: "{ icon: ElementType; label: string; dot?: boolean }[]", description: "Right-aligned icon button row (search / bell / filter)." },
            { name: "secondary", type: "{ label: string; icon?: ElementType; danger?: boolean }", description: "Secondary CTA — stroke style." },
            { name: "primary", type: "{ label: string; icon?: ElementType }", description: "Primary CTA — filled primary." },
            { name: "backHref", type: "string", description: "Render leading back-arrow button linking here." },
            { name: "breadcrumb", type: "{ label: string; href?: string }[]", description: "Ancestor trail above title." },
            { name: "meta", type: "ReactNode", description: "Custom row below description (badges, counts, chips)." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}

/* ============================================================================ */

type PageHeaderProps = {
  title: string
  description?: string
  leading?: Leading | "dash"
  utilityIcons?: { icon: React.ElementType; label: string; dot?: boolean }[]
  secondary?: { label: string; icon?: React.ElementType; danger?: boolean }
  primary?: { label: string; icon?: React.ElementType }
  backHref?: string
  breadcrumb?: { label: string; href?: string }[]
  meta?: React.ReactNode
}

function PageHeader({
  title,
  description,
  leading = "none",
  utilityIcons,
  secondary,
  primary,
  backHref,
  breadcrumb,
  meta,
}: PageHeaderProps) {
  return (
    <header className="flex items-center gap-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3">
      {backHref ? (
        <a
          href={backHref}
          aria-label="Back"
          className="inline-flex size-9 items-center justify-center rounded-md border border-stroke-soft-200 hover:bg-bg-weak-50 shrink-0"
        >
          <ArrowLeft className="size-4 text-icon-sub-600" />
        </a>
      ) : null}
      <LeadingGlyph leading={leading} />
      <div className="flex-1 min-w-0">
        {breadcrumb?.length ? (
          <nav aria-label="Breadcrumb" className="text-xs text-text-soft-400 mb-0.5">
            {breadcrumb.map((b, i) => (
              <span key={`${b.label}-${i}`}>
                {b.href ? (
                  <a href={b.href} className="hover:text-text-sub-600 hover:underline">{b.label}</a>
                ) : (
                  <span className="text-text-sub-600">{b.label}</span>
                )}
                {i < breadcrumb.length - 1 ? <span className="px-1.5">/</span> : null}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-base font-semibold text-text-strong-950 truncate">{title}</h1>
        {description ? (
          <p className="text-xs text-text-sub-600 truncate">{description}</p>
        ) : null}
        {meta ? <div className="mt-1.5">{meta}</div> : null}
      </div>
      {utilityIcons?.length ? (
        <div className="flex items-center gap-1 shrink-0">
          {utilityIcons.map((u, i) => (
            <button
              key={`${u.label}-${i}`}
              type="button"
              aria-label={u.label}
              className="relative inline-flex size-9 items-center justify-center rounded-md hover:bg-bg-weak-50 text-icon-sub-600"
            >
              <u.icon className="size-4" />
              {u.dot ? (
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-error-base" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
      {secondary ? (
        <Button style="stroke" tone={secondary.danger ? "destructive" : "neutral"} className="shrink-0">
          {secondary.icon ? <secondary.icon className="size-4" /> : null}
          {secondary.label}
        </Button>
      ) : null}
      {primary ? (
        <Button className="shrink-0">
          {primary.icon ? <primary.icon className="size-4" /> : null}
          {primary.label}
        </Button>
      ) : null}
    </header>
  )
}

function LeadingGlyph({ leading }: { leading: Leading | "dash" }) {
  if (leading === "none") return null
  if (leading === "avatar")
    return (
      <Avatar size="md" className="shrink-0">
        <AvatarImage src="https://i.pravatar.cc/40?u=sophia-w" />
        <AvatarFallback>SW</AvatarFallback>
      </Avatar>
    )
  if (leading === "placeholder")
    return (
      <span className="inline-flex size-10 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 text-icon-soft-400 shrink-0">
        <UserI className="size-5" />
      </span>
    )
  if (leading === "solaris")
    return (
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-(--primary-base) text-white shrink-0">
        <SolarisGlyph />
      </span>
    )
  if (leading === "apex")
    return (
      <span
        className="inline-flex size-10 items-center justify-center rounded-full text-white shrink-0"
        style={{ background: APEX_BLUE }}
      >
        <ApexGlyph />
      </span>
    )
  if (leading === "dash")
    return (
      <span className="shrink-0">
        <DashLogo variant="mark" style="original" size="md" />
      </span>
    )
  return null
}

function SolarisGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <g>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x="11.5"
            y="1"
            width="1"
            height="4"
            rx="0.5"
            transform={`rotate(${i * 30} 12 12)`}
          />
        ))}
      </g>
    </svg>
  )
}

function ApexGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d="M6 4h12v6l-6 4-6-4V4Z" opacity="0.5" />
      <path d="M6 14l6 4 6-4v6H6v-6Z" />
    </svg>
  )
}
