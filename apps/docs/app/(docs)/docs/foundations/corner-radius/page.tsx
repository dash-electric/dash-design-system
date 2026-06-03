import { cn } from "@/registry/dash/lib/utils"
import { DocsDoDont } from "@/components/docs/page-shell"

const radiusScale = [
  { token: "--radius-2", px: 2, rem: "0.125rem", use: "Hairline accents on dense controls. Rare." },
  { token: "--radius-4", px: 4, rem: "0.25rem", use: "Tag chips, badges, kbd outlines, dense table cells." },
  { token: "--radius-8", px: 8, rem: "0.5rem", use: "Buttons, inputs, popover triggers, list items." },
  { token: "--radius-12", px: 12, rem: "0.75rem", use: "Default — Card, Popover, DropdownMenu, Sheet edge." },
  { token: "--radius-16", px: 16, rem: "1rem", use: "Hero cards, dashboard tiles, marketing surfaces." },
  { token: "--radius-20", px: 20, rem: "1.25rem", use: "Pricing cards, large CTA blocks, gallery thumbs." },
  { token: "--radius-24", px: 24, rem: "1.5rem", use: "Page-level wrappers (max-w-3xl content cards)." },
  { token: "--radius-32", px: 32, rem: "2rem", use: "Full-width hero / showcase sections." },
] as const

const componentBindings = [
  { component: "Button", radius: "--radius-8" },
  { component: "Input / Textarea", radius: "--radius-8" },
  { component: "Tag / Badge", radius: "--radius-4" },
  { component: "Avatar", radius: "rounded-full" },
  { component: "Card (default)", radius: "--radius-12" },
  { component: "Popover / DropdownMenu", radius: "--radius-12" },
  { component: "Sheet / Drawer", radius: "--radius-16" },
  { component: "Dialog / Modal", radius: "--radius-16" },
  { component: "Hero showcase tile", radius: "--radius-24" },
  { component: "Avatar group / Pill", radius: "--radius-full" },
] as const

export default function CornerRadiusPage() {
  return (
    <article className="mx-auto max-w-5xl px-6 lg:px-10 py-12 space-y-14">
      <header>
        <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">
          Foundations
        </div>
        <h1 className="text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] mb-4">
          Corner Radius
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Eight radii on a 4px-aligned scale plus <code className="text-base px-1.5 py-0.5 rounded bg-muted">--radius-full</code>{" "}
          for pills. Bigger surfaces get bigger corners — never the other way around.
        </p>
      </header>

      {/* Hero */}
      <section
        className="rounded-2xl border border-border p-10"
        style={{
          background: "linear-gradient(135deg, var(--dash-blue-50), var(--dash-purple-50))",
        }}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {radiusScale.slice(2).map((r) => (
            <div key={r.token} className="flex flex-col items-center gap-2">
              <div
                className="aspect-square w-full bg-background"
                style={{ borderRadius: `${r.px}px`, boxShadow: "var(--shadow-card-xs)" }}
              />
              <code className="text-[10px] text-muted-foreground">{r.px}px</code>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          {
            title: "4px-aligned",
            body: "Every radius is a multiple of 4px (with 2px as the only sub-step). Stays in step with the spacing scale.",
          },
          {
            title: "Surface ⇒ size",
            body: "Buttons get 8. Cards get 12. Modals get 16. Heroes get 24+. Reaching for a smaller radius on a bigger surface looks visually wrong.",
          },
          {
            title: "Pair with shadow",
            body: "Radius and shadow tier scale together. `--radius-12` Card pairs with `--shadow-card-xs`; `--radius-24` hero pairs with `--shadow-card-lg`.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm font-semibold text-foreground mb-1.5">{item.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      {/* Scale */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Scale</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tailwind v4 derived utilities: <code className="text-xs px-1 py-0.5 rounded bg-muted">rounded-sm</code>{" "}
          (8px) <code className="text-xs px-1 py-0.5 rounded bg-muted">rounded-md</code> (10px){" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">rounded-lg</code> (12px){" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">rounded-xl</code> (16px). For exact values use{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">rounded-(--radius-N)</code>.
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {radiusScale.map((r) => (
            <div key={r.token} className="grid grid-cols-1 sm:grid-cols-[140px_80px_80px_1fr_80px] items-center gap-4 px-6 py-4">
              <code className="text-sm font-medium text-foreground">{r.token}</code>
              <div className="text-xs text-muted-foreground">{r.px}px</div>
              <div className="text-xs text-muted-foreground">{r.rem}</div>
              <div className="text-sm text-muted-foreground">{r.use}</div>
              <div
                aria-hidden
                className="size-12 bg-(--dash-blue-200) sm:justify-self-end"
                style={{ borderRadius: `${r.px}px` }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Component bindings */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Component bindings</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Default radius per component. Components ship with these baked in — override only with cause.
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {componentBindings.map((row) => (
            <div key={row.component} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-4 px-6 py-3.5">
              <div className="text-sm text-foreground">{row.component}</div>
              <code className="text-xs text-muted-foreground">{row.radius}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Rules */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Rules</h2>
        <ul className="space-y-3 text-base text-foreground/90">
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Bigger surface → bigger radius. Never put a 4px corner on a 600px hero.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Pair radius tier with shadow tier. <code className="text-xs px-1 py-0.5 rounded bg-muted">--radius-12</code> + <code className="text-xs px-1 py-0.5 rounded bg-muted">--shadow-card-xs</code>; <code className="text-xs px-1 py-0.5 rounded bg-muted">--radius-24</code> + <code className="text-xs px-1 py-0.5 rounded bg-muted">--shadow-card-lg</code>.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Nested radius — inner element radius is one tier smaller than its parent. Card (12) → inner badge (8) → inner chip (4).</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>No half-pill (e.g., 999 on a 32px tall surface = pill; on a 200px tall surface = looks broken). Use <code className="text-xs px-1 py-0.5 rounded bg-muted">--radius-full</code> only on round avatars and small chips.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Don't override component defaults to "match the brand". Brand expression lives in color and typography, not corners.</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Source</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Radius tokens (<code className="text-xs px-1 py-0.5 rounded bg-muted">radius-8</code>,{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">radius-12</code>,{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">radius-16</code>,{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">radius-24</code>,{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">radius-full</code>) extracted across
          Color, Grid System, and Shadows pages of the Dash-licensed source design Figma. Steps 2/4/20/32
          added by Dash to fill in the scale at small (chip) and large (hero) ends.
        </p>
      </section>
      <section className="space-y-4">
        <header><h2 className="text-2xl font-semibold tracking-tight">Radius scale per element type</h2><p className="text-sm text-muted-foreground max-w-2xl mt-1">8px (md) for buttons + inputs, 12px (lg) for cards, 16px (xl) for modals, 9999px for pills. Don't free-style radii per element.</p></header>
        <DocsDoDont
          do={{
            preview: (
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col items-center gap-1"><div className="size-12 rounded-lg bg-primary/20 border border-primary" /><code className="text-[9px]">rounded-lg · card</code></div>
                <div className="flex flex-col items-center gap-1"><div className="size-12 rounded-md bg-primary/20 border border-primary" /><code className="text-[9px]">rounded-md · button</code></div>
                <div className="flex flex-col items-center gap-1"><div className="size-12 rounded-xl bg-primary/20 border border-primary" /><code className="text-[9px]">rounded-xl · modal</code></div>
                <div className="flex flex-col items-center gap-1"><div className="size-12 rounded-full bg-primary/20 border border-primary" /><code className="text-[9px]">rounded-full · avatar</code></div>
              </div>
            ),
            caption: "Four named radii cover every element. Each shape maps to a fixed slot in the scale.",
          }}
          dont={{
            preview: (
              <div className="grid grid-cols-4 gap-3">
                <div className="size-12 bg-primary/20 border border-primary" style={{borderRadius: "3px"}} />
                <div className="size-12 bg-primary/20 border border-primary" style={{borderRadius: "7px"}} />
                <div className="size-12 bg-primary/20 border border-primary" style={{borderRadius: "14px"}} />
                <div className="size-12 bg-primary/20 border border-primary" style={{borderRadius: "22px"}} />
              </div>
            ),
            caption: "Don't eyeball radii. 3/7/14/22 looks like four mistakes — no rhythm, no system.",
          }}
        />
      </section>

      <section className="space-y-4">
        <header><h2 className="text-2xl font-semibold tracking-tight">Concentric nested corners</h2><p className="text-sm text-muted-foreground max-w-2xl mt-1">Outer radius = inner radius + padding. Don't put a 24px inner inside an 8px outer — corners stick out.</p></header>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-xl border border-border bg-background p-3"><div className="rounded-lg bg-muted h-12" /></div>
            ),
            caption: "Outer 16px → inner 12px. Difference equals the padding. Concentric, visually calm.",
          }}
          dont={{
            preview: (
              <div className="rounded-md border border-border bg-background p-3"><div className="rounded-2xl bg-muted h-12" /></div>
            ),
            caption: "Don't put a 24px inner inside an 8px outer. Inner pokes past the outer — looks broken.",
          }}
        />
      </section>
        </article>
  )
}
