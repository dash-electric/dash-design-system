"use client"

import * as React from "react"
import { RiCheckLine as Check, RiCloseLine as X } from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { DocsPageNav } from "@/components/docs/page-nav"
import { DocsCopyPage } from "@/components/docs/copy-page"
import { DocsPreview } from "@/components/docs/preview"
import { DocsCode } from "@/components/docs/code-block"
import { DocsBreadcrumb } from "@/components/docs/breadcrumb"

type PageShellProps = React.HTMLAttributes<HTMLDivElement>

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")

/**
 * DocsPageShell — outer wrapper, centered article + auto prev/next.
 * The right-rail "On this page" TOC lives in app/(docs)/layout.tsx,
 * not here — keep this component focused on the article column only.
 */
export const DocsPageShell = ({ className, children, ...props }: PageShellProps) => (
  <article
    className={cn(
      "mx-auto max-w-[1080px] px-6 lg:px-10 py-14 lg:py-16 space-y-14",
      className,
    )}
    {...props}
  >
    {children}
    <DocsPageNav />
  </article>
)

type HeaderProps = {
  category: string
  title: React.ReactNode
  description: React.ReactNode
  /**
   * Canonical schema (Wave 3, P3.14): `stable | beta | wip | deprecated`.
   * Legacy values (`shipped | planned | new`) are retained for backward
   * compatibility with non-component doc pages (patterns, tools, product
   * widgets) that still ship the older taxonomy; component pages should
   * use the canonical values only.
   */
  status?: "stable" | "beta" | "wip" | "deprecated" | "shipped" | "planned" | "new"
  /**
   * Component classification per the schema doc — informs sidebar grouping
   * and the future manifest. Optional today, will be required after the
   * Wave-5 manifest migration. Distinct from `category` (the human-readable
   * eyebrow group label).
   */
  kind?: "atom" | "composite" | "specialized"
  /** Sub-tabs row under hero — Usage / Spec / Status. */
  tabs?: Array<{ label: string; href?: string; active?: boolean }>
  /**
   * Render the colored status pill next to the title. Default `false` —
   * status is still tracked in metadata, just not visualised by default
   * (cuts header chrome noise). Opt-in per page when status is load-bearing
   * (e.g. WIP/Deprecated callouts).
   */
  showStatus?: boolean
}

const STATUS_META: Record<
  NonNullable<HeaderProps["status"]>,
  { label: string; cls: string }
> = {
  stable: {
    label: "Stable",
    cls: "bg-success-lighter text-success-dark border-success-light",
  },
  shipped: {
    label: "Stable",
    cls: "bg-success-lighter text-success-dark border-success-light",
  },
  wip: {
    label: "Work in progress",
    cls: "bg-warning-lighter text-warning-dark border-warning-light",
  },
  planned: {
    label: "Planned",
    cls: "bg-bg-weak-50 text-text-sub-600 border-stroke-soft-200",
  },
  beta: {
    label: "Design beta",
    cls: "bg-information-lighter text-information-dark border-information-light",
  },
  new: {
    label: "New",
    cls: "bg-(--dash-purple-50) text-(--dash-purple-700) border-(--dash-purple-200)",
  },
  deprecated: {
    label: "Deprecated",
    cls: "bg-error-lighter text-error-dark border-error-light",
  },
}

export const DocsHeader = ({ category, title, description, status, kind, tabs, showStatus = false }: HeaderProps) => {
  void kind // kind is reserved for the future manifest; no visual treatment yet.
  void status // status is tracked in metadata even when not rendered.
  const statusMeta = showStatus && status ? STATUS_META[status] : null
  return (
    <header className="space-y-6">
      {/* Auto breadcrumb derived from pathname */}
      <DocsBreadcrumb />

      {/* Eyebrow row — category mono + copy-page action far right */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-semibold tracking-tight text-text-strong-950">
          {category}
        </div>
        <DocsCopyPage />
      </div>

      {/* Massive title + colored status pill */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight leading-tight text-text-strong-950">
          {title}
        </h1>
        {statusMeta ? (
          <span
            className={cn(
              "text-xs font-medium rounded px-2.5 py-1 border tracking-tight",
              statusMeta.cls,
            )}
          >
            {statusMeta.label}
          </span>
        ) : null}
      </div>

      {/* Description */}
      <p className="text-lg lg:text-xl text-text-sub-600 leading-relaxed max-w-2xl">
        {description}
      </p>

      {/* Sub-tab row — Usage / Spec / Status */}
      {tabs && tabs.length > 0 ? (
        <nav
          aria-label="Section tabs"
          className="flex items-center gap-8 border-b border-stroke-soft-200 pt-2"
        >
          {tabs.map((tab) => (
            <a
              key={tab.label}
              href={tab.href ?? `#${slugify(tab.label)}`}
              className={cn(
                "relative -mb-px py-3 text-sm tracking-tight transition-colors",
                tab.active
                  ? "text-text-strong-950 font-semibold border-b-2 border-text-strong-950"
                  : "text-text-sub-600 hover:text-text-strong-950 border-b-2 border-transparent",
              )}
            >
              {tab.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  )
}

type SectionProps = Omit<React.HTMLAttributes<HTMLElement>, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** Optional explicit anchor id (else derived from title text). */
  id?: string
  /**
   * Render a thin top-border separator above the section.
   * Default `false` — rely on spacing alone for visual rhythm (cleaner,
   * matches shadcn restraint). Opt in only when an explicit divider is needed.
   */
  withDivider?: boolean
}

/** DocsSection — large h2, optional top-border separator (opt-in via `withDivider`). */
export const DocsSection = ({ className, title, description, children, id, withDivider = false, ...props }: SectionProps) => {
  const slug =
    id ??
    (typeof title === "string" ? slugify(title) : undefined)
  return (
    <section
      className={cn(
        "space-y-6",
        withDivider && "pt-6 border-t border-stroke-soft-200/60 first:border-t-0 first:pt-0",
        className,
      )}
      {...props}
    >
      <div className="space-y-3">
        <h2
          id={slug}
          className="text-2xl lg:text-3xl font-semibold tracking-tight scroll-mt-20 text-text-strong-950"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">{description}</p>
        ) : null}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

type PropsTableProps = {
  rows: Array<{
    name: string
    type: string
    defaultValue?: string
    description: React.ReactNode
  }>
}

export const DocsPropsTable = ({ rows }: PropsTableProps) => (
  <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
    <table className="w-full text-sm">
      <thead className="bg-bg-weak-50">
        <tr className="text-left">
          <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
            Prop
          </th>
          <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
            Type
          </th>
          <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
            Default
          </th>
          <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
            Description
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stroke-soft-200">
        {rows.map((r) => (
          <tr key={r.name} className="align-top">
            <td className="px-3 py-2.5 text-xs text-text-strong-950 whitespace-nowrap">
              {r.name}
            </td>
            <td className="px-3 py-2.5 text-xs text-(--dash-purple-600) dark:text-(--dash-purple-300)">
              {r.type}
            </td>
            <td className="px-3 py-2.5 text-xs text-text-soft-400">
              {r.defaultValue ?? "—"}
            </td>
            <td className="px-3 py-2.5 text-sm text-text-sub-600 leading-relaxed">
              {r.description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

type ExampleProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  preview: React.ReactNode
  code: string
  /**
   * Drop the inner padding + overflow-hidden of the preview frame. Used for
   * full-width template previews (paired with `DocsTemplatePreview`) so the
   * 1440px design can horizontally scroll instead of being clipped.
   */
  bare?: boolean
}

/**
 * DocsExample — title + description above a unified preview/code container.
 * Preview frame (DocsPreview) + DocsCode share the same outer rounded border
 * so they read as a single "spec sheet" unit, not two stacked boxes.
 */
export const DocsExample = ({ className, title, description, preview, code, bare, ...props }: ExampleProps) => (
  <div className={cn("space-y-3", className)} {...props}>
    <div className="space-y-1">
      <h3 className="text-base font-semibold tracking-tight text-text-strong-950">
        {title}
      </h3>
      {description ? (
        <p className="text-sm text-text-sub-600 leading-relaxed max-w-2xl">
          {description}
        </p>
      ) : null}
    </div>
    <div className={cn("rounded-xl", !bare && "overflow-hidden")}>
      <DocsPreview bare={bare} label={typeof title === "string" ? title : undefined}>
        {preview}
      </DocsPreview>
      <DocsCode
        code={code}
        language="tsx"
        className="rounded-none rounded-b-xl border-x border-b border-stroke-soft-200"
      />
    </div>
  </div>
)

/**
 * DocsDoDont — paired "Do / Don't" guidance block.
 * Two columns: GREEN ✓ Do (left), RED ✕ Don't (right). Each with optional preview + caption.
 */
type DoDontProps = {
  do: { caption: React.ReactNode; preview?: React.ReactNode }
  dont: { caption: React.ReactNode; preview?: React.ReactNode }
  className?: string
}

export const DocsDoDont = ({ do: doItem, dont, className }: DoDontProps) => (
  <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
    {/* Do */}
    <div className="space-y-3">
      {doItem.preview ? (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 min-h-40 flex items-center justify-center">
          {doItem.preview}
        </div>
      ) : null}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full bg-success-lighter text-success-dark px-2.5 py-1">
          <Check className="size-3.5" strokeWidth={2.5} />
          Do
        </span>
        <p className="text-sm text-text-sub-600 leading-relaxed">{doItem.caption}</p>
      </div>
    </div>
    {/* Don't */}
    <div className="space-y-3">
      {dont.preview ? (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 min-h-40 flex items-center justify-center">
          {dont.preview}
        </div>
      ) : null}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full bg-error-lighter text-error-dark px-2.5 py-1">
          <X className="size-3.5" strokeWidth={2.5} />
          Don&apos;t
        </span>
        <p className="text-sm text-text-sub-600 leading-relaxed">{dont.caption}</p>
      </div>
    </div>
  </div>
)

/**
 * DocsPrinciples — 3-col principle block (bold title + body each).
 * Each principle: bold heading + body description.
 */
type PrinciplesProps = {
  items: Array<{ title: React.ReactNode; body: React.ReactNode }>
  className?: string
}

export const DocsPrinciples = ({ items, className }: PrinciplesProps) => (
  <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6", className)}>
    {items.map((item, i) => (
      <div key={i} className="space-y-2">
        <h3 className="text-base font-semibold tracking-tight text-text-strong-950">
          {item.title}
        </h3>
        <p className="text-sm text-text-sub-600 leading-relaxed">{item.body}</p>
      </div>
    ))}
  </div>
)

/**
 * DocsVariantTable — 2-col variant table (name | use-for).
 * Left: variant name (bold). Right: "Use for" description.
 */
type VariantTableProps = {
  /** Header for left column (default: "Variant"). */
  nameHeader?: string
  /** Header for right column (default: "Use for"). */
  descHeader?: string
  rows: Array<{ name: React.ReactNode; description: React.ReactNode }>
  className?: string
}

export const DocsVariantTable = ({
  nameHeader = "Variant",
  descHeader = "Use for",
  rows,
  className,
}: VariantTableProps) => (
  <div className={cn("overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0", className)}>
    <table className="w-full text-sm">
      <thead className="bg-bg-weak-50">
        <tr className="text-left">
          <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400 w-1/4">
            {nameHeader}
          </th>
          <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
            {descHeader}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stroke-soft-200">
        {rows.map((r, i) => (
          <tr key={i} className="align-top">
            <td className="px-4 py-3 font-semibold text-text-strong-950">
              {r.name}
            </td>
            <td className="px-4 py-3 text-text-sub-600 leading-relaxed">
              {r.description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
