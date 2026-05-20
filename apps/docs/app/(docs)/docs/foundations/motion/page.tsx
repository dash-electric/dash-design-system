"use client"

import { useState } from "react"
import { cn } from "@/registry/dash/lib/utils"
import { DocsDoDont } from "@/components/docs/page-shell"

const durations = [
  { token: "--duration-instant", ms: 80, use: "State acknowledgments — checkbox toggle, switch flip, button press." },
  { token: "--duration-fast", ms: 150, use: "Hover/focus reveals, tooltip enter, dropdown open." },
  { token: "--duration-base", ms: 220, use: "Default transitions — modal fade, sheet slide, card lift on hover." },
  { token: "--duration-slow", ms: 320, use: "Panel reveal, route change, hero motion." },
  { token: "--duration-slower", ms: 480, use: "Onboarding flourishes, success animations, attention pulses." },
] as const

const easings = [
  { token: "--ease-linear", value: "linear", use: "Loading bars, progress, anything time-bound." },
  { token: "--ease-out", value: "cubic-bezier(0.16, 1, 0.3, 1)", use: "Default — enter, reveal, expand. Decelerates as it lands." },
  { token: "--ease-in", value: "cubic-bezier(0.7, 0, 0.84, 0)", use: "Exit, dismiss, collapse. Accelerates as it leaves." },
  { token: "--ease-in-out", value: "cubic-bezier(0.65, 0, 0.35, 1)", use: "Continuous motion both directions — drag, pan, scrub." },
  { token: "--ease-spring", value: "cubic-bezier(0.34, 1.56, 0.64, 1)", use: "Playful overshoot — toast pop-in, badge attention, success bounce." },
] as const

function DemoBox({ duration, easing, children }: { duration: string; easing: string; children: React.ReactNode }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onClick={() => setPressed((p) => !p)}
      className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 text-left hover:border-foreground/30 transition-colors"
    >
      <div className="aspect-[3/2] bg-muted rounded-md overflow-hidden flex items-center justify-center">
        <div
          className={cn(
            "size-12 rounded-full bg-primary",
            pressed ? "translate-x-12" : "translate-x-0",
          )}
          style={{
            transitionProperty: "transform",
            transitionDuration: duration,
            transitionTimingFunction: easing,
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        {children}
        <span className="text-[10px] text-muted-foreground">click to play</span>
      </div>
    </button>
  )
}

export default function MotionPage() {
  return (
    <article className="mx-auto max-w-5xl px-6 lg:px-10 py-12 space-y-14">
      <header>
        <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">
          Foundations
        </div>
        <h1 className="text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] mb-4">
          Motion
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Five durations and five easings. Every transition picks one of each — never freestyles a value.
          The result: consistent rhythm across hover states, panels, modals, and route changes.
        </p>
      </header>

      {/* Hero */}
      <section
        className="rounded-2xl border border-border p-10"
        style={{
          background: "linear-gradient(135deg, var(--dash-blue-50), var(--dash-purple-50))",
        }}
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <DemoBox duration="80ms" easing="cubic-bezier(0.16, 1, 0.3, 1)">
            <div>
              <div className="text-xs font-medium text-foreground">instant + ease-out</div>
              <code className="text-[10px] text-muted-foreground">80ms</code>
            </div>
          </DemoBox>
          <DemoBox duration="220ms" easing="cubic-bezier(0.16, 1, 0.3, 1)">
            <div>
              <div className="text-xs font-medium text-foreground">base + ease-out</div>
              <code className="text-[10px] text-muted-foreground">220ms</code>
            </div>
          </DemoBox>
          <DemoBox duration="320ms" easing="cubic-bezier(0.34, 1.56, 0.64, 1)">
            <div>
              <div className="text-xs font-medium text-foreground">slow + spring</div>
              <code className="text-[10px] text-muted-foreground">320ms</code>
            </div>
          </DemoBox>
        </div>
      </section>

      {/* Highlights */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          {
            title: "Pick the slot, not the number",
            body: "Always reach for a `--duration-*` and a `--ease-*` token. Inline ms values get rejected at review.",
          },
          {
            title: "Default = base + ease-out",
            body: "If you're not sure, ship `220ms cubic-bezier(0.16, 1, 0.3, 1)`. Covers 80% of product transitions.",
          },
          {
            title: "Respect reduced motion",
            body: "All Dash components honor `prefers-reduced-motion` — durations collapse to 0ms, springs disable.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-1.5">{item.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      {/* Durations */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Durations</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Five steps from instant feedback to attention-grabbing flourish. Most transitions land at <code className="text-xs px-1 py-0.5 rounded bg-muted">--duration-base</code> (220ms).
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {durations.map((d) => (
            <div key={d.token} className="grid grid-cols-1 sm:grid-cols-[200px_80px_1fr] items-center gap-4 px-5 py-4">
              <code className="text-sm font-medium text-foreground">{d.token}</code>
              <div className="text-xs text-muted-foreground">{d.ms}ms</div>
              <div className="text-sm text-muted-foreground">{d.use}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Easings */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Easings</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tuned for screens. <code className="text-xs px-1 py-0.5 rounded bg-muted">--ease-out</code> is the default — use it unless the motion is specifically about exit, drag, or playful overshoot.
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {easings.map((e) => (
            <div key={e.token} className="grid grid-cols-1 sm:grid-cols-[200px_1fr_220px] items-start gap-4 px-5 py-4">
              <code className="text-sm font-medium text-foreground">{e.token}</code>
              <div className="text-sm text-muted-foreground">{e.use}</div>
              <code className="text-[10px] text-muted-foreground sm:text-right break-all">{e.value}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Pairing */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Common pairings</h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {[
            { event: "Button press / state acknowledgment", pair: "instant + ease-out" },
            { event: "Hover lift on Card / Button", pair: "fast + ease-out" },
            { event: "Tooltip / Popover open", pair: "fast + ease-out" },
            { event: "DropdownMenu / Combobox open", pair: "base + ease-out" },
            { event: "Modal / Dialog enter", pair: "base + ease-out" },
            { event: "Modal / Dialog exit", pair: "fast + ease-in" },
            { event: "Sheet / Drawer slide", pair: "base + ease-in-out" },
            { event: "Toast pop-in", pair: "slow + ease-spring" },
            { event: "Skeleton shimmer", pair: "slower + linear (loop)" },
            { event: "Route change fade", pair: "fast + ease-out" },
          ].map((row) => (
            <div key={row.event} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5">
              <div className="text-sm text-foreground">{row.event}</div>
              <code className="text-xs text-muted-foreground">{row.pair}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Usage</h2>
        <div className="rounded-lg bg-(--dash-slate-950) text-(--dash-slate-100) p-5 text-sm overflow-x-auto">
          <div className="text-(--dash-slate-400) mb-1"># Tailwind v4 — arbitrary token reference</div>
          <div>{`<div className="transition-transform duration-(--duration-base) ease-(--ease-out)" />`}</div>
          <div className="text-(--dash-slate-400) mt-3 mb-1"># inline style for one-off transitions</div>
          <div>{`<div style={{ transition: "opacity var(--duration-base) var(--ease-out)" }} />`}</div>
          <div className="text-(--dash-slate-400) mt-3 mb-1"># reduced motion respect (in component)</div>
          <div>{`@media (prefers-reduced-motion: reduce) { transition-duration: 0ms; }`}</div>
        </div>
      </section>

      {/* Rules */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Rules</h2>
        <ul className="space-y-3 text-base text-foreground/90">
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Pick from the scale. Hand-rolled ms values (`duration-[173ms]`) get rejected.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Enter motion uses <code className="text-xs px-1 py-0.5 rounded bg-muted">ease-out</code>; exit uses <code className="text-xs px-1 py-0.5 rounded bg-muted">ease-in</code>; bidirectional drag uses <code className="text-xs px-1 py-0.5 rounded bg-muted">ease-in-out</code>.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Spring is opt-in, not default. Reserve for celebratory moments — not standard transitions.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Never animate <code className="text-xs px-1 py-0.5 rounded bg-muted">width</code>, <code className="text-xs px-1 py-0.5 rounded bg-muted">height</code>, <code className="text-xs px-1 py-0.5 rounded bg-muted">top/left</code>. Use <code className="text-xs px-1 py-0.5 rounded bg-muted">transform</code> + <code className="text-xs px-1 py-0.5 rounded bg-muted">opacity</code> only.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>All components must respect <code className="text-xs px-1 py-0.5 rounded bg-muted">prefers-reduced-motion: reduce</code> — durations collapse to 0ms.</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Source</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Motion tokens are Dash-defined — source design system doesn&apos;t expose motion as a Figma variable.
          Durations and easings here follow the screen-motion conventions used across Material 3,
          shadcn/ui, and Radix UI defaults, scoped to Dash needs (mitra dispatch, dashboards, mobile flows).
        </p>
      </section>
      <section className="space-y-4">
        <header><h2 className="text-2xl font-semibold tracking-tight">Duration tokens</h2><p className="text-sm text-muted-foreground max-w-2xl mt-1">150ms for state changes, 300ms for layout, 500ms for entrance. Don't free-style durations and curves per component.</p></header>
        <DocsDoDont
          do={{
            preview: (
              <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground w-full max-w-md">
                <div className="rounded-lg border border-border bg-background p-2"><p className="font-mono">150ms</p><p>State (hover/press)</p></div>
                <div className="rounded-lg border border-border bg-background p-2"><p className="font-mono">300ms</p><p>Layout (drawer)</p></div>
                <div className="rounded-lg border border-border bg-background p-2"><p className="font-mono">500ms</p><p>Entrance (toast)</p></div>
              </div>
            ),
            caption: "Three tokens cover state, layout, entrance. Coherent rhythm across components.",
          }}
          dont={{
            preview: (
              <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground w-full max-w-md">
                <div className="rounded-lg border border-border bg-background p-2"><p className="font-mono">87ms</p><p>linear</p></div>
                <div className="rounded-lg border border-border bg-background p-2"><p className="font-mono">412ms</p><p>cubic-bezier(.3,.7,.5,.1)</p></div>
                <div className="rounded-lg border border-border bg-background p-2"><p className="font-mono">1200ms</p><p>ease-elastic</p></div>
              </div>
            ),
            caption: "Don't free-style durations and curves. 87ms state + 1.2s modal slide = rhythm breakdown.",
          }}
        />
      </section>

      <section className="space-y-4">
        <header><h2 className="text-2xl font-semibold tracking-tight">Respect prefers-reduced-motion</h2><p className="text-sm text-muted-foreground max-w-2xl mt-1">Honor the OS-level reduce-motion preference. Don't ship long animations as the only path.</p></header>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-lg border border-border bg-background p-3 space-y-1 text-xs font-mono">
                <p>{`@media (prefers-reduced-motion: reduce) {`}</p>
                <p className="pl-3 text-muted-foreground">transition-duration: 0.01ms;</p>
                <p>{`}`}</p>
              </div>
            ),
            caption: "Motion respects user OS settings. Vestibular-sensitive users get an accessible experience automatically.",
          }}
          dont={{
            preview: (
              <div className="rounded-lg border border-border bg-background p-3 text-xs"><p className="font-mono">animation: slide-in 600ms cubic-bezier(.34,1.56,.64,1) infinite;</p><p className="text-muted-foreground mt-1">(ignores reduce-motion)</p></div>
            ),
            caption: "Don't ship animation that ignores user preferences. Users with vestibular sensitivity disable Dash because the toast nauseates.",
          }}
        />
      </section>
        </article>
  )
}
