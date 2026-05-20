"use client"

import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsDoDont,
} from "@/components/docs/page-shell"

/**
 * Color tokens reference — Figma 1:1 parity (16 nodes, verified 2026-05-17).
 *
 *   Surface tokens (6 groups, Figma nodes 2645:352 + 2645:1184 + 2652:5029 +
 *   2655:5282 + 2655:5451 + 2655:5555):
 *     - Primary (purple, brand)
 *     - Static (black + white, theme-invariant)
 *     - Background (6 levels: white-0 … strong-950)
 *     - Text (5 levels: strong-950 … white-0)
 *     - Stroke (4 levels: strong-950 … white-0)
 *     - Icon (5 levels: strong-950 … white-0)
 *
 *   State tokens (10 groups × 4 levels: dark / base / light / lighter):
 *     - Faded (slate), Information (blue), Warning (orange), Error (red),
 *       Success (green), Away (yellow), Feature (purple), Verified (sky),
 *       Highlighted (pink), Stable (teal).
 *
 *   Click any swatch to copy `var(--<name>)` to the clipboard.
 */

type Swatch = {
  /** Token css var name without the leading `--`. */
  token: string
  /** Light-mode source scale (e.g. `purple-500`). */
  light: string
  /** Dark-mode source scale (e.g. `purple-600`). */
  dark: string
  /** Tailwind class used to render the swatch background. */
  bg: string
  /** Optional readable text color override for the swatch label. */
  fg?: string
}

type Group = {
  title: string
  namespace: string
  description: string
  swatches: Swatch[]
}

const surfaceGroups: Group[] = [
  {
    title: "Primary",
    namespace: "primary",
    description: "Dominant brand colors. The Dash purple anchor — every CTA, focus ring, and primary link inherits from these.",
    swatches: [
      { token: "primary-darker",   light: "purple-800", dark: "purple-700", bg: "bg-(--primary-darker)", fg: "text-static-white" },
      { token: "primary-dark",     light: "purple-700", dark: "purple-600", bg: "bg-(--primary-dark)",   fg: "text-static-white" },
      { token: "primary-base",     light: "purple-500", dark: "purple-500", bg: "bg-primary",            fg: "text-static-white" },
      { token: "primary-alpha-16", light: "purple-α16", dark: "purple-α16", bg: "bg-(--primary-alpha-16)", fg: "text-text-strong-950" },
      { token: "primary-alpha-10", light: "purple-α10", dark: "purple-α10", bg: "bg-(--primary-alpha-10)", fg: "text-text-strong-950" },
    ],
  },
  {
    title: "Static",
    namespace: "static",
    description: "Theme-invariant. Same value in light + dark mode. Use only when contrast must stay anchored regardless of theme (e.g. button labels on a brand surface).",
    swatches: [
      { token: "static-black", light: "neutral-950", dark: "neutral-950", bg: "bg-(--static-black)", fg: "text-static-white" },
      { token: "static-white", light: "neutral-0",   dark: "neutral-0",   bg: "bg-(--static-white) border border-stroke-soft-200", fg: "text-text-strong-950" },
    ],
  },
  {
    title: "Background",
    namespace: "bg",
    description: "Surface fills. Six elevation levels from canvas (white-0) to deepest tone (strong-950). Dark mode flips the scale.",
    swatches: [
      { token: "bg-strong-950",  light: "neutral-950", dark: "neutral-0",   bg: "bg-bg-strong-950",  fg: "text-static-white" },
      { token: "bg-surface-800", light: "neutral-800", dark: "neutral-200", bg: "bg-bg-surface-800", fg: "text-static-white" },
      { token: "bg-sub-300",     light: "neutral-300", dark: "neutral-600", bg: "bg-bg-sub-300",     fg: "text-text-strong-950" },
      { token: "bg-soft-200",    light: "neutral-200", dark: "neutral-700", bg: "bg-bg-soft-200",    fg: "text-text-strong-950" },
      { token: "bg-weak-50",     light: "neutral-50",  dark: "neutral-800", bg: "bg-bg-weak-50",     fg: "text-text-strong-950" },
      { token: "bg-white-0",     light: "neutral-0",   dark: "neutral-950", bg: "bg-bg-white-0 border border-stroke-soft-200", fg: "text-text-strong-950" },
    ],
  },
  {
    title: "Text",
    namespace: "text",
    description: "Type fills. Strong = headings, sub = body, soft = captions, disabled = inactive controls.",
    swatches: [
      { token: "text-strong-950",   light: "neutral-950", dark: "neutral-0",   bg: "bg-text-strong-950",       fg: "text-static-white" },
      { token: "text-sub-600",      light: "neutral-600", dark: "neutral-400", bg: "bg-text-sub-600",          fg: "text-static-white" },
      { token: "text-soft-400",     light: "neutral-400", dark: "neutral-500", bg: "bg-(--text-soft-400)",     fg: "text-static-white" },
      { token: "text-disabled-300", light: "neutral-300", dark: "neutral-600", bg: "bg-(--text-disabled-300)", fg: "text-text-strong-950" },
      { token: "text-white-0",      light: "neutral-0",   dark: "neutral-950", bg: "bg-(--text-white-0) border border-stroke-soft-200", fg: "text-text-strong-950" },
    ],
  },
  {
    title: "Stroke",
    namespace: "stroke",
    description: "Border colors. Keep them quiet — Dash is a shadow-led system, not a border-led one.",
    swatches: [
      { token: "stroke-strong-950", light: "neutral-950", dark: "neutral-0",   bg: "bg-stroke-strong-950",  fg: "text-static-white" },
      { token: "stroke-sub-300",    light: "neutral-300", dark: "neutral-600", bg: "bg-stroke-sub-300",     fg: "text-text-strong-950" },
      { token: "stroke-soft-200",   light: "neutral-200", dark: "neutral-700", bg: "bg-stroke-soft-200",    fg: "text-text-strong-950" },
      { token: "stroke-white-0",    light: "neutral-0",   dark: "neutral-950", bg: "bg-(--stroke-white-0) border border-stroke-soft-200", fg: "text-text-strong-950" },
    ],
  },
  {
    title: "Icon",
    namespace: "icon",
    description: "Standalone icon fills. Match the equivalent text tier (icon-sub goes with text-sub, etc.).",
    swatches: [
      { token: "icon-strong-950",   light: "neutral-950", dark: "neutral-0",   bg: "bg-(--icon-strong-950)",   fg: "text-static-white" },
      { token: "icon-sub-600",      light: "neutral-600", dark: "neutral-400", bg: "bg-(--icon-sub-600)",      fg: "text-static-white" },
      { token: "icon-soft-400",     light: "neutral-400", dark: "neutral-500", bg: "bg-(--icon-soft-400)",     fg: "text-static-white" },
      { token: "icon-disabled-300", light: "neutral-300", dark: "neutral-600", bg: "bg-(--icon-disabled-300)", fg: "text-text-strong-950" },
      { token: "icon-white-0",      light: "neutral-0",   dark: "neutral-950", bg: "bg-(--icon-white-0) border border-stroke-soft-200", fg: "text-text-strong-950" },
    ],
  },
]

type StateGroupDef = {
  title: string
  ns: string
  description: string
  scale: string
}

const stateGroupDefs: StateGroupDef[] = [
  { title: "Faded",       ns: "state-faded",       description: "Inactive / neutral status — paused mitra, archived trips, decommissioned features.", scale: "slate" },
  { title: "Information", ns: "state-information", description: "Neutral informational signal — tips, helper notices, system messages.",              scale: "blue" },
  { title: "Warning",     ns: "state-warning",     description: "Caution — reversible action, near-limit thresholds.",                                 scale: "orange" },
  { title: "Error",       ns: "state-error",       description: "Destructive / failure — failed dispatch, validation error, blocked action.",          scale: "red" },
  { title: "Success",     ns: "state-success",     description: "Completion / positive — saved, paid, dispatched, verified.",                          scale: "green" },
  { title: "Away",        ns: "state-away",        description: "Pending / waiting — driver offline, payment awaiting, idle session.",                 scale: "yellow" },
  { title: "Feature",     ns: "state-feature",     description: "Promotional / new feature — beta, new-release callout, what's-new badge.",            scale: "purple" },
  { title: "Verified",    ns: "state-verified",    description: "Identity / trust marker — KYC verified, partner certified, audited badge.",           scale: "sky" },
  { title: "Highlighted", ns: "state-highlighted", description: "Marketing accent — limited offer, promo, hot deal, attention spike.",                 scale: "pink" },
  { title: "Stable",      ns: "state-stable",      description: "Steady-state operational health — system OK, region online, service stable.",        scale: "teal" },
]

const stateGroups: Group[] = stateGroupDefs.map((g) => ({
  title: g.title,
  namespace: g.ns,
  description: g.description,
  swatches: [
    { token: `${g.ns}-dark`,    light: `${g.scale}-950`, dark: `${g.scale}-400`, bg: `bg-(--${g.ns}-dark)`,    fg: "text-static-white" },
    { token: `${g.ns}-base`,    light: `${g.scale}-500`, dark: `${g.scale}-600`, bg: `bg-(--${g.ns}-base)`,    fg: "text-static-white" },
    { token: `${g.ns}-light`,   light: `${g.scale}-200`, dark: `${g.scale}-α24`, bg: `bg-(--${g.ns}-light)`,   fg: "text-text-strong-950" },
    { token: `${g.ns}-lighter`, light: `${g.scale}-50`,  dark: `${g.scale}-α16`, bg: `bg-(--${g.ns}-lighter)`, fg: "text-text-strong-950" },
  ],
}))

function SwatchCard({ swatch }: { swatch: Swatch }) {
  const [copied, setCopied] = React.useState(false)
  const onClick = () => {
    navigator.clipboard.writeText(`var(--${swatch.token})`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl text-left transition-shadow",
        "h-32 p-3 flex flex-col justify-end",
        "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-alpha-24)",
        swatch.bg,
      )}
      title="Click to copy var()"
    >
      <div className={cn("text-[11px] font-semibold tracking-tight", swatch.fg ?? "text-text-strong-950")}>
        {copied ? "Copied!" : swatch.token}
      </div>
      <div className={cn("text-[10px] mt-0.5 opacity-70", swatch.fg ?? "text-text-strong-950")}>
        {swatch.light}
      </div>
    </button>
  )
}

function GroupBlock({ group }: { group: Group }) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-text-strong-950 flex items-baseline gap-2">
          {group.title}
          <code className="text-[11px] font-mono text-text-soft-400 font-normal">{`{${group.namespace}}`}</code>
        </h3>
        <p className="text-sm text-text-sub-600 mt-1 max-w-2xl">{group.description}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {group.swatches.map((s) => (
          <SwatchCard key={s.token} swatch={s} />
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
        <table className="w-full text-sm">
          <thead className="bg-bg-weak-50">
            <tr className="text-left">
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-sub-600">Name</th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-sub-600">Light mode</th>
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-sub-600">Dark mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke-soft-200">
            {group.swatches.map((s) => (
              <tr key={s.token}>
                <td className="px-3 py-2 text-xs text-text-strong-950 font-mono">{s.token}</td>
                <td className="px-3 py-2 text-xs text-text-sub-600">
                  <span className="inline-flex items-center gap-2">
                    <span className={cn("inline-block size-3 rounded-full border border-stroke-soft-200", s.bg)} />
                    {s.light}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-text-sub-600">{s.dark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function ColorPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Foundations"
        title="Color"
        description="Three tiers: surface (background, text, stroke, icon), brand (primary purple), and state (10 semantic statuses × 4 levels). Every token resolves through the @theme block in app/globals.css and flips automatically in dark mode. Click any swatch to copy its var() reference."
      />

      <DocsSection title="Surface tokens">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Six anchor groups every page lives on: brand <strong>Primary</strong>, theme-invariant <strong>Static</strong>, and four cross-component surface namespaces (<strong>bg</strong>, <strong>text</strong>, <strong>stroke</strong>, <strong>icon</strong>).
        </p>
        <div className="space-y-12 mt-6">
          {surfaceGroups.map((g) => (
            <GroupBlock key={g.namespace} group={g} />
          ))}
        </div>
      </DocsSection>

      <DocsSection title="State tokens">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Ten semantic statuses × four levels (<code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">-dark</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">-base</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">-light</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">-lighter</code>). Powers every Badge, Banner, Alert, Hint. Use the short alias <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">error-base</code> instead of <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">state-error-base</code> in Tailwind classes: <code className="text-xs">bg-error-base text-static-white</code>.
        </p>
        <div className="space-y-12 mt-6">
          {stateGroups.map((g) => (
            <GroupBlock key={g.namespace} group={g} />
          ))}
        </div>
      </DocsSection>
      <DocsSection title="Use semantic tokens">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Reach for semantic tokens (`bg-primary-base`, `text-success-base`) — never hardcoded hex. Tokens flip in dark mode for free.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-2">
                <div className="flex items-center gap-2"><div className="size-8 rounded-md bg-primary-base" /><code className="text-[10px]">bg-primary-base</code></div>
                <div className="flex items-center gap-2"><div className="size-8 rounded-md bg-success-base" /><code className="text-[10px]">bg-success-base</code></div>
                <div className="flex items-center gap-2"><div className="size-8 rounded-md bg-error-base" /><code className="text-[10px]">bg-error-base</code></div>
              </div>
            ),
            caption: "Semantic tokens read intent. `primary-base` for brand CTAs, `success-base` for confirmation, `error-base` for destructive.",
          }}
          dont={{
            preview: (
              <div className="space-y-2">
                <div className="flex items-center gap-2"><div className="size-8 rounded-md" style={{background: "#7C4FC4"}} /><code className="text-[10px]">bg-[#7C4FC4]</code></div>
                <div className="flex items-center gap-2"><div className="size-8 rounded-md" style={{background: "#38C793"}} /><code className="text-[10px]">bg-[#38C793]</code></div>
                <div className="flex items-center gap-2"><div className="size-8 rounded-md" style={{background: "#F75D5F"}} /><code className="text-[10px]">bg-[#F75D5F]</code></div>
              </div>
            ),
            caption: "Don't hardcode hex. Won't flip in dark mode, won't re-theme for portal tenants, won't survive a token rename.",
          }}
        />
      </DocsSection>

      <DocsSection title="Tone reflects intent">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Success = green for confirmation, never decoration. Error = red for destructive, never branding. Don't dress confirmation as a danger flag.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-2">
                <div className="rounded-md bg-success-lighter text-success-dark px-3 py-2 text-xs">Payout Rp 4,5jt berhasil ke KopKen</div>
                <div className="rounded-md bg-warning-lighter text-warning-dark px-3 py-2 text-xs">Saldo akan habis dalam 2 hari</div>
                <div className="rounded-md bg-error-lighter text-error-dark px-3 py-2 text-xs">Suspend mitra Tono S. permanen?</div>
              </div>
            ),
            caption: "Green confirms success, yellow warns of attention, red signals destructive consequence. Color = intent.",
          }}
          dont={{
            preview: (
              <div className="space-y-2">
                <div className="rounded-md bg-error-lighter text-error-dark px-3 py-2 text-xs">Payout Rp 4,5jt berhasil ke KopKen</div>
                <div className="rounded-md bg-success-lighter text-success-dark px-3 py-2 text-xs">Suspend mitra Tono S.?</div>
              </div>
            ),
            caption: "Don't invert the intent. Red on success undermines trust. Green on suspend trains users to ignore destructive warnings.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
