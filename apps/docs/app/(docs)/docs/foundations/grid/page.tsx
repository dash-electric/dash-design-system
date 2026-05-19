import { cn } from "@/registry/dash/lib/utils"

const breakpoints = [
  { name: "sm", min: 640, label: "Small", target: "Phone landscape, narrow tablet" },
  { name: "md", min: 768, label: "Medium", target: "Tablet portrait, narrow laptop" },
  { name: "lg", min: 1024, label: "Large", target: "Tablet landscape, standard laptop" },
  { name: "xl", min: 1280, label: "X Large", target: "Standard desktop" },
  { name: "2xl", min: 1536, label: "2X Large", target: "Wide desktop, dashboard panes" },
] as const

const containers = [
  { name: "max-w-3xl", px: 768, use: "Reading content, article body, MDX docs" },
  { name: "max-w-5xl", px: 1024, use: "Mid-density layouts, foundation docs pages" },
  { name: "max-w-7xl", px: 1280, use: "Standard product pages, dashboard wrappers" },
  { name: "max-w-screen-2xl", px: 1536, use: "Full-width dashboards with side panels" },
] as const

const gutters = [
  { token: "gap-2", px: 8, use: "Toolbar buttons, tag chips, dense table cells" },
  { token: "gap-3", px: 12, use: "Form rows, list rows, default card stacks" },
  { token: "gap-4", px: 16, use: "Section content, card-to-card, default" },
  { token: "gap-6", px: 24, use: "Page sections, hero cards, top-level grids" },
  { token: "gap-8", px: 32, use: "Major divisions, dashboard panes" },
] as const

function LayoutDiagram({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="rounded-lg border border-border bg-card p-3">{children}</div>
    </div>
  )
}

const cellBase = "rounded-md border border-border/60"

export default function GridPage() {
  return (
    <article className="mx-auto max-w-5xl px-6 lg:px-10 py-12 space-y-14">
      <header>
        <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">
          Foundations
        </div>
        <h1 className="text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] mb-4">
          Grid System
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Dash builds layouts on Tailwind&apos;s 12-column flex/grid utilities with
          five canonical breakpoints. Most product surfaces fall into one of four
          page shells — pick the closest match and customize from there.
        </p>
      </header>

      {/* Hero — 4 page shells */}
      <section
        className="rounded-2xl border border-border p-6 lg:p-10"
        style={{
          background: "linear-gradient(135deg, var(--dash-blue-50), var(--dash-purple-50))",
        }}
      >
        <div className="grid sm:grid-cols-2 gap-6">
          <LayoutDiagram label="Sidebar — expanded">
            <div className="grid grid-cols-12 gap-1 h-32">
              <div className={cn(cellBase, "col-span-3 bg-(--dash-green-200)")} />
              <div className={cn(cellBase, "col-span-9 bg-(--dash-purple-100)")} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">240px nav · flex-1 content</div>
          </LayoutDiagram>

          <LayoutDiagram label="Sidebar — collapsed">
            <div className="grid grid-cols-12 gap-1 h-32">
              <div className={cn(cellBase, "col-span-1 bg-(--dash-green-200)")} />
              <div className={cn(cellBase, "col-span-11 bg-(--dash-purple-100)")} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">64px rail · flex-1 content</div>
          </LayoutDiagram>

          <LayoutDiagram label="Sidebar + submenu">
            <div className="grid grid-cols-12 gap-1 h-32">
              <div className={cn(cellBase, "col-span-1 bg-(--dash-green-200)")} />
              <div className={cn(cellBase, "col-span-3 bg-(--dash-blue-200)")} />
              <div className={cn(cellBase, "col-span-8 bg-(--dash-purple-100)")} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">64px rail · 240px submenu · content</div>
          </LayoutDiagram>

          <LayoutDiagram label="Topbar only">
            <div className="grid grid-rows-[auto_1fr] gap-1 h-32">
              <div className={cn(cellBase, "h-7 bg-(--dash-yellow-200)")} />
              <div className={cn(cellBase, "bg-(--dash-purple-100)")} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">56px topbar · flex-1 content</div>
          </LayoutDiagram>
        </div>
      </section>

      {/* Why */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          {
            title: "12-column predictability",
            body: "Every grid breaks into 12 cells. 6/6, 8/4, 9/3, 4/4/4 — span values that compose without negotiation.",
          },
          {
            title: "Five breakpoints",
            body: "Default Tailwind sm/md/lg/xl/2xl. No custom values. Mobile-first stacking by default, opt into multi-column at md or lg.",
          },
          {
            title: "Spacing as scale",
            body: "Gaps and paddings step on a 4px base (gap-1=4, gap-2=8, gap-3=12, gap-4=16…). No arbitrary px on layout.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-1.5">{item.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      {/* Breakpoints */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Breakpoints</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use Tailwind responsive prefixes (<code className="text-xs px-1 py-0.5 rounded bg-muted">md:grid-cols-3</code>{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">lg:px-12</code>) in this order. Custom media queries are not supported.
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {breakpoints.map((bp) => (
            <div key={bp.name} className="grid grid-cols-1 sm:grid-cols-[100px_120px_1fr] items-center gap-4 px-5 py-4">
              <code className="text-sm font-medium text-foreground">{bp.name}</code>
              <div className="text-xs text-muted-foreground">≥ {bp.min}px</div>
              <div className="text-sm text-muted-foreground">{bp.target}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Containers */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Container widths</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Always wrap top-level content in a max-width container — never let layouts run edge-to-edge except hero gradients.
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {containers.map((c) => (
            <div key={c.name} className="grid grid-cols-1 sm:grid-cols-[200px_120px_1fr] items-center gap-4 px-5 py-4">
              <code className="text-sm font-medium text-foreground">{c.name}</code>
              <div className="text-xs text-muted-foreground">{c.px}px</div>
              <div className="text-sm text-muted-foreground">{c.use}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Gutters */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Gutters & spacing</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use these gap values across grids and flex stacks. Don&apos;t mix scales within one section.
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {gutters.map((g) => (
            <div key={g.token} className="grid grid-cols-1 sm:grid-cols-[120px_80px_1fr_120px] items-center gap-4 px-5 py-4">
              <code className="text-sm font-medium text-foreground">{g.token}</code>
              <div className="text-xs text-muted-foreground">{g.px}px</div>
              <div className="text-sm text-muted-foreground">{g.use}</div>
              <div
                aria-hidden
                className={cn("flex h-4 rounded", g.token)}
              >
                <span className="flex-1 bg-(--dash-blue-200) rounded" />
                <span className="flex-1 bg-(--dash-purple-200) rounded" />
                <span className="flex-1 bg-(--dash-green-200) rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12-col demo */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">12-column visualization</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Common spans we reach for. Stick to even divisions before reaching for off-grid widths.
        </p>
        <div className="space-y-3">
          {[
            { spans: [12], label: "12 — full width" },
            { spans: [6, 6], label: "6 + 6 — split detail" },
            { spans: [8, 4], label: "8 + 4 — content + side rail" },
            { spans: [4, 4, 4], label: "4 + 4 + 4 — feature grid" },
            { spans: [3, 3, 3, 3], label: "3 × 4 — stat row" },
            { spans: [2, 8, 2], label: "2 + 8 + 2 — centered hero" },
          ].map((row) => (
            <div key={row.label} className="rounded-lg border border-border bg-card p-3">
              <div className="grid grid-cols-12 gap-1 h-10">
                {row.spans.map((span, i) => (
                  <div
                    key={i}
                    className={cn(
                      cellBase,
                      `col-span-${span}`,
                      i % 2 === 0 ? "bg-(--dash-blue-100)" : "bg-(--dash-purple-100)",
                    )}
                  />
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5">{row.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* State color tokens */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">State colors</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Five status slots beyond destructive — use these for badges, banners, status indicators, and dashboard cards.
          Each pairs a base color with a soft tint for backgrounds.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { name: "success", base: "var(--state-success)", light: "var(--state-success-light)", desc: "Healthy, online, completed" },
            { name: "information", base: "var(--state-information)", light: "var(--state-information-light)", desc: "Neutral notice, info banner" },
            { name: "away", base: "var(--state-away)", light: "var(--state-away-light)", desc: "Warning, idle, attention needed" },
            { name: "feature", base: "var(--state-feature)", light: "var(--state-feature-light)", desc: "Highlight, new capability" },
            { name: "faded", base: "var(--state-faded)", light: "var(--state-faded-light)", desc: "Muted, disabled, inactive" },
          ].map((s) => (
            <div key={s.name} className="rounded-lg border border-border bg-card overflow-hidden">
              <div
                className="h-12 flex items-center justify-center"
                style={{ background: s.light }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: s.base }}
                >
                  {s.name}
                </span>
              </div>
              <div className="h-3" style={{ background: s.base }} />
              <div className="px-3 py-2.5">
                <code className="text-[10px] text-muted-foreground block">
                  --state-{s.name}
                </code>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.desc}</p>
              </div>
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
            <span>Mobile-first: stack at base, opt into columns at <code className="text-xs px-1 py-0.5 rounded bg-muted">md</code> or <code className="text-xs px-1 py-0.5 rounded bg-muted">lg</code>.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Top-level page wrapper: <code className="text-xs px-1 py-0.5 rounded bg-muted">{`<main className="max-w-7xl mx-auto px-6 lg:px-8" />`}</code></span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Sidebar: 240px expanded, 64px collapsed. Submenu adds 240px before main.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>No arbitrary widths inside layouts (<code className="text-xs px-1 py-0.5 rounded bg-muted">w-[287px]</code>). If grid spans don&apos;t fit, redesign the row, don&apos;t hard-code.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>State colors are pairs — always render the base color on the light surface (or vice versa) for contrast.</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Source</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Page shell patterns and state color tokens extracted from the Grid System
          page of the Dash-licensed source design Figma file via Figma MCP{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">get_variable_defs</code> on 2026-05-07.
          Layout breakpoints and gutter steps follow Tailwind v4 defaults — no Dash overrides.
        </p>
      </section>
    </article>
  )
}
