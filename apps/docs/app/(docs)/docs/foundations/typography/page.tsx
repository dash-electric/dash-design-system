import { cn } from "@/registry/dash/lib/utils"
import { DocsDoDont } from "@/components/docs/page-shell"

type TypeStyle = {
  name: string
  size: number
  lineHeight: number
  weight: 400 | 500
  letterSpacing: number
  className: string
  example: string
}

const titleStyles: TypeStyle[] = [
  { name: "Title H1", size: 56, lineHeight: 64, weight: 500, letterSpacing: -1, className: "text-[56px] leading-[64px] font-medium tracking-[-0.018em]", example: "The quick brown fox jumps over the lazy dog." },
  { name: "Title H2", size: 48, lineHeight: 56, weight: 500, letterSpacing: -1, className: "text-[48px] leading-[56px] font-medium tracking-[-0.021em]", example: "The quick brown fox jumps over the lazy dog." },
  { name: "Title H3", size: 40, lineHeight: 48, weight: 500, letterSpacing: -1, className: "text-[40px] leading-[48px] font-medium tracking-[-0.025em]", example: "The quick brown fox jumps over the lazy dog." },
  { name: "Title H4", size: 32, lineHeight: 40, weight: 500, letterSpacing: -0.5, className: "text-[32px] leading-[40px] font-medium tracking-[-0.016em]", example: "The quick brown fox jumps over the lazy dog." },
  { name: "Title H5", size: 24, lineHeight: 32, weight: 500, letterSpacing: 0, className: "text-[24px] leading-[32px] font-medium", example: "The quick brown fox jumps over the lazy dog." },
  { name: "Title H6", size: 20, lineHeight: 28, weight: 500, letterSpacing: 0, className: "text-[20px] leading-[28px] font-medium", example: "The quick brown fox jumps over the lazy dog." },
]

const labelStyles: TypeStyle[] = [
  { name: "Label X Large", size: 24, lineHeight: 32, weight: 500, letterSpacing: -1.5, className: "text-[24px] leading-[32px] font-medium tracking-[-0.0625em]", example: "Manage shipment" },
  { name: "Label Large", size: 18, lineHeight: 24, weight: 500, letterSpacing: -1.5, className: "text-[18px] leading-[24px] font-medium tracking-[-0.083em]", example: "Manage shipment" },
  { name: "Label Medium", size: 16, lineHeight: 24, weight: 500, letterSpacing: -1.1, className: "text-[16px] leading-[24px] font-medium tracking-[-0.069em]", example: "Manage shipment" },
  { name: "Label Small", size: 14, lineHeight: 20, weight: 500, letterSpacing: -0.6, className: "text-[14px] leading-[20px] font-medium tracking-[-0.043em]", example: "Manage shipment" },
  { name: "Label X Small", size: 12, lineHeight: 16, weight: 500, letterSpacing: 0, className: "text-[12px] leading-[16px] font-medium", example: "Manage shipment" },
]

const paragraphStyles: TypeStyle[] = [
  { name: "Paragraph X Large", size: 24, lineHeight: 32, weight: 400, letterSpacing: -1.5, className: "text-[24px] leading-[32px] font-normal tracking-[-0.0625em]", example: "Dash routes a thousand drivers a day across Jakarta." },
  { name: "Paragraph Large", size: 18, lineHeight: 24, weight: 400, letterSpacing: -1.5, className: "text-[18px] leading-[24px] font-normal tracking-[-0.083em]", example: "Dash routes a thousand drivers a day across Jakarta." },
  { name: "Paragraph Medium", size: 16, lineHeight: 24, weight: 400, letterSpacing: -1.1, className: "text-[16px] leading-[24px] font-normal tracking-[-0.069em]", example: "Dash routes a thousand drivers a day across Jakarta." },
  { name: "Paragraph Small", size: 14, lineHeight: 20, weight: 400, letterSpacing: -0.6, className: "text-[14px] leading-[20px] font-normal tracking-[-0.043em]", example: "Dash routes a thousand drivers a day across Jakarta." },
  { name: "Paragraph X Small", size: 12, lineHeight: 16, weight: 400, letterSpacing: 0, className: "text-[12px] leading-[16px] font-normal", example: "Dash routes a thousand drivers a day across Jakarta." },
]

const subheadingStyles: TypeStyle[] = [
  { name: "Subheading Medium", size: 16, lineHeight: 24, weight: 500, letterSpacing: 6, className: "text-[16px] leading-[24px] font-medium uppercase tracking-[0.375em]", example: "MITRA STATUS" },
  { name: "Subheading Small", size: 14, lineHeight: 20, weight: 500, letterSpacing: 6, className: "text-[14px] leading-[20px] font-medium uppercase tracking-[0.43em]", example: "MITRA STATUS" },
  { name: "Subheading X Small", size: 12, lineHeight: 16, weight: 500, letterSpacing: 4, className: "text-[12px] leading-[16px] font-medium uppercase tracking-[0.33em]", example: "MITRA STATUS" },
  { name: "Subheading 2X Small", size: 11, lineHeight: 12, weight: 500, letterSpacing: 2, className: "text-[11px] leading-[12px] font-medium uppercase tracking-[0.18em]", example: "MITRA STATUS" },
]

function StyleRow({ style }: { style: TypeStyle }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_220px] items-center gap-4 px-5 py-5">
      <div>
        <div className="text-sm font-medium text-foreground">{style.name}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          weight {style.weight}
        </div>
      </div>
      <div className={cn("truncate", style.className)}>{style.example}</div>
      <div className="text-[10px] text-muted-foreground md:text-right">
        {style.size}/{style.lineHeight} · ls {style.letterSpacing}
      </div>
    </div>
  )
}

function ScaleSection({ title, blurb, styles }: { title: string; blurb: string; styles: TypeStyle[] }) {
  return (
    <section>
      <div className="mb-3">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{blurb}</p>
      </div>
      <div className="rounded-lg border border-border divide-y divide-border bg-card">
        {styles.map((s) => (
          <StyleRow key={s.name} style={s} />
        ))}
      </div>
    </section>
  )
}

export default function TypographyPage() {
  return (
    <article className="mx-auto max-w-5xl px-6 lg:px-10 py-12 space-y-14">
      <header>
        <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">
          Foundations
        </div>
        <h1 className="text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] mb-4">
          Typography
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Plus Jakarta Sans across the entire system. The scale lives in four
          tracks — Title, Label, Paragraph, Subheading — giving every screen a
          predictable rhythm without needing custom values.
        </p>
      </header>

      {/* Hero showcase */}
      <section
        className="rounded-2xl border border-border p-10 lg:p-16"
        style={{
          background: "linear-gradient(135deg, var(--dash-blue-50), var(--dash-purple-50))",
        }}
      >
        <div className="dark:hidden">
          <div className="text-[160px] leading-none font-semibold tracking-tighter text-foreground/90 select-none">
            Aa
          </div>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-2 text-sm text-foreground/70">
            <span><span className="font-medium text-foreground">Plus Jakarta Sans</span></span>
            <span>4 weights · 400, 500, 600, 700</span>
            <span>20 type styles</span>
            <span>Latin subset</span>
          </div>
        </div>
        <div className="hidden dark:block">
          <div
            className="text-[160px] leading-none font-semibold tracking-tighter select-none bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, var(--dash-blue-300), var(--dash-purple-300))",
            }}
          >
            Aa
          </div>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-2 text-sm text-foreground/80">
            <span><span className="font-medium text-foreground">Plus Jakarta Sans</span></span>
            <span>4 weights · 400, 500, 600, 700</span>
            <span>20 type styles</span>
            <span>Latin subset</span>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          {
            title: "Predictable hierarchy",
            body: "Six Title sizes, five Label sizes, five Paragraph sizes, four Subheadings. Pick by role, not by pixel guess.",
          },
          {
            title: "Tuned for screens",
            body: "Optical letter-spacing for every size. Tight on display sizes, neutral at body, looser on caps Subheadings.",
          },
          {
            title: "One face, full system",
            body: "Plus Jakarta Sans is the sole Dash typeface — brand, product UI, dashboards, code, kbd, and tokens all share it.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-1.5">{item.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      {/* Font stacks */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Font stack</h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground mb-1">--font-sans</div>
          <div className="text-2xl font-medium mb-1">Plus Jakarta Sans</div>
          <div className="text-sm text-muted-foreground">
            Sole typeface across Dash — brand, product UI, dashboards, code, labels.
          </div>
        </div>
      </section>

      {/* Scales */}
      <ScaleSection
        title="Title"
        blurb="Display and section headings. Use H1 once per page; H2–H6 step down by structural depth."
        styles={titleStyles}
      />
      <ScaleSection
        title="Label"
        blurb="Buttons, badges, form labels, table headers — anywhere you need a confident, short string."
        styles={labelStyles}
      />
      <ScaleSection
        title="Paragraph"
        blurb="Body copy. Default to Paragraph Medium with `text-foreground`; pair with `text-muted-foreground` for secondary lines."
        styles={paragraphStyles}
      />
      <ScaleSection
        title="Subheading"
        blurb="All-caps eyebrow labels for sections, table column groups, and stat callouts. Letter-spacing is intentional."
        styles={subheadingStyles}
      />

      {/* Usage rules */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Usage rules</h2>
        <ul className="space-y-3 text-base text-foreground/90">
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Pick the closest semantic role first. Reach for a custom size only if no preset works — and then escalate it back into the system.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>One H1 per page. Hero or page title only. Section headings inside a page start at H2.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Use Label styles for buttons, badges, form labels — never a Title class. Buttons default to Label Small or Label Medium.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Default body is Paragraph Medium with <code className="text-xs px-1 py-0.5 rounded bg-muted">text-foreground</code>. Switch to <code className="text-xs px-1 py-0.5 rounded bg-muted">text-muted-foreground</code> for secondary text in the same paragraph.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Mono-spaced text (code, kbd, tokens) only — never for body copy or labels.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Keep line length under ~70ch for Paragraph Medium and below. Wrap container with <code className="text-xs px-1 py-0.5 rounded bg-muted">max-w-3xl</code> for default reading widths.</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Source</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tokens extracted from the Typography page of the Dash-licensed source design Figma file
          via Figma MCP <code className="text-xs px-1 py-0.5 rounded bg-muted">get_variable_defs</code>{" "}
          on 2026-05-07. Mirrored in <code className="text-xs px-1 py-0.5 rounded bg-muted">app/globals.css</code>{" "}
          and shipped as part of the <code className="text-xs px-1 py-0.5 rounded bg-muted">@dash/base-theme</code>{" "}
          registry item.
        </p>
      </section>
      <section className="space-y-4">
        <header><h2 className="text-2xl font-semibold tracking-tight">Type scale for hierarchy</h2><p className="text-sm text-muted-foreground max-w-2xl mt-1">Use named scale tokens for hierarchy. Don't reach for arbitrary sizes to make a label feel important.</p></header>
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-2">
                <p className="text-xl font-semibold">Live dispatch</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mitra aktif</p>
                <p className="text-sm">Snapshot dispatch hari ini · 16:30 WIB</p>
              </div>
            ),
            caption: "Page title at title-h4, column label at label-small caps, body at paragraph-small. Hierarchy is unmistakable.",
          }}
          dont={{
            preview: (
              <div className="space-y-2">
                <p className="text-2xl">Live dispatch</p>
                <p className="text-2xl">Mitra aktif</p>
                <p className="text-2xl">Snapshot dispatch hari ini</p>
              </div>
            ),
            caption: "Don't render every text node at the same large size. Hierarchy collapses, reader scans for nothing.",
          }}
        />
      </section>

      <section className="space-y-4">
        <header><h2 className="text-2xl font-semibold tracking-tight">Plus Jakarta Sans default</h2><p className="text-sm text-muted-foreground max-w-2xl mt-1">Dash standardizes on Plus Jakarta Sans across every surface. Don't let body text fall back to OS default.</p></header>
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-1 font-sans">
                <p className="text-base font-semibold">Plus Jakarta Sans · 16/600</p>
                <p className="text-sm">Distinct 'a' bowl, proper x-height, ligatures intact.</p>
              </div>
            ),
            caption: "Plus Jakarta Sans loaded from Google Fonts. Same brand identity across Dash Express, Halo-dash, portal partners.",
          }}
          dont={{
            preview: (
              <div className="space-y-1" style={{fontFamily: "ui-system, system-ui, sans-serif"}}>
                <p className="text-base font-semibold">System default</p>
                <p className="text-sm">macOS = SF Pro, Windows = Segoe, Android = Roboto. Brand consistency = none.</p>
              </div>
            ),
            caption: "Don't ship system fallback as body. Each OS renders Dash with a different brand voice.",
          }}
        />
      </section>
        </article>
  )
}
