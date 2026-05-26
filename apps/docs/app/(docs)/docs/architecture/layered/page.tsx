"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

type Layer = {
  num: 0 | 1 | 2 | 3
  name: string
  scope: "shared · locked" | "shared · stable" | "divergent · small" | "divergent · large"
  blurb: string
  examples: string
  accent: string
}

const layers: Layer[] = [
  {
    num: 3,
    name: "Workflow Blocks",
    scope: "divergent · large",
    blurb: "Product-specific composites. Owned by product teams, reviewed by DS for foundation compliance.",
    examples: "ride-dispatch-board · logistic-route-planner · travel-itinerary-card · marketplace-pdp · outsourcing-roster",
    accent: "var(--state-feature-base)",
  },
  {
    num: 2,
    name: "Product / Tenant Theme",
    scope: "divergent · small",
    blurb: "~30-line manifest. Overrides accent tokens, voice, density. The layer that bends.",
    examples: "ride · logistic · travel · marketplace · trellis-{tenantId}",
    accent: "var(--state-information-base)",
  },
  {
    num: 1,
    name: "Common Primitives",
    scope: "shared · stable",
    blurb: "~76 atom-level components. Consume Layer 0 tokens, never hard-code brand. CI-enforced contract.",
    examples: "Button · Input · Select · Badge · Modal · Tabs · Toast · Avatar · Table · Card",
    accent: "var(--state-success-base)",
  },
  {
    num: 0,
    name: "Brand Foundation",
    scope: "shared · locked",
    blurb: "Non-negotiable substrate. Type ramp, spacing, radius, motion, semantic tokens, a11y floor.",
    examples: "Inter ramp · 4-pt grid · radius-4…24 · ease curves · bg/text/stroke/icon tiers · WCAG 2.2 AA",
    accent: "var(--state-warning-base)",
  },
]

type HeroMetric = {
  value: string
  label: string
  sub?: string
}

const heroMetrics: HeroMetric[] = [
  { value: "4", label: "Layers", sub: "stacked contract" },
  { value: "202", label: "Registry items", sub: "atoms · blocks · templates" },
  { value: "7", label: "Audit rules", sub: "CI-enforced" },
  { value: "4", label: "Product themes", sub: "Ride · Logistic · Travel · Marketplace" },
  { value: "1", label: "External tenant template", sub: "Trellis" },
  { value: "17", label: "Workflow blocks shipped", sub: "Layer 3 composites" },
]

export default function LayeredArchitecturePage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Architecture"
        title="Dash Platform — Layered Architecture"
        description="One foundation, four products, N external tenants, zero drift. The architecture that lets Dash Ride, Logistic, Travel, Marketplace, and Trellis SaaS share infrastructure without forking — and without losing per-product personality."
      />

      {/* Hero metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {heroMetrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-5"
          >
            <div className="text-3xl font-semibold tabular-nums text-(--dash-purple-600) leading-none">
              {m.value}
            </div>
            <div className="text-xs font-medium text-text-strong-950 mt-2">
              {m.label}
            </div>
            {m.sub && (
              <div className="text-[10px] uppercase tracking-wider text-text-soft-400 mt-1">
                {m.sub}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* SVG architecture diagram */}
      <DocsSection
        title="At a glance"
        description="Four layers, bottom-up dependency. Layer 0–1 are shared across the whole product family; Layer 2–3 diverge per product or tenant."
      >
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-6 overflow-x-auto">
          <svg
            viewBox="0 0 880 360"
            role="img"
            aria-label="Four-layer Dash architecture diagram"
            className="block w-full h-auto min-w-[640px]"
          >
            <defs>
              <linearGradient id="dashAccent" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#5e2aac" />
                <stop offset="100%" stopColor="#4b1c8c" />
              </linearGradient>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="#5e2aac" />
              </marker>
            </defs>

            {/* Product family callout (top) */}
            <g>
              <text
                x="20"
                y="20"
                fontSize="10"
                fill="#64748b"
                style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                Consumers
              </text>
              {["Dash Ride", "Dash Logistic", "Dash Travel", "Marketplace", "Trellis tenant"].map(
                (p, i) => (
                  <g key={p}>
                    <rect
                      x={20 + i * 168}
                      y={28}
                      width={156}
                      height={30}
                      rx={6}
                      fill="#f5f0fb"
                      stroke="#d8c5f4"
                    />
                    <text
                      x={98 + i * 168}
                      y={47}
                      fontSize="12"
                      textAnchor="middle"
                      fill="#3b1473"
                      fontWeight="600"
                    >
                      {p}
                    </text>
                  </g>
                ),
              )}
            </g>

            {/* Down-arrows from products into Layer 3 */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={98 + i * 168}
                y1={62}
                x2={98 + i * 168}
                y2={82}
                stroke="#5e2aac"
                strokeWidth="1.5"
                markerEnd="url(#arrow)"
              />
            ))}

            {/* Layer 3 — Workflow Blocks (divergent · large) */}
            <g>
              <rect
                x="20"
                y="86"
                width="840"
                height="50"
                rx="8"
                fill="#fff"
                stroke="#a5b4fc"
                strokeWidth="1.5"
              />
              <rect x="20" y="86" width="6" height="50" rx="3" fill="#6366f1" />
              <text x="40" y="110" fontSize="11" fill="#64748b" fontWeight="600">
                LAYER 3
              </text>
              <text x="40" y="126" fontSize="14" fill="#0f172a" fontWeight="600">
                Workflow Blocks
              </text>
              <text x="220" y="120" fontSize="11" fill="#475569">
                Product-specific composites · 17 shipped
              </text>
              <text x="220" y="132" fontSize="10" fill="#94a3b8">
                ride-dispatch-board · logistic-route-planner · marketplace-pdp …
              </text>
              <text
                x="840"
                y="110"
                fontSize="10"
                fill="#94a3b8"
                textAnchor="end"
                style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                divergent · large
              </text>
            </g>

            {/* Layer 2 — Theme */}
            <g>
              <rect
                x="20"
                y="148"
                width="840"
                height="50"
                rx="8"
                fill="#fff"
                stroke="#7dd3fc"
                strokeWidth="1.5"
              />
              <rect x="20" y="148" width="6" height="50" rx="3" fill="#0284c7" />
              <text x="40" y="172" fontSize="11" fill="#64748b" fontWeight="600">
                LAYER 2
              </text>
              <text x="40" y="188" fontSize="14" fill="#0f172a" fontWeight="600">
                Theme manifest
              </text>
              <text x="220" y="182" fontSize="11" fill="#475569">
                ~30-line override · accent · voice · density
              </text>
              <text x="220" y="194" fontSize="10" fill="#94a3b8">
                ride · logistic · travel · marketplace · trellis-{`{tenantId}`}
              </text>
              <text
                x="840"
                y="172"
                fontSize="10"
                fill="#94a3b8"
                textAnchor="end"
                style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                divergent · small
              </text>
            </g>

            {/* Layer 1 — Primitives */}
            <g>
              <rect
                x="20"
                y="210"
                width="840"
                height="50"
                rx="8"
                fill="#fff"
                stroke="#86efac"
                strokeWidth="1.5"
              />
              <rect x="20" y="210" width="6" height="50" rx="3" fill="#16a34a" />
              <text x="40" y="234" fontSize="11" fill="#64748b" fontWeight="600">
                LAYER 1
              </text>
              <text x="40" y="250" fontSize="14" fill="#0f172a" fontWeight="600">
                Common Primitives
              </text>
              <text x="220" y="244" fontSize="11" fill="#475569">
                ~76 atoms · token-driven · zero hard-coded brand
              </text>
              <text x="220" y="256" fontSize="10" fill="#94a3b8">
                Button · Input · Modal · Tabs · Card · Toast · Avatar · Table …
              </text>
              <text
                x="840"
                y="234"
                fontSize="10"
                fill="#94a3b8"
                textAnchor="end"
                style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                shared · stable
              </text>
            </g>

            {/* Layer 0 — Foundation */}
            <g>
              <rect
                x="20"
                y="272"
                width="840"
                height="50"
                rx="8"
                fill="url(#dashAccent)"
              />
              <text x="40" y="296" fontSize="11" fill="#e9d5ff" fontWeight="600">
                LAYER 0
              </text>
              <text x="40" y="312" fontSize="14" fill="#fff" fontWeight="700">
                Brand Foundation
              </text>
              <text x="220" y="306" fontSize="11" fill="#e9d5ff">
                Tokens · type · spacing · motion · WCAG 2.2 AA · locked
              </text>
              <text
                x="840"
                y="296"
                fontSize="10"
                fill="#e9d5ff"
                textAnchor="end"
                style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                shared · locked
              </text>
            </g>

            {/* Dependency arrows on the left (Layer 3 depends on Layer 2 …) */}
            <g>
              {[
                { y1: 136, y2: 148 },
                { y1: 198, y2: 210 },
                { y1: 260, y2: 272 },
              ].map((a, i) => (
                <line
                  key={i}
                  x1="10"
                  y1={a.y1}
                  x2="10"
                  y2={a.y2}
                  stroke="#5e2aac"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              ))}
            </g>

            {/* Legend bottom */}
            <g>
              <text x="20" y="346" fontSize="10" fill="#64748b">
                ← depends on (Layer N consumes Layer N-1 tokens only)
              </text>
              <text x="840" y="346" fontSize="10" fill="#64748b" textAnchor="end">
                Layer 0–1 shared across the family · Layer 2–3 diverge per product
              </text>
            </g>
          </svg>
        </div>
      </DocsSection>

      <DocsSection
        title="The 4 layers"
        description="Each layer either locks what must stay shared, or opens cleanly to divergence. Read top-down: workflow → theme → primitives → foundation."
      >
        <div className="space-y-3">
          {layers.map((layer) => (
            <div
              key={layer.num}
              className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5"
              style={{ borderLeftWidth: 4, borderLeftColor: layer.accent }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center justify-center rounded-md text-xs font-semibold px-2 py-1"
                    style={{ background: layer.accent, color: "var(--text-white-0)" }}
                  >
                    Layer {layer.num}
                  </span>
                  <span className="text-base font-semibold text-text-strong-950">
                    {layer.name}
                  </span>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-text-soft-400">
                  {layer.scope}
                </span>
              </div>
              <p className="text-sm text-text-sub-600 mb-2">{layer.blurb}</p>
              <p className="text-xs text-text-soft-400">
                <span className="text-text-sub-600">Examples — </span>
                {layer.examples}
              </p>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection
        title="Side-by-side — same primitive, different theme"
        description="Both buttons below render from the exact same Layer 1 Button component. The only difference is the Layer 2 theme manifest swapping --accent-base."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              theme: "ride",
              label: "Dash Ride",
              voice: "formal · Anda",
              accent: "#5e2aac",
              dark: "#4b1c8c",
            },
            {
              theme: "logistic",
              label: "Dash Logistic",
              voice: "formal · Anda",
              accent: "#1f6feb",
              dark: "#175bbf",
            },
          ].map((t) => (
            <div
              key={t.theme}
              className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6"
            >
              <div className="text-[11px] uppercase tracking-wider text-text-soft-400 mb-1">
                theme · {t.theme}
              </div>
              <div className="text-sm font-semibold text-text-strong-950 mb-3">
                {t.label}
              </div>
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
                style={{
                  background: t.accent,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = t.dark
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = t.accent
                }}
              >
                Konfirmasi pemesanan
              </button>
              <div className="text-[11px] text-text-soft-400 mt-3">
                accent <code className="text-xs">{t.accent}</code> · voice {t.voice}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-soft-400 mt-3">
          Real components reach the accent via <code className="text-xs">--accent-base</code>{" "}
          token, not literal hex. The hex here is illustrative only — see the{" "}
          <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/architecture/themes">
            theme gallery
          </Link>{" "}
          for the full set.
        </p>
      </DocsSection>

      <DocsSection
        title="Real-world example"
        description="Dash Ride mitra app and Dash Logistic dispatcher both call the same Button from Layer 1. The accent diverges via Layer 2 theme cascade — zero per-product Button code."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DocsCode
            language="tsx"
            code={`// apps/ride-mitra/screens/booking-confirm.tsx
// theme: ride  ·  --accent-base = #5e2aac (Dash Purple)
import { Button } from "@dash/ui"

export function ConfirmAction() {
  return (
    <Button variant="primary" size="md">
      Konfirmasi pemesanan
    </Button>
  )
}`}
          />
          <DocsCode
            language="tsx"
            code={`// apps/logistic-dispatcher/screens/route-assign.tsx
// theme: logistic  ·  --accent-base = #1f6feb (Industrial Blue)
import { Button } from "@dash/ui"

export function AssignRoute() {
  return (
    <Button variant="primary" size="md">
      Tugaskan rute
    </Button>
  )
}`}
          />
        </div>
        <p className="text-xs text-text-soft-400 mt-3">
          Identical <code className="text-xs">{"<Button>"}</code> usage. Identical import. The accent
          comes from the consumer repo&apos;s active theme manifest — not from the Button source.
        </p>
      </DocsSection>

      <DocsSection
        title="How it works — 4 steps"
        description="From a fresh consumer repo to a fully themed product UI."
      >
        <ol className="space-y-4 text-sm text-text-sub-600 list-decimal pl-5">
          <li>
            <span className="font-medium text-text-strong-950">Bootstrap.</span>{" "}
            <code className="text-xs">dash init --theme logistic</code> writes{" "}
            <code className="text-xs">dash.config.json</code>, Tailwind tokens, and Layer 0
            CSS variables. Done once per consumer repo.
          </li>
          <li>
            <span className="font-medium text-text-strong-950">Install primitives.</span>{" "}
            <code className="text-xs">dash add button input select modal</code> pulls Layer
            1 components. They render correctly in the active theme without any
            theme-specific code.
          </li>
          <li>
            <span className="font-medium text-text-strong-950">Install or build blocks.</span>{" "}
            <code className="text-xs">dash add logistic-route-planner</code> for
            product-specific Layer 3 blocks. New blocks default to{" "}
            <code className="text-xs">theme: &quot;shared&quot;</code> unless declared.
          </li>
          <li>
            <span className="font-medium text-text-strong-950">CI audits.</span>{" "}
            <code className="text-xs">dash audit</code> rejects hard-coded accent hex,
            theme mismatches, missing audit-trail fields, and banned external libraries.
          </li>
        </ol>
      </DocsSection>

      <DocsSection
        title="Theme manifest — anatomy"
        description="A theme is ~30 lines. That is the entire delta needed to rebrand."
      >
        <DocsCode
          language="ts"
          code={`// registry/dash/themes/logistic.ts
import { defineTheme } from "@dash/registry-schema"

export const logistic = defineTheme({
  key: "logistic",
  label: "Dash Logistic",
  scope: "internal",                // "internal" | "trellis"
  tokens: {
    "--accent-base":    "#1f6feb",
    "--accent-dark":    "#175bbf",
    "--accent-darker":  "#114a99",
    "--accent-on":      "var(--bg-white-0)",
  },
  voice: {
    register:   "formal",            // "formal" | "casual"
    pronoun:    "Anda",
    audience:   "mitra+ops",
  },
  density: "compact",                // "compact" | "cozy" | "comfortable"
  overrides: {
    "--radius-12": "0.5rem",         // sharper corners for ops UI
  },
})`}
        />
      </DocsSection>

      <DocsSection
        title="Contract — locked vs flexible"
        description="What you can and cannot change without a Layer 0 RFC."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-4">
            <div className="text-[11px] uppercase tracking-wider text-text-soft-400 mb-2">
              Locked · Layer 0–1
            </div>
            <ul className="text-sm text-text-sub-600 space-y-1 list-disc pl-5">
              <li>Token names and tiers</li>
              <li>Primitive API surface (props, slots, refs)</li>
              <li>Focus ring, contrast, touch target</li>
              <li>Motion curves</li>
              <li>Banned imports list</li>
            </ul>
          </div>
          <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-4">
            <div className="text-[11px] uppercase tracking-wider text-text-soft-400 mb-2">
              Flexible · Layer 2–3
            </div>
            <ul className="text-sm text-text-sub-600 space-y-1 list-disc pl-5">
              <li>Accent token values</li>
              <li>Voice / copy register</li>
              <li>Density preset</li>
              <li>Optional radius overrides</li>
              <li>Workflow block composition</li>
            </ul>
          </div>
        </div>
      </DocsSection>

      <DocsSection
        title="Why this matters"
        description="Three commitments the layering buys us — each one would otherwise cost a fork."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              h: "Brand unity across the product family",
              p: "Layer 0–1 is one substrate. Every Dash surface inherits the same type ramp, spacing, focus ring, and a11y floor — so Ride, Logistic, Travel, and Marketplace feel like one company even when accent shifts.",
            },
            {
              h: "Product autonomy where it counts",
              p: "Layer 2–3 diverges cleanly. A product team owns its workflow blocks and theme without ever editing primitives — no merge conflicts with sibling products, no DS bottleneck on every feature.",
            },
            {
              h: "External tenants extendable",
              p: "The Trellis template proves Layer 2 generalizes beyond Dash. An external SaaS customer ships their own brand by overriding the same ~30-line manifest — same engine, customer-provided identity.",
            },
          ].map((b) => (
            <div
              key={b.h}
              className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5"
              style={{ borderTopWidth: 3, borderTopColor: "#5e2aac" }}
            >
              <div className="text-sm font-semibold text-text-strong-950 mb-2">
                {b.h}
              </div>
              <p className="text-sm text-text-sub-600">{b.p}</p>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Source">
        <p className="text-sm text-text-sub-600">
          Full spec, migration case studies, and showcase angles live in{" "}
          <Link
            className="text-(--dash-purple-600) underline-offset-4 hover:underline"
            href="https://github.com/dash-electric/express-design-system/blob/main/ARCHITECTURE.md"
          >
            <code className="text-xs">ARCHITECTURE.md</code>
          </Link>{" "}
          at the repo root.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
