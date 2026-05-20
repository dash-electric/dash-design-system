"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"

type Theme = {
  key: string
  label: string
  scope: "internal" | "trellis"
  accent: string
  accentDark: string
  voice: string
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
    voice: "formal · Anda",
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
    voice: "formal · Anda",
    useCase: "Fleet management, route planning, x-dock ops. Industrial register.",
    status: "wip",
    manifestPath: "registry/dash/themes/logistic.ts",
  },
  {
    key: "travel",
    label: "Dash Travel",
    scope: "internal",
    accent: "#c79a2b",
    accentDark: "#946d11",
    voice: "mixed",
    useCase: "Itinerary, booking, travel marketplace. Warmer consumer register.",
    status: "planned",
    manifestPath: "registry/dash/themes/travel.ts",
  },
  {
    key: "marketplace",
    label: "Dash Marketplace",
    scope: "internal",
    accent: "#0f9d58",
    accentDark: "#0b7a44",
    voice: "mixed",
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
    voice: "tenant-defined",
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

export default function ThemesPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Architecture"
        title="Themes"
        description="Layer 2 of the Dash Platform — the layer that bends. Each theme is a ~30-line manifest overriding accent tokens, voice, and density on top of Layer 0 + Layer 1."
      />

      <DocsSection
        title="Active themes"
        description="Five themes today — four internal Dash products plus the Trellis template that external SaaS customers fork."
      >
        <div className="space-y-4">
          {themes.map((t) => (
            <div
              key={t.key}
              className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5"
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

      <DocsSection
        title="Adding a new theme"
        description="The Trellis template is the canonical example. A tenant onboards in ~1 day."
      >
        <ol className="space-y-3 text-sm text-text-sub-600 list-decimal pl-5">
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
