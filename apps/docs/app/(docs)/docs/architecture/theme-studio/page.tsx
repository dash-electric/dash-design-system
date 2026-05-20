"use client"

/**
 * Theme Studio — single interactive lab demonstrating Layer 2 → Layer 1 cascade.
 *
 * Companion to /docs/architecture/themes (which shows separate per-theme previews).
 * Theme Studio renders ONE sample component tree that re-themes on click,
 * proving same Layer 1 source + different Layer 2 manifest = different output.
 *
 * Implementation notes:
 * - `data-theme` attribute on the wrapper scopes CSS variable overrides
 * - All Layer 1 primitives consumed AS-IS (no fork per theme)
 * - Only `--theme-accent-*` CSS vars vary across themes
 * - useState only — no router, no client persistence (spec)
 */

import { useState } from "react"
import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"

type ThemeKey = "ride" | "logistic" | "travel" | "marketplace"

type ThemeManifest = {
  key: ThemeKey
  label: string
  tagline: string
  accent: string
  accentLight: string
  accentDark: string
  accentOn: string
  voice: string
  density: "compact" | "standard" | "spacious"
  blocks: string[]
  sampleSnippet: {
    badge: string
    line: string
  }
}

/* -------------------------------------------------------------------------- */
/*  Theme manifests — mirrors Layer 2 manifests in registry/dash/themes/.     */
/*  Inlined here for the docs page; production code reads from manifest.ts.   */
/* -------------------------------------------------------------------------- */

const THEMES: Record<ThemeKey, ThemeManifest> = {
  ride: {
    key: "ride",
    label: "Dash Ride",
    tagline: "Mobility · ride-hailing driver app + ops dashboard",
    accent: "#16a34a",
    accentLight: "#4ade80",
    accentDark: "#14532d",
    accentOn: "#ffffff",
    voice: "Mitra formal · Anda",
    density: "standard",
    blocks: ["surge-multiplier", "driver-assignment", "polygon-shift-map"],
    sampleSnippet: {
      badge: "Surge ×1.5",
      line: "Mitra Budi · armada aktif Polygon ID-JKT-04",
    },
  },
  logistic: {
    key: "logistic",
    label: "Dash Logistic",
    tagline: "Fleet · route planning, x-dock ops, last-mile",
    accent: "#ea580c",
    accentLight: "#fb923c",
    accentDark: "#7c2d12",
    accentOn: "#ffffff",
    voice: "Mitra formal · Anda",
    density: "compact",
    blocks: ["route-optimizer", "x-dock-board", "delivery-manifest"],
    sampleSnippet: {
      badge: "Route #4521",
      line: "Manifest 18 stops · ETA jam 14:30 WIB",
    },
  },
  travel: {
    key: "travel",
    label: "Dash Travel",
    tagline: "Travel · itinerary builder + booking flow",
    accent: "#2563eb",
    accentLight: "#60a5fa",
    accentDark: "#1e3a8a",
    accentOn: "#ffffff",
    voice: "Customer warm · campuran",
    density: "spacious",
    blocks: ["itinerary-builder", "booking-summary", "destination-card"],
    sampleSnippet: {
      badge: "Itinerary",
      line: "Jakarta → Bali · 3 hari · keberangkatan 21 Mei",
    },
  },
  marketplace: {
    key: "marketplace",
    label: "Dash Marketplace",
    tagline: "Commerce · product detail + vendor onboarding",
    accent: "#ca8a04",
    accentLight: "#facc15",
    accentDark: "#713f12",
    accentOn: "#ffffff",
    voice: "Customer warm · campuran",
    density: "standard",
    blocks: ["product-detail", "vendor-onboarding", "cart-summary"],
    sampleSnippet: {
      badge: "12 di keranjang",
      line: "Checkout siap · 3 vendor · ongkir Rp 24.000",
    },
  },
}

const THEME_ORDER: ThemeKey[] = ["ride", "logistic", "travel", "marketplace"]

/* -------------------------------------------------------------------------- */
/*  Sample component tree — single tree, re-rendered for the active theme.    */
/*  Consumes `--theme-accent-*` CSS vars set on the wrapper via data-theme.   */
/* -------------------------------------------------------------------------- */

function SampleButtons() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400">
        Buttons
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {/* Dash Purple — unchanged across themes (Layer 0 brand) */}
        <button
          type="button"
          className="rounded-lg bg-(--dash-purple-600) px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-(--dash-purple-700) transition-colors"
        >
          Primary
        </button>
        {/* Theme accent — re-themes on cascade */}
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors"
          style={{
            background: "var(--theme-accent-base)",
            color: "var(--theme-accent-on)",
          }}
        >
          Accent
        </button>
        {/* Outline accent */}
        <button
          type="button"
          className="rounded-lg border bg-bg-white-0 px-4 py-2 text-sm font-medium transition-colors"
          style={{
            color: "var(--theme-accent-base)",
            borderColor: "var(--theme-accent-base)",
          }}
        >
          Outline
        </button>
        {/* Neutral secondary — semantic, theme-independent */}
        <button
          type="button"
          className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-4 py-2 text-sm font-medium text-text-sub-600 hover:bg-bg-weak-50 transition-colors"
        >
          Secondary
        </button>
      </div>
    </div>
  )
}

function SampleBadges() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400">
        Badges
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            background: "var(--theme-accent-base)",
            color: "var(--theme-accent-on)",
          }}
        >
          Active
        </span>
        <span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2.5 py-0.5 text-xs font-medium text-text-sub-600 border border-stroke-soft-200">
          Inactive
        </span>
        {/* Warning — semantic, theme-independent */}
        <span className="inline-flex items-center rounded-full bg-warning-lighter px-2.5 py-0.5 text-xs font-medium text-warning-dark border border-warning-light">
          Warning
        </span>
        <span className="inline-flex items-center rounded-full bg-error-lighter px-2.5 py-0.5 text-xs font-medium text-error-dark border border-error-light">
          Critical
        </span>
      </div>
    </div>
  )
}

function SampleHeroCard({ theme }: { theme: ThemeManifest }) {
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400 mb-3">
        Hero stat
      </div>
      <div
        className="text-4xl font-bold tabular-nums leading-none"
        style={{ color: "var(--theme-accent-base)" }}
      >
        1.284
      </div>
      <div className="mt-1.5 text-sm text-text-sub-600">
        transaksi aktif hari ini
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: "var(--theme-accent-base)" }}
        />
        <span className="text-text-soft-400">
          {theme.density === "compact"
            ? "Density · compact"
            : theme.density === "spacious"
              ? "Density · spacious"
              : "Density · standard"}
        </span>
      </div>
    </div>
  )
}

function SampleStatusIndicator() {
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400 mb-3">
        Status indicator
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5 text-sm text-text-strong-950">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--theme-accent-base)" }}
          />
          Online · siap menerima order
        </div>
        <div className="flex items-center gap-2.5 text-sm text-text-sub-600">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-state-faded-base" />
          Offline · sedang istirahat
        </div>
        <div className="flex items-center gap-2.5 text-sm text-text-sub-600">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning-base" />
          Mendekati batas shift
        </div>
      </div>
    </div>
  )
}

function SampleProductSnippet({ theme }: { theme: ThemeManifest }) {
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400 mb-3">
        Product context · {theme.label.replace("Dash ", "")}
      </div>
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold"
          style={{
            background: "var(--theme-accent-base)",
            color: "var(--theme-accent-on)",
          }}
        >
          {theme.sampleSnippet.badge}
        </span>
        <span className="text-sm text-text-strong-950 truncate">
          {theme.sampleSnippet.line}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="rounded-md px-3 py-1.5 text-xs font-medium shadow-sm transition-colors"
          style={{
            background: "var(--theme-accent-base)",
            color: "var(--theme-accent-on)",
          }}
        >
          Konfirmasi
        </button>
        <button
          type="button"
          className="rounded-md border bg-bg-white-0 px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            color: "var(--theme-accent-base)",
            borderColor: "var(--theme-accent-base)",
          }}
        >
          Detail
        </button>
      </div>
    </div>
  )
}

function SampleInput({ theme }: { theme: ThemeManifest }) {
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-text-soft-400 mb-3">
        Form field
      </div>
      <label className="block text-xs font-medium text-text-sub-600 mb-1.5">
        ID Mitra
      </label>
      <input
        type="text"
        defaultValue=""
        placeholder="Masukkan ID Mitra"
        className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm text-text-strong-950 outline-none transition-colors placeholder:text-text-soft-400"
        style={
          {
            // Focus ring uses theme accent via inline CSS var fallback
            "--tw-ring-color": "var(--theme-accent-base)",
          } as React.CSSProperties
        }
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.accent
          e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accent}33`
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = ""
          e.currentTarget.style.boxShadow = ""
        }}
      />
      <div className="mt-2 text-xs text-text-soft-400">
        Voice · {theme.voice}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Theme tabs                                                                 */
/* -------------------------------------------------------------------------- */

function ThemeTabs({
  active,
  onChange,
}: {
  active: ThemeKey
  onChange: (k: ThemeKey) => void
}) {
  return (
    <div
      role="tablist"
      className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-1"
    >
      {THEME_ORDER.map((k) => {
        const isActive = active === k
        const t = THEMES[k]
        return (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(k)}
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all"
            style={{
              background: isActive ? t.accent : "transparent",
              color: isActive ? t.accentOn : "var(--text-sub-600)",
              boxShadow: isActive
                ? "0 1px 2px 0 rgb(0 0 0 / 0.05)"
                : undefined,
            }}
          >
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full border border-white/40"
              style={{ background: t.accent }}
            />
            {t.label.replace("Dash ", "")}
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Theme metadata panel                                                       */
/* -------------------------------------------------------------------------- */

function ThemeMetadata({ theme }: { theme: ThemeManifest }) {
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-5">
      <div className="flex items-start gap-4 mb-4">
        <div
          aria-hidden
          className="h-12 w-12 rounded-lg flex-shrink-0 border border-stroke-soft-200"
          style={{ background: theme.accent }}
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text-strong-950">
            {theme.label}
          </div>
          <div className="text-xs text-text-sub-600 mt-0.5">
            {theme.tagline}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
        <div className="flex items-center justify-between gap-3 md:block">
          <dt className="text-text-soft-400 uppercase tracking-wider mb-0.5">
            Accent base
          </dt>
          <dd className="font-mono text-text-strong-950">{theme.accent}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 md:block">
          <dt className="text-text-soft-400 uppercase tracking-wider mb-0.5">
            Accent light
          </dt>
          <dd className="font-mono text-text-strong-950">
            {theme.accentLight}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 md:block">
          <dt className="text-text-soft-400 uppercase tracking-wider mb-0.5">
            Accent dark
          </dt>
          <dd className="font-mono text-text-strong-950">{theme.accentDark}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 md:block">
          <dt className="text-text-soft-400 uppercase tracking-wider mb-0.5">
            Accent on
          </dt>
          <dd className="font-mono text-text-strong-950">{theme.accentOn}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 md:block">
          <dt className="text-text-soft-400 uppercase tracking-wider mb-0.5">
            Voice register
          </dt>
          <dd className="text-text-strong-950">{theme.voice}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 md:block">
          <dt className="text-text-soft-400 uppercase tracking-wider mb-0.5">
            Density
          </dt>
          <dd className="text-text-strong-950 capitalize">{theme.density}</dd>
        </div>
      </dl>

      <div className="mt-4 pt-4 border-t border-stroke-soft-200">
        <div className="text-xs text-text-soft-400 uppercase tracking-wider mb-2">
          Layer 3 blocks (product-owned)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {theme.blocks.map((b) => (
            <code
              key={b}
              className="rounded-md bg-bg-white-0 border border-stroke-soft-200 px-2 py-0.5 text-[11px] text-text-sub-600"
            >
              {b}
            </code>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ThemeStudioPage() {
  const [theme, setTheme] = useState<ThemeKey>("ride")
  const active = THEMES[theme]

  return (
    <DocsPageShell>
      {/*
        Scoped CSS — injected once. The `[data-theme=...]` selectors set
        Layer 2 accent vars; any descendant that reads var(--theme-accent-*)
        re-renders with the active theme's accent. This is the cascade —
        no React prop drilling, no per-theme component fork.
      */}
      <style>{`
        [data-theme="ride"] {
          --theme-accent-base:  ${THEMES.ride.accent};
          --theme-accent-light: ${THEMES.ride.accentLight};
          --theme-accent-dark:  ${THEMES.ride.accentDark};
          --theme-accent-on:    ${THEMES.ride.accentOn};
        }
        [data-theme="logistic"] {
          --theme-accent-base:  ${THEMES.logistic.accent};
          --theme-accent-light: ${THEMES.logistic.accentLight};
          --theme-accent-dark:  ${THEMES.logistic.accentDark};
          --theme-accent-on:    ${THEMES.logistic.accentOn};
        }
        [data-theme="travel"] {
          --theme-accent-base:  ${THEMES.travel.accent};
          --theme-accent-light: ${THEMES.travel.accentLight};
          --theme-accent-dark:  ${THEMES.travel.accentDark};
          --theme-accent-on:    ${THEMES.travel.accentOn};
        }
        [data-theme="marketplace"] {
          --theme-accent-base:  ${THEMES.marketplace.accent};
          --theme-accent-light: ${THEMES.marketplace.accentLight};
          --theme-accent-dark:  ${THEMES.marketplace.accentDark};
          --theme-accent-on:    ${THEMES.marketplace.accentOn};
        }
      `}</style>

      <DocsHeader
        category="Architecture"
        title="Theme Studio"
        description="Interactive lab. Click a theme — every sample component re-renders. Same Layer 1 source, different Layer 2 manifest, different output. This is the cascade that makes Dash a platform instead of a single product."
        status="new"
      />

      {/* ──────────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Live cascade"
        description="Switch the theme. The component tree below is identical for all four — only Layer 2 vars vary."
      >
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <ThemeTabs active={theme} onChange={setTheme} />
          <div className="text-xs text-text-soft-400">
            Active ·{" "}
            <span className="text-text-strong-950 font-medium">
              {active.label}
            </span>{" "}
            · accent{" "}
            <code className="font-mono text-text-strong-950">
              {active.accent}
            </code>
          </div>
        </div>

        {/* The themed sub-tree — wrapper sets the cascade scope */}
        <div
          data-theme={theme}
          className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/40 p-6 transition-colors"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5">
              <SampleButtons />
            </div>
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5">
              <SampleBadges />
            </div>
            <SampleHeroCard theme={active} />
            <SampleStatusIndicator />
            <SampleProductSnippet theme={active} />
            <SampleInput theme={active} />
          </div>
        </div>
      </DocsSection>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Theme metadata"
        description="What changed when you clicked. Each theme is a ~30-line manifest in registry/dash/themes/."
      >
        <ThemeMetadata theme={active} />
      </DocsSection>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="What you just saw"
        description="The platform play, in four lines."
      >
        <ul className="space-y-2.5 text-sm text-text-sub-600">
          <li className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-(--dash-purple-600) flex-shrink-0"
            />
            <span>
              <span className="font-medium text-text-strong-950">
                Same Layer 1 source
              </span>{" "}
              for all four examples — one Button, one Badge, one Card
              component each.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-(--dash-purple-600) flex-shrink-0"
            />
            <span>
              Only{" "}
              <span className="font-medium text-text-strong-950">
                Layer 2 (--theme-accent-*)
              </span>{" "}
              varies. Voice, density, and Layer 3 block manifests follow the
              same pattern.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-(--dash-purple-600) flex-shrink-0"
            />
            <span>
              <span className="font-medium text-text-strong-950">
                Zero source code changes per theme.
              </span>{" "}
              A new theme is a ~30-line manifest, not a fork of 76
              components.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-(--dash-purple-600) flex-shrink-0"
            />
            <span>
              <span className="font-medium text-text-strong-950">
                Trellis tenants
              </span>{" "}
              get the same engine — copy the manifest, swap the accent + voice
              from tenant config, ship in a day.
            </span>
          </li>
        </ul>
      </DocsSection>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <DocsSection
        title="Keep reading"
        description="Theme Studio is the demo. The spec is one click away."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/docs/architecture/themes"
            className="block rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 hover:border-(--dash-purple-600) hover:bg-bg-weak-50/60 transition-colors"
          >
            <div className="text-xs uppercase tracking-wider text-text-soft-400 mb-1">
              Architecture · Themes
            </div>
            <div className="text-sm font-semibold text-text-strong-950 mb-1">
              All five active themes →
            </div>
            <div className="text-xs text-text-sub-600">
              Ride, Logistic, Travel, Marketplace, plus the Trellis tenant
              template — manifest links, use-case, voice register, status.
            </div>
          </Link>
          <Link
            href="/docs/architecture/layered"
            className="block rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 hover:border-(--dash-purple-600) hover:bg-bg-weak-50/60 transition-colors"
          >
            <div className="text-xs uppercase tracking-wider text-text-soft-400 mb-1">
              Architecture · Layered
            </div>
            <div className="text-sm font-semibold text-text-strong-950 mb-1">
              Why four layers →
            </div>
            <div className="text-xs text-text-sub-600">
              Layer 0 brand, Layer 1 primitives, Layer 2 theme (this), Layer 3
              workflow blocks. Decision tree for where new components land.
            </div>
          </Link>
        </div>
      </DocsSection>
    </DocsPageShell>
  )
}
