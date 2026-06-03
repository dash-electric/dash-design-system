"use client"

import * as React from "react"
import { BrandLogo } from "@/registry/dash/ui/brand-logo"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const POPULAR_BRANDS = [
  "github",
  "google",
  "apple",
  "microsoft",
  "amazon",
  "adobe",
  "figma",
  "slack",
  "notion",
  "stripe",
  "openai",
  "anthropic",
]

const MULTI_VARIANT = ["adobe", "github", "notion", "openai"] as const

export default function BrandLogoDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="shipped"
        kind="atom"
        category="Components / Branding"
        title="Brand Logo"
        description="Render any third-party brand, product, or crypto logo by slug. 333 brands vendored from the Dash asset library; ~28 ship multi-variant (black / original / white) for light/dark surfaces. Full-color static SVGs — brand hex preserved (NOT currentColor-tintable)."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add brand-logo`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          A single <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<img>`}</code> element sourced from
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950 ml-1">{`/brand/<slug>[-<variant>].svg`}</code>.
          The asset is full-color and square — pass <code className="text-xs">size</code> to control pixel dimensions.
        </p>
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-10 flex items-center justify-center gap-12">
          <div className="flex flex-col items-center gap-3">
            <BrandLogo name="github" size={48} />
            <span className="text-[11px] uppercase tracking-widest text-text-soft-400">name only</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <BrandLogo name="adobe" variant="black" size={48} />
            <span className="text-[11px] uppercase tracking-widest text-text-soft-400">name + variant</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <BrandLogo name="figma" size={72} />
            <span className="text-[11px] uppercase tracking-widest text-text-soft-400">name + size</span>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Popular brands at default size (24)"
          description="Drop one anywhere you need a recognizable third-party mark — login providers, partner footers, integration cards."
          preview={
            <div className="flex flex-wrap items-center gap-4">
              {POPULAR_BRANDS.map((slug) => (
                <div key={slug} className="flex flex-col items-center gap-1.5">
                  <BrandLogo name={slug} />
                  <span className="text-[10px] text-text-soft-400">{slug}</span>
                </div>
              ))}
            </div>
          }
          code={`<BrandLogo name="github" />
<BrandLogo name="google" />
<BrandLogo name="figma" />`}
        />

        <DocsExample
          title="Sizes — 16 / 24 / 32 / 48 / 64"
          description="Square render. Pick by surrounding type scale and density."
          preview={
            <div className="flex items-end gap-4">
              {[16, 24, 32, 48, 64].map((size) => (
                <div key={size} className="flex flex-col items-center gap-1.5">
                  <BrandLogo name="figma" size={size} />
                  <span className="text-[10px] text-text-soft-400">{size}px</span>
                </div>
              ))}
            </div>
          }
          code={`<BrandLogo name="figma" size={16} />
<BrandLogo name="figma" size={24} />  // default
<BrandLogo name="figma" size={48} />`}
        />

        <DocsExample
          title="Multi-variant brands"
          description="~28 brands ship multiple color treatments. Use `original` on light surfaces, `black` for B/W print, `white` for dark hero / login splash."
          preview={
            <div className="space-y-3">
              {MULTI_VARIANT.map((slug) => (
                <div key={slug} className="flex items-center gap-3">
                  <code className="w-16 text-[10px] text-text-sub-600">{slug}</code>
                  <div className="flex items-center gap-6">
                    <BrandLogo name={slug} variant="original" size={32} />
                    <BrandLogo name={slug} variant="black" size={32} />
                    <div className="rounded-lg bg-bg-strong-950 p-2 inline-flex">
                      <BrandLogo name={slug} variant="white" size={32} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
          code={`<BrandLogo name="adobe" variant="original" />
<BrandLogo name="adobe" variant="black" />     // mono dark on light surface
<BrandLogo name="adobe" variant="white" />     // mono light on dark surface`}
        />

        <DocsExample
          title="In a login provider button"
          description="Pair with Button asChild or a stroke neutral button to mimic SSO entry rows."
          preview={
            <div className="flex flex-col gap-2 max-w-xs">
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm font-medium text-text-strong-950 hover:bg-bg-weak-50">
                <BrandLogo name="google" size={18} />
                Sign in with Google
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm font-medium text-text-strong-950 hover:bg-bg-weak-50">
                <BrandLogo name="github" size={18} />
                Continue with GitHub
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm font-medium text-text-strong-950 hover:bg-bg-weak-50">
                <BrandLogo name="apple" size={18} />
                Sign in with Apple
              </button>
            </div>
          }
          code={`<button className="...">
  <BrandLogo name="google" size={18} />
  Sign in with Google
</button>`}
        />

        <DocsExample
          title="Unknown slug falls back gracefully"
          description="If the slug isn't in the catalog the browser will 404 the asset — wrap in a try/error boundary or pre-validate against the manifest at build time."
          preview={
            <div className="flex items-center gap-4">
              <BrandLogo name="figma" />
              <BrandLogo name="not-a-real-brand" />
              <span className="text-[10px] text-text-soft-400">(right one 404s — image alt shows)</span>
            </div>
          }
          code={`// Validate against /brand/manifest.json before rendering:
const manifest = await fetch("/brand/manifest.json").then((r) => r.json())
if (!manifest.includes(name)) return <FallbackIcon />`}
        />
      </DocsSection>

      <DocsSection title="API" id="api">
        <DocsPropsTable
          rows={[
            { name: "name", type: "string", description: 'Brand slug, e.g. "github", "adobe", "bitcoin". Must match a vendored file in /brand/.' },
            { name: "variant", type: '"default" | "black" | "original" | "white"', defaultValue: '"default"', description: "Color treatment. Only ~28 brands ship variants — see /brand/manifest.json for the set." },
            { name: "size", type: "number", defaultValue: "24", description: "Square render size in pixels." },
            { name: "basePath", type: "string", defaultValue: '"/brand"', description: "Public base path. Override if assets are served from a CDN or alternate route." },
            { name: "alt", type: "string", description: "Accessible alt text. Defaults to `<name> logo`." },
            { name: "...ImgHTMLAttributes", type: "React.ImgHTMLAttributes<HTMLImageElement>", description: "All other props forward to the underlying <img> element." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-3 text-base text-text-sub-600 leading-relaxed">
          <li><strong className="text-text-strong-950">Alt text</strong> — auto-generated as <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`"<name> logo"`}</code>. Override with the <code className="text-xs">alt</code> prop when the logo is decorative or has surrounding context that already names the brand.</li>
          <li><strong className="text-text-strong-950">Decorative usage</strong> — pass <code className="text-xs">{`alt=""`}</code> to mark the image purely decorative; assistive tech will skip it.</li>
          <li><strong className="text-text-strong-950">Lazy + async</strong> — uses <code className="text-xs">loading=&quot;lazy&quot;</code> and <code className="text-xs">decoding=&quot;async&quot;</code> by default. Above-the-fold logos can override with <code className="text-xs">loading=&quot;eager&quot;</code>.</li>
          <li><strong className="text-text-strong-950">No color tint</strong> — assets are full-color SVGs, NOT <code className="text-xs">currentColor</code>. Use the <code className="text-xs">variant</code> prop to swap brand-approved color treatments instead of CSS overrides.</li>
          <li><strong className="text-text-strong-950">Trademark notice</strong> — every logo is the trademark of its respective owner. Internal Dash use only via this DS; external marketing surfaces require Brand team review.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Vendor + manifest">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Assets vendored by <code className="text-xs">scripts/vendor-brand-flags.mjs</code> from the Dash brand asset library (2026-05-19).</li>
          <li>• Catalog: <code className="text-xs">public/brand/manifest.json</code> — list of all 333 slugs + the multi-variant subset.</li>
          <li>• To add a new brand: drop the SVG into <code className="text-xs">public/brand/</code>, re-run the vendor script, regenerate <code className="text-xs">manifest.json</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
