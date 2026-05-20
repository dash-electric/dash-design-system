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

export default function LayeredArchitecturePage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Architecture"
        title="Dash Platform — Layered Architecture"
        description="One foundation, four products, N external tenants, zero drift. The architecture that lets Dash Ride, Logistic, Travel, Marketplace, and Trellis SaaS share infrastructure without forking — and without losing per-product personality."
      />

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

      <DocsSection title="Source">
        <p className="text-sm text-text-sub-600">
          Full spec, migration case studies, and showcase angles live in{" "}
          <Link
            className="text-(--dash-purple-600) underline-offset-4 hover:underline"
            href="https://github.com/dash-elektrik/dash-ds/blob/main/LAYERED-ARCHITECTURE.md"
          >
            <code className="text-xs">LAYERED-ARCHITECTURE.md</code>
          </Link>{" "}
          at the repo root.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
