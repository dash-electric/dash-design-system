"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const tierSwatches = [
  { tier: "bg",     items: ["bg-white-0", "bg-weak-50", "bg-soft-200", "bg-sub-300", "bg-surface-800", "bg-strong-950"] },
  { tier: "text",   items: ["text-strong-950", "text-sub-600", "text-soft-400", "text-disabled-300", "text-white-0"] },
  { tier: "stroke", items: ["stroke-strong-950", "stroke-sub-300", "stroke-soft-200", "stroke-white-0"] },
  { tier: "icon",   items: ["icon-strong-950", "icon-sub-600", "icon-soft-400", "icon-disabled-300", "icon-white-0"] },
]

const stateTokens = [
  { name: "success",     hue: "green" },
  { name: "information", hue: "blue" },
  { name: "warning",     hue: "yellow" },
  { name: "error",       hue: "red" },
  { name: "away",        hue: "orange" },
  { name: "feature",     hue: "purple" },
  { name: "faded",       hue: "neutral" },
  { name: "verified",    hue: "sky" },
]

export default function ThemingPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Theming"
        title="Theming"
        description="Dash drives every component through a 4-tier semantic token system on top of 11 raw color scales. Override one variable at :root, and the entire app rebrands — no per-component code edits."
      />

      <DocsSection
        title="4-tier system"
        description="bg / text / stroke / icon — each with strong / sub / soft / disabled / weak / white levels."
      >
        <div className="space-y-4">
          {tierSwatches.map((tier) => (
            <div key={tier.tier}>
              <div className="text-xs uppercase tracking-wider text-text-soft-400 mb-2">
                --{tier.tier}-*
              </div>
              <div className="flex flex-wrap gap-2">
                {tier.items.map((name) => (
                  <div
                    key={name}
                    className="rounded-md border border-stroke-soft-200 px-3 py-2 text-xs"
                    style={{ background: `var(--${name})`, color: tier.tier === "text" ? `var(--${name})` : undefined }}
                  >
                    <span className={tier.tier === "text" ? "" : "mix-blend-difference text-text-white-0"}>
                      --{name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection
        title="State color palette"
        description="8 semantic states × 4 levels (dark / base / light / lighter). Every status badge, banner, alert, toast wires through these."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stateTokens.map((s) => (
            <div key={s.name} className="rounded-lg border border-stroke-soft-200 p-3 space-y-2 bg-bg-white-0">
              <div className="text-xs uppercase tracking-wider text-text-soft-400">{s.name}</div>
              <div className="flex h-8 rounded overflow-hidden">
                {(["lighter", "light", "base", "dark"] as const).map((level) => (
                  <div
                    key={level}
                    className="flex-1"
                    style={{ background: `var(--state-${s.name}-${level})` }}
                    title={`--state-${s.name}-${level}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-text-soft-400">
                <span>lighter</span>
                <span>light</span>
                <span>base</span>
                <span>dark</span>
              </div>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection
        title="11 color scales"
        description="The raw paint. Use semantic tokens 99% of the time — reach for scales only when designing custom illustrations or charts."
      >
        <DocsPropsTable
          rows={[
            { name: "gray",   type: "neutral", description: "Default neutral. Backbone of bg/text/stroke/icon tiers." },
            { name: "slate",  type: "neutral", description: "Cooler neutral alternative. Optional via baseColor switch." },
            { name: "blue",   type: "brand",   description: "Information state + accent links." },
            { name: "purple", type: "brand",   description: "Dash brand. --primary-base = purple-500." },
            { name: "orange", type: "state",   description: "Away / pending / warning-adjacent." },
            { name: "red",    type: "state",   description: "Error / destructive." },
            { name: "green",  type: "state",   description: "Success." },
            { name: "yellow", type: "state",   description: "Warning." },
            { name: "sky",    type: "state",   description: "Verified." },
            { name: "pink",   type: "chart",   description: "Chart accent. Not in semantic tokens." },
            { name: "teal",   type: "chart",   description: "Chart accent. Not in semantic tokens." },
          ]}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Full swatch grid:{" "}
          <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/theming/colors">
            Theming → Colors
          </Link>
          .
        </p>
      </DocsSection>

      <DocsSection
        title="Customize brand color"
        description="One line override at :root rebrands the entire app. The 5y Phase7 Results dashboard does exactly this."
      >
        <DocsCode
          language="css"
          code={`/* app/globals.css — your override block */
:root {
  /* Dash default = purple-500 #5e2aac */
  --primary-base:     #5e2aac;
  --primary-dark:     #4b1c8c;
  --primary-darker:   #54239e;

  /* Phase7 Results variant — gold accent */
  /* --primary-base:    #c79a2b; */
  /* --primary-dark:    #946d11; */
  /* --primary-darker:  #a87f1c; */
}`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Components reference <code className="text-xs">--primary-base</code> via{" "}
          <code className="text-xs">bg-primary</code> /{" "}
          <code className="text-xs">text-primary</code>. They never hard-code purple.
        </p>
      </DocsSection>

      <DocsSection title="Per-component overrides">
        <p className="text-sm text-text-sub-600 mb-3">
          Some registry items ship their own <code className="text-xs">cssVars</code> blocks
          (e.g. Halo-dash 3-pane uses a tighter <code className="text-xs">--radius-12</code>{" "}
          inside the right pane). The CLI merges those into globals.css under guard comments:
        </p>
        <DocsCode
          language="css"
          code={`/* @dash:start halo-dash-3pane */
[data-halo-pane="right"] {
  --radius-12: 0.625rem;
}
/* @dash:end halo-dash-3pane */`}
        />
      </DocsSection>

      <DocsSection title="Code examples">
        <DocsCode
          language="tsx"
          code={`// good — semantic
<div className="bg-bg-weak-50 text-text-strong-950 border border-stroke-soft-200">

// also good — state token via Badge component
<Badge status="success" appearance="lighter">Active</Badge>

// avoid — raw scale (only OK for charts/illustrations)
<div className="bg-(--dash-purple-500)">`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
