"use client"

import * as React from "react"
import {
  RiDownloadLine as Download,
  RiBuilding2Line as Building,
  RiFileTextLine as FileText,
  RiBookOpenLine as Book,
  RiLinksLine as Linker,
  RiExternalLinkLine as ExternalLink,
} from "@remixicon/react"
import { DashLogo, DASH_PURPLE, DASH_BLACK } from "@/registry/dash/ui/dash-logo"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Dash Logo — Figma 1:1 (3 nodes verified 2026-05-18).
 *
 *   254:96       Master grid — Symbol + Wordmark × 3 styles (Original / Black / White)
 *   2805:578     Brand detail card schema (Dash Electric)
 *   2805:7219    Empty placeholder slot
 */

const STYLES = ["original", "black", "white"] as const

export default function DashLogoDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Foundations"
        title="Dash Logo"
        description="Official Dash Electric brand mark. 2 lockups (Symbol-only · Wordmark) × 3 surface treatments (Original purple · Black mono · White mono). Use Symbol for compact spaces (app icon, avatar, favicon). Use Wordmark in headers, footers, login splash, marketing surfaces. Never recolor outside the 3 sanctioned styles."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add dash-logo`} />
      </DocsSection>

      <DocsSection title="Brand card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Dash Electric brand reference — title, tagline, 6 variant chips (Figma node 2805:578).
        </p>
        <DocsExample
          title="Dash Electric — full brand card"
          preview={
            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 max-w-4xl">
              <div className="flex items-center gap-3 mb-5">
                <DashLogo variant="mark" style="original" size="lg" />
                <div>
                  <div className="text-base font-semibold text-text-strong-950">Dash Electric</div>
                  <div className="text-xs text-text-sub-600">Full power of fleet logistics</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {STYLES.map((s) => (
                  <VariantChip key={`mark-${s}`} variant="mark" style={s} />
                ))}
                {STYLES.map((s) => (
                  <VariantChip key={`wordmark-${s}`} variant="wordmark" style={s} />
                ))}
              </div>
            </div>
          }
          code={`<DashLogo variant="mark"     style="original" size="lg" />
<DashLogo variant="mark"     style="black"    size="lg" />
<DashLogo variant="mark"     style="white"    size="lg" />
<DashLogo variant="wordmark" style="original" size="lg" />
<DashLogo variant="wordmark" style="black"    size="lg" />
<DashLogo variant="wordmark" style="white"    size="lg" />`}
        />
      </DocsSection>

      <DocsSection title="Symbol vs Wordmark">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          <strong>Symbol</strong> = "D" mark alone (viewBox 32 × 28.8). Used when space is tight (favicons, app icon, avatar in mobile nav, login button next to provider). <strong>Wordmark</strong> = "D + DASH" lockup (viewBox 153 × 30.5). Default in marketing, footers, splash screens.
        </p>
        <DocsExample
          title="Both lockups, Original style"
          preview={
            <div className="flex items-center gap-6">
              <div className="space-y-2 text-center">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6 inline-flex items-center justify-center">
                  <DashLogo variant="mark" style="original" size="xl" />
                </div>
                <div className="text-xs text-text-soft-400">Symbol</div>
              </div>
              <div className="space-y-2 text-center">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6 inline-flex items-center justify-center">
                  <DashLogo variant="wordmark" style="original" size="xl" />
                </div>
                <div className="text-xs text-text-soft-400">Wordmark</div>
              </div>
            </div>
          }
          code={`<DashLogo variant="mark" />
<DashLogo variant="wordmark" />`}
        />
      </DocsSection>

      <DocsSection title="3 styles per lockup">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          <strong>Original</strong> — purple mark + black DASH text on light surfaces. <strong>Black</strong> — solid mono on light surfaces where color reproduction is unreliable (faxes, B/W print, single-ink). <strong>White</strong> — mono on dark surfaces (dark hero, photo overlays, dark login).
        </p>
        <DocsExample
          title="Symbol × 3 styles"
          preview={
            <div className="grid grid-cols-3 gap-3">
              <ChipBox tone="light"><DashLogo variant="mark" style="original" size="xl" /></ChipBox>
              <ChipBox tone="light"><DashLogo variant="mark" style="black" size="xl" /></ChipBox>
              <ChipBox tone="dark"><DashLogo variant="mark" style="white" size="xl" /></ChipBox>
            </div>
          }
          code={`<DashLogo variant="mark" style="original" />
<DashLogo variant="mark" style="black" />
<DashLogo variant="mark" style="white" /> // on dark surface`}
        />
        <DocsExample
          title="Wordmark × 3 styles"
          preview={
            <div className="grid grid-cols-3 gap-3">
              <ChipBox tone="light"><DashLogo variant="wordmark" style="original" size="lg" /></ChipBox>
              <ChipBox tone="light"><DashLogo variant="wordmark" style="black" size="lg" /></ChipBox>
              <ChipBox tone="dark"><DashLogo variant="wordmark" style="white" size="lg" /></ChipBox>
            </div>
          }
          code={`<DashLogo variant="wordmark" style="original" />
<DashLogo variant="wordmark" style="black" />
<DashLogo variant="wordmark" style="white" />`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          6 sizes — driven by <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">size</code> prop. Width scales proportionally per lockup viewBox aspect.
        </p>
        <DocsExample
          title="Symbol — xs / sm / md / lg / xl / 2xl"
          preview={
            <div className="flex items-end gap-4">
              {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map((s) => (
                <div key={s} className="text-center space-y-1">
                  <DashLogo variant="mark" style="original" size={s} />
                  <div className="text-[10px] text-text-soft-400">{s}</div>
                </div>
              ))}
            </div>
          }
          code={`<DashLogo size="xs" />
<DashLogo size="md" /> // default
<DashLogo size="2xl" />`}
        />
        <DocsExample
          title="Wordmark — xs / sm / md / lg / xl / 2xl"
          preview={
            <div className="flex flex-col items-start gap-4">
              {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="text-[10px] text-text-soft-400 w-8">{s}</div>
                  <DashLogo variant="wordmark" style="original" size={s} />
                </div>
              ))}
            </div>
          }
          code={`<DashLogo variant="wordmark" size="sm" />
<DashLogo variant="wordmark" size="lg" />`}
        />
      </DocsSection>

      <DocsSection title="Brand colors">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Original style uses 2 exact brand hex values. Do not approximate — these match Figma source-of-truth.
        </p>
        <DocsExample
          title="Hex swatches"
          preview={
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="rounded-xl border border-stroke-soft-200 overflow-hidden">
                <div className="h-20" style={{ background: DASH_PURPLE }} />
                <div className="p-3 text-sm">
                  <div className="font-medium">Dash Purple</div>
                  <div className="text-xs text-text-sub-600 tabular-nums">{DASH_PURPLE}</div>
                  <div className="text-xs text-text-soft-400">Symbol / Mark</div>
                </div>
              </div>
              <div className="rounded-xl border border-stroke-soft-200 overflow-hidden">
                <div className="h-20" style={{ background: DASH_BLACK }} />
                <div className="p-3 text-sm">
                  <div className="font-medium">Dash Black</div>
                  <div className="text-xs text-text-sub-600 tabular-nums">{DASH_BLACK}</div>
                  <div className="text-xs text-text-soft-400">DASH wordmark text</div>
                </div>
              </div>
            </div>
          }
          code={`Dash Purple = #5E2AAC
Dash Black  = #010101`}
        />
      </DocsSection>

      <DocsSection title="Usage examples">
        <DocsExample
          title="App header (left-aligned wordmark)"
          preview={
            <header className="flex items-center gap-4 px-4 h-14 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
              <DashLogo variant="wordmark" style="original" size="sm" />
              <div className="ml-auto flex items-center gap-2 text-xs text-text-sub-600">
                <span>Pricing</span>
                <span>Docs</span>
                <span>Blog</span>
                <Button size="xs">Sign in</Button>
              </div>
            </header>
          }
          code={`<header className="flex items-center gap-4 px-4 h-14 border-b">
  <DashLogo variant="wordmark" size="sm" />
  <Nav />
</header>`}
        />
        <DocsExample
          title="Login splash (symbol on dark)"
          preview={
            <div className="rounded-xl bg-bg-strong-950 p-8 flex flex-col items-center gap-4 text-white">
              <DashLogo variant="mark" style="white" size="2xl" />
              <div className="text-center">
                <div className="text-base font-semibold">Welcome to Dash Electric</div>
                <div className="text-xs text-white/60">Full power of fleet logistics</div>
              </div>
            </div>
          }
          code={`<div className="bg-bg-strong-950 p-8 text-white">
  <DashLogo variant="mark" style="white" size="2xl" />
  <h1>Welcome to Dash Electric</h1>
</div>`}
        />
        <DocsExample
          title="Footer (mono black wordmark)"
          preview={
            <footer className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 flex items-center justify-between">
              <DashLogo variant="wordmark" style="black" size="sm" />
              <div className="text-xs text-text-sub-600">© 2026 PT Dash Elektrik Indonesia</div>
            </footer>
          }
          code={`<footer className="bg-bg-weak-50 p-6 flex justify-between">
  <DashLogo variant="wordmark" style="black" size="sm" />
  <span>© 2026 PT Dash Elektrik Indonesia</span>
</footer>`}
        />
      </DocsSection>

      <DocsSection title="Clear space + min sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Always preserve clear space equal to half the mark height around the logo. Minimum sizes: Symbol = 16px height (favicon range), Wordmark = 60px width (avoid wordmark below this — switch to Symbol).
        </p>
        <DocsExample
          title="Minimum sizes"
          preview={
            <div className="flex items-end gap-6 p-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
              <div className="space-y-1 text-center">
                <DashLogo variant="mark" size="xs" />
                <div className="text-[10px] text-text-soft-400">Min Symbol = 16px</div>
              </div>
              <div className="space-y-1 text-center">
                <DashLogo variant="wordmark" size="xs" />
                <div className="text-[10px] text-text-soft-400">Min Wordmark = ~80px wide</div>
              </div>
            </div>
          }
          code={`<DashLogo variant="mark"     size="xs" /> // ≥ 16px
<DashLogo variant="wordmark" size="xs" /> // ≥ ~80px wide`}
        />
      </DocsSection>

      <DocsSection title="Don't">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Sanctioned styles only — Original / Black / White. Do not recolor, skew, outline, drop-shadow, or rotate.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <DontCard label="Recolor outside palette">
            <div className="h-12 w-12 flex items-center justify-center">
              <DashLogo variant="mark" size="lg" style="original" className="opacity-60" />
            </div>
            <div className="text-xs text-text-sub-600">Never apply non-brand hues to the mark.</div>
          </DontCard>
          <DontCard label="Stretch or skew">
            <div className="h-12 w-24 flex items-center justify-center transform scale-x-150">
              <DashLogo variant="mark" size="md" />
            </div>
            <div className="text-xs text-text-sub-600">Preserve viewBox aspect ratio.</div>
          </DontCard>
          <DontCard label="Add shadow / glow">
            <div className="h-12 w-12 flex items-center justify-center">
              <DashLogo variant="mark" size="lg" className="drop-shadow-[0_0_8px_red]" />
            </div>
            <div className="text-xs text-text-sub-600">No effects — keep flat.</div>
          </DontCard>
          <DontCard label="Rotate">
            <div className="h-12 w-12 flex items-center justify-center">
              <DashLogo variant="mark" size="lg" className="rotate-12" />
            </div>
            <div className="text-xs text-text-sub-600">Always upright.</div>
          </DontCard>
          <DontCard label="Place on busy photo without overlay">
            <div className="h-12 w-12 rounded-md bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-300 flex items-center justify-center">
              <DashLogo variant="mark" size="lg" style="original" />
            </div>
            <div className="text-xs text-text-sub-600">Use Black or White on busy backgrounds.</div>
          </DontCard>
          <DontCard label="Below minimum size">
            <div className="h-12 w-12 flex items-center justify-center">
              <DashLogo variant="wordmark" size="xs" className="scale-50" />
            </div>
            <div className="text-xs text-text-sub-600">Below ~80px wide, switch to Symbol.</div>
          </DontCard>
        </div>
      </DocsSection>

      <DocsSection title="Download">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Raw SVG sources (Original style). For Black / White, re-fill via the component or recolor in your editor.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild style="stroke" tone="neutral" size="sm">
            <a href="/brand/dash-symbol.svg" download>
              <Download className="size-4" /> dash-symbol.svg
            </a>
          </Button>
          <Button asChild style="stroke" tone="neutral" size="sm">
            <a href="/brand/dash-wordmark.svg" download>
              <Download className="size-4" /> dash-wordmark.svg
            </a>
          </Button>
        </div>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "variant", type: '"mark" | "wordmark"', defaultValue: '"mark"', description: 'Lockup choice. mark = symbol only · wordmark = symbol + "DASH" text.' },
            { name: "style", type: '"original" | "black" | "white"', defaultValue: '"original"', description: "Surface treatment. original = purple+black · black = mono dark · white = mono light." },
            { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl"', defaultValue: '"md"', description: "16 / 20 / 28 / 36 / 48 / 64 px height. Width scales per lockup aspect." },
            { name: "title", type: "string", description: "Override accessible name. Defaults to \"Dash\" / \"Dash mark\"." },
            { name: "...SVGAttributes", type: "React.SVGAttributes<SVGSVGElement>", description: "Spread to underlying <svg>. Use className for layout tweaks." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>DashLogo</strong> — single <code className="text-xs">{`<svg>`}</code> root with inline path data. ForwardRef.</li>
          <li>• <strong>Mark path</strong> — single path on viewBox 32 × 28.8093 — colored by <code className="text-xs">style</code> prop.</li>
          <li>• <strong>Wordmark</strong> — 2 paths on viewBox 153.178 × 30.4762 (D mark + DASH text). Style flips both fills.</li>
          <li>• <strong>Accessible name</strong> — auto <code className="text-xs">role=&quot;img&quot;</code> + <code className="text-xs">aria-label</code> + nested <code className="text-xs">{`<title>`}</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Legal">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Trademark of <strong>PT Dash Elektrik Indonesia</strong>. Internal team use only via this DS.</li>
          <li>• External use (partner co-branding, press kit, third-party site) requires written approval from Brand team.</li>
          <li>• Do not modify or recreate the marks. Always import from <code className="text-xs">@/registry/dash/ui/dash-logo</code> or download the official SVG.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function VariantChip({
  variant,
  style,
}: {
  variant: "mark" | "wordmark"
  style: "original" | "black" | "white"
}) {
  const dark = style === "white"
  return (
    <div className="space-y-2 text-center">
      <div
        className={cn(
          "flex h-20 items-center justify-center rounded-xl px-3",
          dark ? "bg-bg-strong-950" : "bg-bg-white-0 border border-stroke-soft-200",
        )}
      >
        <DashLogo variant={variant} style={style} size="lg" />
      </div>
      <div className="text-[10px] text-text-soft-400 capitalize">{style}</div>
    </div>
  )
}

function ChipBox({ tone, children }: { tone: "light" | "dark"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex h-28 items-center justify-center rounded-xl px-4",
        tone === "dark" ? "bg-bg-strong-950" : "bg-bg-white-0 border border-stroke-soft-200",
      )}
    >
      {children}
    </div>
  )
}

function DontCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-error-base/30 bg-error-lighter/50 p-3 space-y-2">
      <div className="text-xs font-medium text-error-darker">✗ {label}</div>
      {children}
    </div>
  )
}
