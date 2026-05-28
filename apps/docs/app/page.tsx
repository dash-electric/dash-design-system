import Link from "next/link"
import { RiPaletteLine as Palette, RiStackLine as Boxes, RiLayoutLine as LayoutTemplate, RiDashboardLine as LayoutDashboard, RiArrowRightUpLine as ArrowUpRight } from "@remixicon/react"
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5z" />
  </svg>
)

const CATEGORIES = [
  {
    title: "Foundations",
    href: "/docs/foundations/color",
    icon: Palette,
    body: "Tokens, color, typography, icons, grids, shadows, motion. The vocabulary that everything else inherits.",
  },
  {
    title: "Components",
    href: "/docs/components",
    icon: Boxes,
    body: "76 production primitives — buttons, inputs, overlays, navigation, feedback. The atoms of every Dash surface.",
  },
  {
    title: "Blocks",
    href: "/docs/blocks",
    icon: LayoutDashboard,
    body: "30+ composed sections — auth flows, tables, dashboards, settings. Drop-in patterns ready to ship.",
  },
  {
    title: "Templates",
    href: "/docs/templates",
    icon: LayoutTemplate,
    body: "11 page shells — list-detail, dashboard, settings, Halo-dash, Phase7. Real Dash surfaces, not toy demos.",
  },
]

const TOP_LINKS = [
  { label: "Foundation", href: "/docs/foundations/color" },
  { label: "Components", href: "/docs/components" },
  { label: "Blocks", href: "/docs/blocks" },
  { label: "Templates", href: "/docs/templates" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-static-black text-static-white">
      {/* ─── TOP BAR (black) ─────────────────────────────────────── */}
      <header className="border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-14 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-7 rounded-md flex items-center justify-center bg-(--dash-purple-500) text-static-white font-semibold text-sm tracking-tight"
            >
              D
            </span>
            <span className="font-semibold tracking-tight text-static-white">
              Dash
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 ml-1">
              v1.0
            </span>
          </Link>
          <nav className="flex items-center gap-0">
            {TOP_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hidden sm:inline-flex h-9 px-4 items-center text-sm text-white/60 hover:text-static-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex-1" />
          <a
            href="https://github.com/dash-ev/dash-ds"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="inline-flex size-9 items-center justify-center rounded-md text-white/60 hover:text-static-white hover:bg-white/10 transition-colors"
          >
            <GithubIcon className="size-4" />
          </a>
        </div>
      </header>

      {/* ─── HERO (full-bleed dark + geometric decor) ─────────────── */}
      <section className="relative overflow-hidden">
        {/* Decorative SVG line-art — subtle geometric circuit pattern */}
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.18]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="circuit" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <path
                d="M 0 60 L 120 60 M 60 0 L 60 120 M 0 0 L 120 120 M 120 0 L 0 120"
                fill="none"
                stroke="rgb(255 255 255 / 0.35)"
                strokeWidth="0.6"
              />
              <circle cx="60" cy="60" r="3" fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="0.6" />
              <circle cx="0" cy="0" r="3" fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="0.6" />
              <circle cx="120" cy="0" r="3" fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="0.6" />
              <circle cx="0" cy="120" r="3" fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="0.6" />
              <circle cx="120" cy="120" r="3" fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>

        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <h1 className="text-5xl lg:text-7xl font-semibold tracking-tighter leading-[0.95] text-static-white">
            Dash design system
          </h1>
          <p className="mt-4 text-sm text-white/50 uppercase tracking-widest">
            Styleguide updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          <p className="mt-8 max-w-2xl text-base lg:text-lg text-white/70 leading-relaxed">
            Dash design system defines the foundations of internal product
            interfaces across PT Dash Elektrik. It brings dispatch, mitra
            operations, Halo-dash, and Tribe-Express together under a single,
            opinionated framework — ported by the dash CLI, consumed by Claude
            Code, shipped by Product Engineers.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 h-10 px-6 rounded-md bg-(--dash-purple-500) text-static-white text-sm font-medium hover:bg-(--dash-purple-600) transition-colors"
            >
              Get started
              <ArrowUpRight className="size-3.5" strokeWidth={2} />
            </Link>
            <Link
              href="/docs/components"
              className="inline-flex items-center gap-1.5 h-10 px-6 rounded-md bg-white/10 text-static-white text-sm font-medium hover:bg-white/15 transition-colors"
            >
              Browse components
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 4 CATEGORY CARDS (on black bg) ──────────────────────── */}
      <section className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="group relative bg-static-black p-6 lg:p-8 flex flex-col gap-6 min-h-56 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex-1 flex items-start">
                    <div className="size-14 rounded-lg border border-white/15 flex items-center justify-center text-white/80 [&_svg]:size-6 group-hover:border-(--dash-purple-400) group-hover:text-(--dash-purple-300) transition-colors">
                      <Icon strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-tight text-static-white">
                        {cat.title}
                      </h3>
                      <ArrowUpRight
                        className="size-4 text-white/40 transition-all group-hover:text-static-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={1.75}
                      />
                    </div>
                    <p className="mt-2 text-sm text-white/60 leading-relaxed">
                      {cat.body}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ──────────────────────────────────────────── */}
      <section className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
          {[
            { num: "76", label: "Components" },
            { num: "30+", label: "Blocks" },
            { num: "11", label: "Templates" },
            { num: "0", label: "TS errors" },
          ].map((s) => (
            <div key={s.label} className="bg-static-black px-6 py-6 flex flex-col gap-1">
              <span className="text-3xl lg:text-4xl font-semibold tracking-tighter tabular-nums text-static-white">
                {s.num}
              </span>
              <span className="text-xs uppercase tracking-widest text-white/50">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span aria-hidden className="size-4 rounded-sm bg-(--dash-purple-500)" />
            <span>Dash Design System · Internal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs/changelog" className="hover:text-static-white transition-colors">Changelog</Link>
            <Link href="/docs/tools/cli" className="hover:text-static-white transition-colors">CLI</Link>
            <Link href="/docs/tools/ai-rules" className="hover:text-static-white transition-colors">AI Rules</Link>
            <a href="https://github.com/dash-ev/dash-ds" target="_blank" rel="noreferrer noopener" className="hover:text-static-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
