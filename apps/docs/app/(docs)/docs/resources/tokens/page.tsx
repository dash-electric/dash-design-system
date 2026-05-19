"use client"

import * as React from "react"
import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"

type TokenRow = { name: string; sample: string; description: string }

type TokenGroup = { title: string; description: string; rows: TokenRow[] }

const groups: TokenGroup[] = [
  {
    title: "Background",
    description: "Surface fills. Flip on dark-mode via the .dark override block.",
    rows: [
      { name: "--bg-white-0",    sample: "#ffffff",        description: "Canvas surface — page background." },
      { name: "--bg-weak-50",    sample: "neutral-50",     description: "Subtle elevation — card body, code block." },
      { name: "--bg-soft-200",   sample: "neutral-200",    description: "Disabled / muted surface, skeleton fill." },
      { name: "--bg-sub-300",    sample: "neutral-300",    description: "Secondary surface, divider zones." },
      { name: "--bg-surface-800",sample: "neutral-800",    description: "Inverted near-canvas — tooltips on light, panels on dark." },
      { name: "--bg-strong-950", sample: "neutral-950",    description: "Inverted CTA fill — primary button on light." },
    ],
  },
  {
    title: "Text",
    description: "Type fills. Sub = body copy, soft = captions.",
    rows: [
      { name: "--text-strong-950",   sample: "neutral-950", description: "Headings + primary copy." },
      { name: "--text-sub-600",      sample: "neutral-600", description: "Body / secondary copy." },
      { name: "--text-soft-400",     sample: "neutral-400", description: "Captions / labels / placeholder." },
      { name: "--text-disabled-300", sample: "neutral-300", description: "Disabled inputs + buttons." },
      { name: "--text-white-0",      sample: "#ffffff",     description: "Text on dark backgrounds (primary button label)." },
    ],
  },
  {
    title: "Stroke",
    description: "Border colors — keep them quiet, the system is shadow-led.",
    rows: [
      { name: "--stroke-strong-950", sample: "neutral-950", description: "Inverted border — never used on light surfaces directly." },
      { name: "--stroke-sub-300",    sample: "neutral-300", description: "Strong dividers, table cell borders." },
      { name: "--stroke-soft-200",   sample: "neutral-200", description: "Default border — cards, inputs, modal edges." },
      { name: "--stroke-white-0",    sample: "#ffffff",     description: "Hairline on dark surfaces." },
    ],
  },
  {
    title: "Icon",
    description: "Standalone icon fills. Match text tier where possible.",
    rows: [
      { name: "--icon-strong-950",   sample: "neutral-950", description: "Solid icon — paired with text-strong-950." },
      { name: "--icon-sub-600",      sample: "neutral-600", description: "Default icon — paired with text-sub-600." },
      { name: "--icon-soft-400",     sample: "neutral-400", description: "Decorative icon, caption-adjacent." },
      { name: "--icon-disabled-300", sample: "neutral-300", description: "Disabled state." },
      { name: "--icon-white-0",      sample: "#ffffff",     description: "Icon on dark backgrounds." },
    ],
  },
  {
    title: "State",
    description: "8 semantic states × 4 levels. Drive every status badge, banner, alert.",
    rows: [
      { name: "--state-success-base",     sample: "green-500",   description: "Success solid." },
      { name: "--state-success-light",    sample: "green-200",   description: "Soft fill background." },
      { name: "--state-success-lighter",  sample: "green-50",    description: "Tonal background — banner body." },
      { name: "--state-success-dark",     sample: "green-700",   description: "Text on light fill — high contrast." },
      { name: "--state-information-base", sample: "blue-500",    description: "Information." },
      { name: "--state-warning-base",     sample: "yellow-500",  description: "Warning." },
      { name: "--state-error-base",       sample: "red-500",     description: "Error / destructive." },
      { name: "--state-away-base",        sample: "orange-500",  description: "Away / pending." },
      { name: "--state-feature-base",     sample: "purple-500",  description: "Feature flag / new." },
      { name: "--state-faded-base",       sample: "neutral-500", description: "Inactive." },
      { name: "--state-verified-base",    sample: "sky-500",     description: "Verified." },
    ],
  },
  {
    title: "Brand",
    description: "Override --primary-base at :root to rebrand the whole app.",
    rows: [
      { name: "--primary-base",      sample: "purple-500", description: "Dash brand purple. CTA fill, links, focus rings." },
      { name: "--primary-dark",      sample: "purple-800", description: "Hover / pressed state for primary buttons." },
      { name: "--primary-darker",    sample: "purple-700", description: "Active / pressed mid-state." },
      { name: "--primary-alpha-24",  sample: "purple-α24", description: "24% opacity overlay — focus rings." },
      { name: "--primary-alpha-16",  sample: "purple-α16", description: "16% opacity — hover surface." },
      { name: "--primary-alpha-10",  sample: "purple-α10", description: "10% opacity — pressed surface, range track fill." },
    ],
  },
  {
    title: "Shadow",
    description: "8 elevation presets. Custom-* are source signature stacked shadows.",
    rows: [
      { name: "--shadow-regular-xs",   sample: "0 1px 2px",   description: "Tooltip / pill — barely there." },
      { name: "--shadow-regular-sm",   sample: "0 2px 4px",   description: "Hover lift on cards." },
      { name: "--shadow-regular-md",   sample: "0 16px 32px", description: "Modal / drawer." },
      { name: "--shadow-tooltip",      sample: "stacked",     description: "Tooltips, dropdowns." },
      { name: "--shadow-toggle-switch",sample: "stacked",     description: "Switch thumb shadow." },
      { name: "--shadow-custom-xs",    sample: "stacked + inset", description: "Card xs — input ring." },
      { name: "--shadow-custom-sm",    sample: "stacked",     description: "Card sm — popover, command palette." },
      { name: "--shadow-custom-md",    sample: "stacked",     description: "Card md — primary modal." },
      { name: "--shadow-custom-lg",    sample: "stacked",     description: "Card lg — full-screen drawer." },
    ],
  },
  {
    title: "Radius",
    description: "7-step scale. radius-12 is the system default.",
    rows: [
      { name: "--radius-8",    sample: "0.5rem",   description: "Pill / small chip." },
      { name: "--radius-10",   sample: "0.625rem", description: "Button (default)." },
      { name: "--radius-12",   sample: "0.75rem",  description: "Card, input, modal." },
      { name: "--radius-16",   sample: "1rem",     description: "Drawer, sheet." },
      { name: "--radius-20",   sample: "1.25rem",  description: "Large modal." },
      { name: "--radius-24",   sample: "1.5rem",   description: "Hero card." },
      { name: "--radius-full", sample: "9999px",   description: "Avatar, badge dot." },
    ],
  },
  {
    title: "Motion",
    description: "Duration + easing tokens. Used by Tailwind v4 @theme inline transition tokens.",
    rows: [
      { name: "--duration-100", sample: "100ms", description: "Micro — focus rings, hover swaps." },
      { name: "--duration-200", sample: "200ms", description: "Default — most interactive transitions." },
      { name: "--duration-300", sample: "300ms", description: "Tabs, segmented control slide." },
      { name: "--duration-500", sample: "500ms", description: "Page-level enter/exit." },
      { name: "--ease-out",     sample: "cubic", description: "Default entrance easing." },
      { name: "--ease-in-out",  sample: "cubic", description: "Balanced — slider, drawer." },
    ],
  },
  {
    title: "Typography",
    description: "Aligns to Tailwind v4 text-* utilities; here for reference and override.",
    rows: [
      { name: "--font-sans",         sample: "Plus Jakarta Sans", description: "Dash typeface (sole font in the system)." },
      { name: "--text-display-2xl",  sample: "72px / 80",      description: "Hero h1." },
      { name: "--text-display-xl",   sample: "60px / 72",      description: "Marketing h1." },
      { name: "--text-h1",           sample: "48px / 56",      description: "Docs h1." },
      { name: "--text-body-md",      sample: "16px / 24",      description: "Body default." },
    ],
  },
]

function CopyableRow({ row }: { row: TokenRow }) {
  const [copied, setCopied] = React.useState(false)
  const onClick = () => {
    navigator.clipboard.writeText(`var(${row.name})`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <tr>
      <td className="px-3 py-2 align-top">
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "text-xs text-text-strong-950 hover:text-(--dash-purple-600) text-left",
            copied && "text-(--dash-purple-600)",
          )}
          title="Click to copy"
        >
          {copied ? "Copied!" : row.name}
        </button>
      </td>
      <td className="px-3 py-2 text-xs text-text-soft-400 align-top whitespace-nowrap">{row.sample}</td>
      <td className="px-3 py-2 text-sm text-text-sub-600 align-top">{row.description}</td>
    </tr>
  )
}

export default function TokensReferencePage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Resources"
        title="Token Reference"
        description="Every CSS variable Dash ships. Click any token name to copy its var() reference. Use this as the source of truth when wiring custom components or auditing for raw-hex violations."
      />

      {groups.map((g) => (
        <DocsSection key={g.title} title={g.title} description={g.description}>
          <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
            <table className="w-full text-sm">
              <thead className="bg-bg-weak-50">
                <tr className="text-left">
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-sub-600">Variable</th>
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-sub-600">Sample</th>
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-sub-600">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-soft-200">
                {g.rows.map((row) => (
                  <CopyableRow key={row.name} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </DocsSection>
      ))}

      <DocsSection title="Usage">
        <p className="text-sm text-text-sub-600">
          For full theming guidance — overriding brand color, dark-mode tokens, per-component
          cssVars — see{" "}
          <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/theming">
            Theming
          </Link>
          . For raw color scales (purple-50…950, alpha variants), see{" "}
          <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/theming/colors">
            Theming → Colors
          </Link>
          .
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
