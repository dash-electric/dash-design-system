"use client"

import { useState } from "react"
import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"

type ThemeKey = "ride" | "logistic" | "travel" | "marketplace" | "trellis-tenant"

type Theme = {
  key: ThemeKey
  label: string
  scope: "internal" | "trellis"
  accent: string
  accentDark: string
  voice: string
  vibe: string
  density: "Standard" | "Compact (data)" | "Spacious"
  sampleBlock: string
  useCase: string
  status: "shipped" | "wip" | "planned"
  manifestPath: string
}

const themes: Theme[] = [
  {
    key: "ride",
    label: "Dash Ride",
    scope: "internal",
    accent: "#5e2aac",
    accentDark: "#4b1c8c",
    voice: "Mitra formal · Anda",
    vibe: "Mobility",
    density: "Standard",
    sampleBlock: "surge-multiplier",
    useCase: "Driver app + ops dashboard for ride-hailing. Default Dash theme.",
    status: "shipped",
    manifestPath: "registry/dash/themes/ride.ts",
  },
  {
    key: "logistic",
    label: "Dash Logistic",
    scope: "internal",
    accent: "#1f6feb",
    accentDark: "#175bbf",
    voice: "Mitra formal · Anda",
    vibe: "Industrial",
    density: "Compact (data)",
    sampleBlock: "route-planner",
    useCase: "Fleet management, route planning, x-dock ops. Industrial register.",
    status: "wip",
    manifestPath: "registry/dash/themes/logistic.ts",
  },
  {
    key: "travel",
    label: "Dash Travel",
    scope: "internal",
    accent: "#1ea6c4",
    accentDark: "#147f97",
    voice: "Customer warm",
    vibe: "Calm",
    density: "Spacious",
    sampleBlock: "(planned)",
    useCase: "Itinerary, booking, travel marketplace. Warmer consumer register.",
    status: "planned",
    manifestPath: "registry/dash/themes/travel.ts",
  },
  {
    key: "marketplace",
    label: "Dash Marketplace",
    scope: "internal",
    accent: "#d4a017",
    accentDark: "#a47a0e",
    voice: "Customer warm",
    vibe: "Commerce",
    density: "Standard",
    sampleBlock: "(planned)",
    useCase: "Product detail pages, vendor onboarding, transactional commerce.",
    status: "planned",
    manifestPath: "registry/dash/themes/marketplace.ts",
  },
  {
    key: "trellis-tenant",
    label: "Trellis tenant",
    scope: "trellis",
    accent: "#475569",
    accentDark: "#334155",
    voice: "Tenant-defined",
    vibe: "Tenant brand",
    density: "Standard",
    sampleBlock: "tenant-config",
    useCase: "Template for external SaaS customers. Accent + voice from tenant config.",
    status: "planned",
    manifestPath: "registry/dash/themes/trellis-template.ts",
  },
]

const statusColor: Record<Theme["status"], string> = {
  shipped: "var(--state-success-base)",
  wip: "var(--state-warning-base)",
  planned: "var(--state-faded-base)",
}

const heroMetrics = [
  {
    value: "4",
    label: "Active themes",
    sub: "+ 1 tenant template",
  },
  {
    value: "1",
    label: "Button primitive",
    sub: "renders 4 ways via CSS var cascade",
  },
  {
    value: "0",
    label: "Lines of Layer 1 source touched",
    sub: "per theme — only --accent-* override",
  },
  {
    value: "~30",
    label: "Lines per theme manifest",
    sub: "the entire rebrand delta",
  },
]

function ThemePreview({ theme }: { theme: Theme }) {
  return (
    <div
      data-theme={theme.key}
      className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 space-y-5"
      style={
        {
          ["--theme-accent" as string]: theme.accent,
          ["--theme-accent-dark" as string]: theme.accentDark,
        } as React.CSSProperties
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-text-soft-400">
            Preview · same Layer 1 primitives
          </div>
          <div className="text-base font-semibold text-text-strong-950">
            {theme.label}
          </div>
        </div>
        <code className="text-[11px] text-text-soft-400">
          --accent-base: {theme.accent}
        </code>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Button */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-text-soft-400">
            Button
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
              style={{ background: theme.accent }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.accentDark
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.accent
              }}
            >
              Konfirmasi
            </button>
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium border bg-bg-white-0 transition-colors"
              style={{ color: theme.accent, borderColor: theme.accent }}
            >
              Lihat detail
            </button>
          </div>
        </div>

        {/* Badge */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-text-soft-400">
            Badge
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center text-[11px] font-medium rounded-full px-2.5 py-1 text-white"
              style={{ background: theme.accent }}
            >
              Aktif
            </span>
            <span
              className="inline-flex items-center text-[11px] font-medium rounded-full px-2.5 py-1 border"
              style={{ color: theme.accent, borderColor: theme.accent }}
            >
              {theme.sampleBlock}
            </span>
          </div>
        </div>

        {/* Card header */}
        <div className="space-y-2 sm:col-span-1">
          <div className="text-[10px] uppercase tracking-wider text-text-soft-400">
            Card header
          </div>
          <div className="rounded-lg border border-stroke-soft-200 overflow-hidden">
            <div
              className="px-3 py-2 text-xs font-semibold text-white"
              style={{ background: theme.accent }}
            >
              Status pesanan
            </div>
            <div className="px-3 py-3 text-xs text-text-sub-600">
              Diproses · ETA 12 menit
            </div>
          </div>
        </div>

        {/* Modal title */}
        <div className="space-y-2 sm:col-span-1">
          <div className="text-[10px] uppercase tracking-wider text-text-soft-400">
            Modal title
          </div>
          <div className="rounded-lg border border-stroke-soft-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ background: theme.accent }}
              />
              <div
                className="text-sm font-semibold"
                style={{ color: theme.accent }}
              >
                Konfirmasi pemesanan
              </div>
            </div>
            <p className="text-xs text-text-sub-600">
              Lanjut ke pembayaran?
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-soft-400 pt-2 border-t border-stroke-soft-200">
        <span>
          vibe · <span className="text-text-sub-600">{theme.vibe}</span>
        </span>
        <span>
          voice · <span className="text-text-sub-600">{theme.voice}</span>
        </span>
        <span>
          density · <span className="text-text-sub-600">{theme.density}</span>
        </span>
        <span>
          scope · <code className="text-xs">{theme.scope}</code>
        </span>
      </div>
    </div>
  )
}

export default function ThemesPage() {
  const [activeKey, setActiveKey] = useState<ThemeKey>("ride")
  const activeTheme = themes.find((t) => t.key === activeKey) ?? themes[0]

  return (
    <DocsPageShell>
      <DocsHeader
        category="Architecture"
        title="Themes"
        description="Layer 2 of the Dash Platform — the layer that bends. Each theme is a ~30-line manifest overriding accent tokens, voice, and density on top of Layer 0 + Layer 1."
      />

      {/* Hero metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {heroMetrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-6"
          >
            <div className="text-3xl font-semibold tabular-nums text-(--dash-purple-600) leading-none">
              {m.value}
            </div>
            <div className="text-xs font-medium text-text-strong-950 mt-2">
              {m.label}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-text-soft-400 mt-1">
              {m.sub}
            </div>
          </div>
        ))}
      </section>

      {/* Interactive theme tabs */}
      <DocsSection
        title="Try the cascade"
        description="Pick a theme. The preview re-renders the same Layer 1 primitives — Button, Badge, Card header, Modal title — with that theme's accent tokens. Nothing in the primitive source changes."
      >
        <div
          role="tablist"
          aria-label="Theme preview"
          className="flex flex-wrap gap-2 mb-4"
        >
          {themes.map((t) => {
            const isActive = t.key === activeKey
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => setActiveKey(t.key)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors flex items-center gap-2"
                style={{
                  background: isActive ? t.accent : "var(--bg-white-0)",
                  color: isActive ? "#fff" : "var(--text-sub-600)",
                  borderColor: isActive ? t.accent : "var(--stroke-soft-200)",
                }}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full border"
                  style={{
                    background: t.accent,
                    borderColor: isActive ? "#fff" : t.accent,
                  }}
                />
                {t.label}
              </button>
            )
          })}
        </div>

        <ThemePreview theme={activeTheme} />

        <p className="text-xs text-text-soft-400 mt-3">
          The preview is implemented with a single <code className="text-xs">useState</code>{" "}
          + scoped <code className="text-xs">data-theme</code> wrapper. In production, the
          theme is wired through <code className="text-xs">--accent-*</code> CSS variables at
          the <code className="text-xs">html</code> element — set once at boot by{" "}
          <code className="text-xs">dash init</code>.
        </p>
      </DocsSection>

      {/* Comparison table */}
      <DocsSection
        title="Theme matrix"
        description="The full surface area of divergence — accent, vibe, voice, density, and which Layer 3 block ships first. Everything else (Layer 0–1) is identical across themes."
      >
        <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke-soft-200 bg-bg-weak-50">
                <th className="text-left text-[11px] uppercase tracking-wider text-text-soft-400 font-medium px-4 py-3">
                  Aspect
                </th>
                {themes
                  .filter((t) => t.scope === "internal")
                  .map((t) => (
                    <th
                      key={t.key}
                      className="text-left text-[11px] uppercase tracking-wider text-text-soft-400 font-medium px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-3 w-3 rounded-full"
                          style={{ background: t.accent }}
                        />
                        {t.label.replace("Dash ", "")}
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  row: "Accent",
                  values: ["Purple", "Blue", "Teal", "Amber"],
                },
                {
                  row: "Vibe",
                  values: ["Mobility", "Industrial", "Calm", "Commerce"],
                },
                {
                  row: "Voice",
                  values: [
                    "Mitra formal",
                    "Mitra formal",
                    "Customer warm",
                    "Customer warm",
                  ],
                },
                {
                  row: "Density",
                  values: ["Standard", "Compact (data)", "Spacious", "Standard"],
                },
                {
                  row: "Sample block",
                  values: [
                    "surge-multiplier",
                    "route-planner",
                    "(planned)",
                    "(planned)",
                  ],
                },
              ].map((r) => (
                <tr
                  key={r.row}
                  className="border-b border-stroke-soft-200 last:border-b-0"
                >
                  <td className="px-4 py-3 text-xs font-medium text-text-strong-950">
                    {r.row}
                  </td>
                  {r.values.map((v, i) => (
                    <td
                      key={i}
                      className="px-4 py-3 text-xs text-text-sub-600 align-top"
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection
        title="Active themes"
        description="Four internal Dash products plus the Trellis template that external SaaS customers fork."
      >
        <div className="space-y-4">
          {themes.map((t) => (
            <div
              key={t.key}
              className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6"
            >
              <div className="flex items-start gap-4">
                {/* swatch */}
                <div
                  aria-hidden
                  className="h-16 w-16 rounded-lg flex-shrink-0 border border-stroke-soft-200"
                  style={{ background: t.accent }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-text-strong-950">
                        {t.label}
                      </span>
                      <code className="text-[11px] text-text-soft-400">{t.key}</code>
                    </div>
                    <span
                      className="inline-flex items-center text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5 text-white"
                      style={{ background: statusColor[t.status] }}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className="text-sm text-text-sub-600 mb-3">{t.useCase}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-soft-400 mb-3">
                    <span>
                      scope · <code className="text-xs">{t.scope}</code>
                    </span>
                    <span>
                      voice · <code className="text-xs">{t.voice}</code>
                    </span>
                    <span>
                      accent · <code className="text-xs">{t.accent}</code>
                    </span>
                  </div>

                  {/* example Button rendered in theme */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
                      style={{ background: t.accent }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = t.accentDark
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = t.accent
                      }}
                    >
                      Konfirmasi
                    </button>
                    <button
                      type="button"
                      className="rounded-lg px-4 py-2 text-sm font-medium border bg-bg-white-0 transition-colors"
                      style={{
                        color: t.accent,
                        borderColor: t.accent,
                      }}
                    >
                      Lihat detail
                    </button>
                    <Link
                      href={`https://github.com/dash-elektrik/dash-ds/blob/main/apps/docs/${t.manifestPath}`}
                      className="text-xs text-(--dash-purple-600) underline-offset-4 hover:underline ml-auto"
                    >
                      manifest →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DocsSection>

      {/* Trellis spotlight */}
      <DocsSection
        title="Spotlight — how this scales to Trellis"
        description="A Trellis tenant is a special theme variant. Same engine, customer-provided brand. The architecture earns its keep when an external SaaS customer onboards in minutes, not weeks."
      >
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-stroke-soft-200"
            style={{
              background:
                "linear-gradient(90deg, rgba(94,42,172,0.06) 0%, rgba(94,42,172,0) 100%)",
            }}
          >
            <div className="text-[11px] uppercase tracking-wider text-(--dash-purple-600) font-semibold">
              Trellis onboarding timeline
            </div>
            <div className="text-base font-semibold text-text-strong-950">
              30 minutes from tenant signup → branded DS live
            </div>
          </div>

          <ol className="divide-y divide-stroke-soft-200">
            {[
              {
                t: "0 min",
                h: "Tenant signs up",
                p: "Brand assets (logo, accent hex, voice register) submitted via Trellis admin.",
              },
              {
                t: "5 min",
                h: "Generate manifest",
                p: "Trellis copies trellis-template.ts → trellis-{tenantId}.ts. Accent + voice swapped from tenant config. WCAG contrast auto-verified.",
              },
              {
                t: "15 min",
                h: "Register + publish",
                p: "Theme registered in registry.json with scope: 'trellis'. Published to the tenant's CDN slice.",
              },
              {
                t: "30 min",
                h: "Tenant repo lights up",
                p: "Tenant runs dash init --theme trellis-acme. Layer 1 primitives now render in tenant brand. Zero Layer 0–1 forks. Zero per-tenant component code.",
              },
            ].map((step, i) => (
              <li key={step.t} className="px-6 py-4 flex items-start gap-4">
                <div className="flex flex-col items-center pt-0.5">
                  <span
                    className="inline-flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-semibold text-white"
                    style={{ background: "#5e2aac" }}
                  >
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-semibold tabular-nums text-(--dash-purple-600)">
                      {step.t}
                    </span>
                    <span className="text-sm font-semibold text-text-strong-950">
                      {step.h}
                    </span>
                  </div>
                  <p className="text-sm text-text-sub-600">{step.p}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </DocsSection>

      <DocsSection
        title="Adding a new theme"
        description="The Trellis template is the canonical example. A tenant onboards in ~1 day."
      >
        <ol className="space-y-3 text-sm text-text-sub-600 list-decimal pl-6">
          <li>Copy <code className="text-xs">themes/trellis-template.ts</code> to <code className="text-xs">themes/trellis-acme.ts</code>.</li>
          <li>Replace accent + dark from tenant brand assets. Verify WCAG AA contrast against <code className="text-xs">--bg-white-0</code> and <code className="text-xs">--bg-strong-950</code>.</li>
          <li>Set voice register from tenant config (formal / casual / mixed).</li>
          <li>Register in <code className="text-xs">registry.json</code> with <code className="text-xs">scope: &quot;trellis&quot;</code>.</li>
          <li>Tenant consumer repo runs <code className="text-xs">dash init --theme trellis-acme</code>.</li>
        </ol>
        <p className="text-sm text-text-sub-600 mt-3">
          Full architecture context:{" "}
          <Link
            className="text-(--dash-purple-600) underline-offset-4 hover:underline"
            href="/docs/architecture/layered"
          >
            Architecture · Layered
          </Link>
          .
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
