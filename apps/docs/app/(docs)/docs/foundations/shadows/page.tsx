import { DocsDoDont } from "@/components/docs/page-shell"
type ShadowToken = {
  token: string
  cssVar: string
  use: string
}

const regularShadows: ShadowToken[] = [
  {
    token: "--shadow-xs",
    cssVar: "var(--shadow-xs)",
    use: "Inputs, kbd chips, segmented controls — barely-there lift.",
  },
  {
    token: "--shadow-md",
    cssVar: "var(--shadow-md)",
    use: "Floating panels (Popover, DropdownMenu, Combobox), hover lift on cards.",
  },
]

const cardShadows: ShadowToken[] = [
  {
    token: "--shadow-card-xs",
    cssVar: "var(--shadow-card-xs)",
    use: "Resting cards on flat backgrounds. Subtle ring + inner highlight + soft drop.",
  },
  {
    token: "--shadow-card-sm",
    cssVar: "var(--shadow-card-sm)",
    use: "Active cards, kbd, toggle thumbs — slightly raised, still grounded.",
  },
  {
    token: "--shadow-card-md",
    cssVar: "var(--shadow-card-md)",
    use: "Modal sheets, command palettes, focus-trapped overlays.",
  },
  {
    token: "--shadow-card-lg",
    cssVar: "var(--shadow-card-lg)",
    use: "Full-screen dialogs over blurred page backdrop, hero showcase tiles.",
  },
]

function ShadowDemo({ shadow, label }: { shadow: ShadowToken; label?: string }) {
  return (
    <div className="space-y-3">
      <div
        className="aspect-[4/3] rounded-xl bg-card flex items-center justify-center"
        style={{ boxShadow: shadow.cssVar }}
      >
        <div className="size-16 rounded-full bg-background border border-border/40" />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <code className="text-xs text-foreground">{shadow.token}</code>
        {label ? <span className="text-[10px] text-muted-foreground">{label}</span> : null}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{shadow.use}</p>
    </div>
  )
}

export default function ShadowsPage() {
  return (
    <article className="mx-auto max-w-5xl px-6 lg:px-10 py-12 space-y-14">
      <header>
        <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">
          Foundations
        </div>
        <h1 className="text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] mb-4">
          Shadows
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Two scales — Regular for utility surfaces, Card for elevated content.
          Each card-tier stacks multiple drop shadows with a subtle inner highlight,
          giving Dash surfaces the same physical depth across screens.
        </p>
      </header>

      {/* Hero */}
      <section
        className="rounded-2xl border border-border p-10"
        style={{
          background: "linear-gradient(135deg, var(--dash-blue-50), var(--dash-purple-50))",
        }}
      >
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="aspect-square bg-background rounded-2xl flex items-center justify-center" style={{ boxShadow: "var(--shadow-card-md)" }}>
            <div className="text-center">
              <div className="size-20 rounded-full bg-(--dash-blue-500) mx-auto mb-3" style={{ boxShadow: "var(--shadow-card-sm)" }} />
              <code className="text-xs text-muted-foreground">--shadow-card-md</code>
            </div>
          </div>
          <div className="aspect-square bg-background rounded-2xl flex items-center justify-center" style={{ boxShadow: "var(--shadow-card-lg)" }}>
            <div className="text-center">
              <div className="size-20 rounded-full bg-(--dash-purple-500) mx-auto mb-3" style={{ boxShadow: "var(--shadow-card-sm)" }} />
              <code className="text-xs text-muted-foreground">--shadow-card-lg</code>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          {
            title: "Two scales",
            body: "Regular shadows for inputs and floaters. Card shadows for elevated surfaces. Don't mix.",
          },
          {
            title: "Layered depth",
            body: "Card shadows stack 5–9 drop shadows plus an inner highlight. Looks closer to physical material than a single soft blur.",
          },
          {
            title: "Token-only",
            body: "Reach for `--shadow-*` always. Custom box-shadow values get rejected at review.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm font-semibold text-foreground mb-1.5">{item.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      {/* Regular */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Regular shadows</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Single-layer drop shadows. Use these for utility floats — Popover, Tooltip, DropdownMenu, kbd, Input rest state.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {regularShadows.map((s) => (
            <ShadowDemo key={s.token} shadow={s} />
          ))}
        </div>
      </section>

      {/* Card */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Card shadows</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Layered. Use these on elevated content surfaces — Card, Sheet, Drawer, Dialog, Modal,
          and any surface that should feel like a physical object on the canvas.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardShadows.map((s, i) => (
            <ShadowDemo key={s.token} shadow={s} label={["xs", "sm", "md", "lg"][i]} />
          ))}
        </div>
      </section>

      {/* Pairing */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Pairing with components</h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {[
            { component: "Input (rest)", shadow: "--shadow-xs" },
            { component: "Input (focus)", shadow: "ring + --shadow-xs" },
            { component: "DropdownMenu / Popover", shadow: "--shadow-md" },
            { component: "Card (resting)", shadow: "--shadow-card-xs" },
            { component: "Card (hover/active)", shadow: "--shadow-card-sm" },
            { component: "Sheet / Drawer", shadow: "--shadow-card-md" },
            { component: "Dialog / Modal", shadow: "--shadow-card-lg" },
            { component: "Hero showcase tile", shadow: "--shadow-card-lg" },
          ].map((row) => (
            <div key={row.component} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-4 px-6 py-3.5">
              <div className="text-sm text-foreground">{row.component}</div>
              <code className="text-xs text-muted-foreground">{row.shadow}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Usage</h2>
        <div className="rounded-lg bg-(--dash-slate-950) text-(--dash-slate-100) p-6 text-sm overflow-x-auto">
          <div className="text-(--dash-slate-400) mb-1"># inline style for arbitrary use</div>
          <div>{`<div style={{ boxShadow: "var(--shadow-card-md)" }} />`}</div>
          <div className="text-(--dash-slate-400) mt-3 mb-1"># Tailwind v4 arbitrary token reference</div>
          <div>{`<div className="shadow-(--shadow-card-md)" />`}</div>
        </div>
      </section>

      {/* Rules */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Rules</h2>
        <ul className="space-y-3 text-base text-foreground/90">
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Always reach for a `--shadow-*` token. Hand-rolled box-shadow strings break parity across screens.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Don't stack `--shadow-card-*` with `--shadow-md` on the same element — pick one elevation tier.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Cards step up one tier on hover/active (xs → sm), not two.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Dark mode shadows are simpler — three layers max — to keep contrast against dark backgrounds. Same token names, the theme switches the values.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Inset highlights inside `--shadow-card-*` simulate a thin top edge — required for cards to feel grounded. Don't override.</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Source</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Six shadow effects extracted from the Shadows page of the Dash-licensed
          source design Figma file via Figma MCP <code className="text-xs px-1 py-0.5 rounded bg-muted">get_variable_defs</code>{" "}
          on 2026-05-08. Custom-shadow tiers preserve the multi-layer drop + inner highlight structure;
          dark mode variants are Dash-tuned for OLED-friendly contrast.
        </p>
      </section>
      <section className="space-y-4">
        <header><h2 className="text-2xl font-semibold tracking-tight">Elevation map</h2><p className="text-sm text-muted-foreground max-w-2xl mt-1">Three shadow tokens: regular (resting card), medium (sticky header), high (popover). Don't invent bespoke shadows per surface.</p></header>
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-4 p-4">
                <div className="rounded-lg bg-background p-3 text-xs shadow-regular-md">resting card · md</div>
                <div className="rounded-lg bg-background p-3 text-xs shadow-regular-lg">sticky header · lg</div>
                <div className="rounded-lg bg-background p-3 text-xs shadow-regular-xl">popover · xl</div>
              </div>
            ),
            caption: "Three semantic tokens. Every surface elevation is consistent across pages.",
          }}
          dont={{
            preview: (
              <div className="space-y-4 p-4">
                <div className="rounded-lg bg-background p-3 text-xs" style={{boxShadow: "0 2px 4px rgba(0,0,0,0.08)"}}>card a</div>
                <div className="rounded-lg bg-background p-3 text-xs" style={{boxShadow: "0 3px 7px rgba(0,0,0,0.12)"}}>card b</div>
                <div className="rounded-lg bg-background p-3 text-xs" style={{boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}}>card c</div>
              </div>
            ),
            caption: "Don't author bespoke shadows. 12 nearly-identical elevations on one page fight each other.",
          }}
        />
      </section>

      <section className="space-y-4">
        <header><h2 className="text-2xl font-semibold tracking-tight">Hover lifts one level</h2><p className="text-sm text-muted-foreground max-w-2xl mt-1">Resting card → regular-md. Hovered card → regular-lg. Don't drop elevation on hover — feels like the card is sinking.</p></header>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex gap-3">
                <div className="rounded-lg bg-background p-3 text-xs shadow-regular-md">Resting · md</div>
                <div className="rounded-lg bg-background p-3 text-xs shadow-regular-lg">Hovered · lg</div>
              </div>
            ),
            caption: "Hover lifts the card one elevation step. Tactile cue that the surface is interactive.",
          }}
          dont={{
            preview: (
              <div className="flex gap-3">
                <div className="rounded-lg bg-background p-3 text-xs shadow-regular-xl">Resting · xl</div>
                <div className="rounded-lg bg-background p-3 text-xs shadow-regular-md">Hovered · md</div>
              </div>
            ),
            caption: "Don't drop elevation on hover. Card sinks instead of lifting — counter-intuitive haptic.",
          }}
        />
      </section>
        </article>
  )
}
