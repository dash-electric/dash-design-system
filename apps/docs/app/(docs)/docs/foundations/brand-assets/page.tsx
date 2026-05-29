"use client"

import * as React from "react"
import { RiSearchLine as Search, RiCheckLine as Check } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Badge } from "@/registry/dash/ui/badge"
import { BrandLogo } from "@/registry/dash/ui/brand-logo"
import { cn } from "@/registry/dash/lib/utils"
import brandManifest from "@/public/brand/manifest.json"

/**
 * Brand Assets — live catalog backed by the real `<BrandLogo>` registry
 * component + the vendored asset manifest at `public/brand/manifest.json`.
 *
 * Logos are full-COLOR static SVGs served from `public/brand/<slug>[-<variant>].svg`
 * (vendored by `scripts/vendor-brand-flags.mjs`). They are NOT `currentColor`-tintable —
 * unlike `<Icon>`. ~28 brands ship multi-variant (black / original / white) for
 * light/dark surfaces; the rest expose a single `default` mark.
 */

type ManifestBrand = {
  slug: string
  variants: string[]
  aliases: string[]
}

const BRANDS: ManifestBrand[] = brandManifest.brands

// Brands that ship the black / original / white triad (variants.length > 1).
const MULTI_VARIANT = BRANDS.filter((b) => b.variants.length > 1)

// Pick a real multi-variant brand for the variant demo (github ships all 4).
const VARIANT_DEMO =
  MULTI_VARIANT.find((b) => b.slug === "github") ?? MULTI_VARIANT[0]

const VARIANT_ORDER = ["black", "original", "white"] as const

export default function BrandAssetsPage() {
  const [query, setQuery] = React.useState("")
  const [copied, setCopied] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return BRANDS
    return BRANDS.filter(
      (b) =>
        b.slug.includes(q) || b.aliases.some((a) => a.toLowerCase().includes(q)),
    )
  }, [query])

  const copy = React.useCallback((slug: string) => {
    const snippet = `<BrandLogo name="${slug}" />`
    void navigator.clipboard?.writeText(snippet)
    setCopied(slug)
    window.setTimeout(() => setCopied((c) => (c === slug ? null : c)), 1200)
  }, [])

  return (
    <DocsPageShell>
      <DocsHeader
        category="Foundations"
        title="Brand Assets"
        description={`Brand logo library — ${brandManifest.count} third-party brand marks served as full-color static SVGs. Use for: integration cards, payment-method selectors, login providers, social-share buttons, app-store listings. Render with the sovereign <BrandLogo name="slug" /> component.`}
      />

      <DocsSection title="Library overview">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          {brandManifest.count} brand marks ({brandManifest.fileCount} SVG files,
          including variants) vendored under{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">public/brand/</code>.
          Each renders via{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;BrandLogo name=&quot;…&quot; /&gt;</code>{" "}
          as a full-color SVG (brand hex preserved) — so unlike{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;Icon&gt;</code>{" "}
          these are NOT <code className="text-xs">currentColor</code>-tintable.{" "}
          {MULTI_VARIANT.length} brands ship the black / original / white triad for
          light and dark surfaces.
        </p>
        <div className="flex flex-wrap gap-4 max-w-3xl">
          {[
            { label: "Total brands", value: brandManifest.count },
            { label: "SVG files", value: brandManifest.fileCount },
            { label: "Multi-variant", value: MULTI_VARIANT.length },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-stroke-soft-200 px-4 py-3 bg-bg-white-0"
            >
              <div className="text-xl font-semibold tabular-nums text-text-strong-950">
                {s.value}
              </div>
              <div className="text-xs text-text-soft-400">{s.label}</div>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          {MULTI_VARIANT.length} brands ship surface variants —{" "}
          <strong>black</strong> (mono-dark, place on light surfaces),{" "}
          <strong>original</strong> (full brand colors), and{" "}
          <strong>white</strong> (mono-light, place on dark surfaces). Pass the
          variant via the{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">variant</code>{" "}
          prop. Brands without a triad render their single{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">default</code>{" "}
          mark.
        </p>
        <DocsExample
          title={`${VARIANT_DEMO.slug} — black / original / white`}
          preview={
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {VARIANT_ORDER.map((v) => (
                <div key={v} className="space-y-2 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-text-soft-400">
                    {v}
                  </div>
                  <div
                    className={cn(
                      "flex justify-center rounded-lg border border-stroke-soft-200 py-4",
                      v === "white" ? "bg-bg-strong-950" : "bg-bg-white-0",
                    )}
                  >
                    <BrandLogo name={VARIANT_DEMO.slug} variant={v} size={40} />
                  </div>
                </div>
              ))}
            </div>
          }
          code={`<BrandLogo name="${VARIANT_DEMO.slug}" variant="black" size={40} />
<BrandLogo name="${VARIANT_DEMO.slug}" variant="original" size={40} />
<BrandLogo name="${VARIANT_DEMO.slug}" variant="white" size={40} /> {/* on dark surface */}`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Square render size in px via the{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">size</code>{" "}
          prop (default 24). The component renders an{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;img&gt;</code>{" "}
          with matching width/height, lazy-loaded.
        </p>
        <DocsExample
          title="16 / 24 / 32 / 40 / 48"
          preview={
            <div className="flex items-end gap-4">
              {[16, 24, 32, 40, 48].map((s) => (
                <div key={s} className="space-y-1 text-center">
                  <BrandLogo name={VARIANT_DEMO.slug} size={s} />
                  <div className="text-[10px] text-text-soft-400">{s}</div>
                </div>
              ))}
            </div>
          }
          code={`<BrandLogo name="${VARIANT_DEMO.slug}" size={16} />
<BrandLogo name="${VARIANT_DEMO.slug}" /> {/* 24, default */}
<BrandLogo name="${VARIANT_DEMO.slug}" size={48} />`}
        />
      </DocsSection>

      <DocsSection title="Catalog">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Live, searchable grid of all {brandManifest.count} brands from the
          manifest. Search by slug or alias, then click any logo to copy its{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;BrandLogo /&gt;</code>{" "}
          snippet.
        </p>
        <div className="max-w-md mb-3">
          <InputRoot>
            <InputIcon>
              <Search className="size-4" />
            </InputIcon>
            <Input
              placeholder="Search brands…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-text-soft-400 hover:text-text-sub-600"
              >
                Clear
              </button>
            ) : null}
          </InputRoot>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium text-text-strong-950 inline-flex items-center gap-2">
            All brands
            <Badge size="sm" appearance="lighter" status="information">
              {filtered.length}
            </Badge>
          </h3>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-stroke-soft-200 p-8 text-center text-sm text-text-sub-600">
            No brands match &quot;{query}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
            {filtered.map((b) => (
              <button
                key={b.slug}
                type="button"
                onClick={() => copy(b.slug)}
                className="group flex flex-col items-center gap-1 p-2 rounded-md hover:bg-bg-weak-50 transition-colors"
                title={`Copy <BrandLogo name="${b.slug}" />`}
              >
                <BrandLogo name={b.slug} size={28} />
                <div className="text-[10px] text-text-soft-400 truncate w-full text-center inline-flex items-center justify-center gap-0.5">
                  {copied === b.slug ? (
                    <>
                      <Check className="size-3 text-success-base" />
                      Copied
                    </>
                  ) : (
                    b.slug
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { BrandLogo } from "@/registry/dash/ui/brand-logo"

// Integration card
<div className="flex items-center gap-3">
  <BrandLogo name="figma" size={32} />
  <div>
    <div className="text-sm font-medium">Figma</div>
    <div className="text-xs text-text-sub-600">Design + prototyping</div>
  </div>
</div>

// Payment-method selector
<RadioGroup>
  {["visa", "mastercard", "amex", "paypal"].map((m) => (
    <RadioGroupItem value={m} key={m}>
      <BrandLogo name={m} size={20} />
    </RadioGroupItem>
  ))}
</RadioGroup>

// Social login (mono mark on a stroke button)
<Button style="stroke" tone="neutral">
  <BrandLogo name="google" size={20} />
  Continue with Google
</Button>`}
        />
      </DocsSection>

      <DocsSection title="Legal & licensing">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>
            • <strong>Trademark ownership</strong> — every brand mark in this
            library is property of its respective owner. Dash does not claim
            ownership.
          </li>
          <li>
            • <strong>Permitted use</strong> — referencing brands in context
            (integration directories, payment-method selectors, social-share
            buttons). Always indicate the relationship.
          </li>
          <li>
            • <strong>Prohibited use</strong> — endorsement implication,
            modifying logos, using brand marks as primary marketing for
            non-affiliated products.
          </li>
          <li>
            • <strong>Per-brand guidelines</strong> — consult each brand&apos;s
            official trademark/usage policy before placing.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <div className="text-sm text-text-strong-950/90 space-y-1.5">
          <div>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">name</code>{" "}
            — Brand slug (kebab-case, e.g.{" "}
            <code className="text-xs">&quot;figma&quot;</code>). Resolves to{" "}
            <code className="text-xs">public/brand/&lt;name&gt;.svg</code>.
          </div>
          <div>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">variant</code>{" "}
            —{" "}
            <code className="text-xs">
              &quot;default&quot; | &quot;black&quot; | &quot;original&quot; |
              &quot;white&quot;
            </code>{" "}
            (default <code className="text-xs">&quot;default&quot;</code>).
            Non-default resolves to{" "}
            <code className="text-xs">&lt;name&gt;-&lt;variant&gt;.svg</code>.
          </div>
          <div>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">size</code>{" "}
            — Square render size in px (default{" "}
            <code className="text-xs">24</code>).
          </div>
          <div>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">basePath</code>{" "}
            — Public base path (default{" "}
            <code className="text-xs">&quot;/brand&quot;</code>); override only if
            assets are served elsewhere.
          </div>
          <div>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">alt</code> +
            other{" "}
            <code className="text-xs">&lt;img&gt;</code> attributes are forwarded;
            a sensible <code className="text-xs">alt</code> defaults to{" "}
            <code className="text-xs">&quot;&lt;name&gt; logo&quot;</code>.
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Lock up vs free-floating">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Dash wordmark always sits on the baseline with the dot. Don&apos;t
          tilt, distort, or color-shift the brand mark.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-4">
                <span className="text-xl font-semibold tracking-tight">
                  Dash<span className="text-primary-base">.</span>
                </span>
                <span className="text-xl font-semibold tracking-tight text-static-white bg-static-black px-3 py-1 rounded">
                  Dash<span className="text-primary-base">.</span>
                </span>
              </div>
            ),
            caption:
              "Original wordmark on white surface, inverted wordmark on black surface. Geometry untouched, dot stays brand-purple.",
          }}
          dont={{
            preview: (
              <div className="flex items-center gap-4">
                <span
                  className="text-xl font-semibold tracking-tight italic"
                  style={{ transform: "rotate(-8deg) scaleX(1.3)" }}
                >
                  Dash<span className="text-success-base">.</span>
                </span>
                <span
                  className="text-xl font-bold tracking-widest"
                  style={{
                    background: "linear-gradient(45deg,#FF6B9D,#FFA500)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  D A S H
                </span>
              </div>
            ),
            caption:
              "Don't tilt, stretch, recolor, or letter-space the wordmark. The brand mark is a fixed asset — modify the layout around it.",
          }}
        />
      </DocsSection>

      <DocsSection title="Clear-space rule">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Maintain clear space around the wordmark — minimum equal to the cap
          height. Don&apos;t crowd it against other content.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6 text-center">
                <span className="text-xl font-semibold tracking-tight">
                  Dash<span className="text-primary-base">.</span>
                </span>
              </div>
            ),
            caption:
              "Clear space = at least cap-height on every side. Reads as a stable, confident mark.",
          }}
          dont={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-1 flex items-center gap-1">
                <span className="text-sm">/</span>
                <span className="text-base font-semibold tracking-tight">
                  Dash<span className="text-primary-base">.</span>
                </span>
                <span className="text-sm">|</span>
                <span className="text-[10px]">EXPRESS</span>
              </div>
            ),
            caption:
              "Don't crowd the wordmark with slashes, dividers, or sub-brand labels. The mark loses authority.",
          }}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
