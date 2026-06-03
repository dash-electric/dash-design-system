"use client"

import * as React from "react"
import { RiSearchLine as Search } from "@remixicon/react"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Flag } from "@/registry/dash/ui/flag"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import flagManifest from "@/public/flags/manifest.json"

/**
 * Country Flags — sovereign Dash DS asset set.
 *
 * 262 full-color circular flag SVGs vendored into `public/flags/<key>.svg`
 * (via `scripts/vendor-brand-flags.mjs`). Rendered through the real `<Flag>`
 * component (`@/registry/dash/ui/flag`) as `<img>` — crisp + identical on
 * Windows / macOS / Linux, unlike Unicode flag emoji which Windows renders as
 * a 2-letter text pair. `key` is a slugified region name; see
 * `public/flags/manifest.json` for the full key↔name set.
 */

type FlagEntry = { key: string; name: string }
const FLAGS: FlagEntry[] = (flagManifest.flags as FlagEntry[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name))

// A small, well-known subset used in the inline usage demos. Keys verified
// against the manifest at build (slugified region names).
const DEMO_KEY = "indonesia"

export default function CountryFlagsPage() {
  const [query, setQuery] = React.useState("")
  const [copied, setCopied] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FLAGS
    return FLAGS.filter(
      (f) => f.key.includes(q) || f.name.toLowerCase().includes(q),
    )
  }, [query])

  const copy = (key: string) => {
    navigator.clipboard?.writeText(`<Flag code="${key}" />`)
    setCopied(key)
    window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200)
  }

  return (
    <DocsPageShell>
      <DocsHeader
        category="Foundations"
        title="Country Flags"
        description={`${flagManifest.count} full-color region flags as static SVG assets, rendered via the <Flag> component. Crisp and consistent across all platforms. Use in phone-number country selectors, language pickers, shipping-address forms, and billing-region toggles.`}
      />

      <DocsSection title="How it works">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Each flag is a vendored SVG at{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">public/flags/&lt;key&gt;.svg</code>.
          The <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;Flag&gt;</code> component
          renders it as an <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;img&gt;</code> —
          full-color, circular-cropped, and identical on every OS. The{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">code</code> prop is a slugified
          region name (see the grid below). These are static color assets, so unlike monochrome
          icons they are <strong>not</strong> <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">currentColor</code>-tintable.
        </p>
        <DocsCode
          language="tsx"
          code={`import { Flag } from "@dash/ui"

<Flag code="${DEMO_KEY}" />
<Flag code="singapore" size={20} className="rounded-full" />`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Size in px via the <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">size</code> prop
          (default 24). The SVG is already circular — add{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">rounded-full</code> only if you
          want to hard-clip a square source.
        </p>
        <DocsExample
          title="16 / 20 / 24 / 32 / 40"
          preview={
            <div className="flex items-end gap-4">
              {[16, 20, 24, 32, 40].map((s) => (
                <div key={s} className="text-center space-y-1">
                  <Flag code={DEMO_KEY} size={s} />
                  <div className="text-[10px] text-text-soft-400">{s}px</div>
                </div>
              ))}
            </div>
          }
          code={`<Flag code="${DEMO_KEY}" size={16} />
<Flag code="${DEMO_KEY}" size={40} />`}
        />
      </DocsSection>

      <DocsSection title="Usage examples">
        <DocsExample
          title="Phone number country selector"
          preview={
            <div className="max-w-sm">
              <div className="flex items-center gap-2 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-3 h-10">
                <button className="inline-flex items-center gap-1.5 text-sm">
                  <Flag code={DEMO_KEY} size={20} />
                  <span>+62</span>
                  <span className="text-text-soft-400">▾</span>
                </button>
                <div className="w-px h-5 bg-stroke-soft-200" />
                <input className="flex-1 bg-transparent outline-none text-sm" placeholder="(811) 1234-5678" />
              </div>
            </div>
          }
          code={`<button>
  <Flag code="${DEMO_KEY}" size={20} /> +62 ▾
</button>`}
        />
        <DocsExample
          title="Language picker"
          preview={
            <ul className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 max-w-sm divide-y divide-stroke-soft-200">
              {[
                { code: "indonesia", lang: "Bahasa Indonesia" },
                { code: "united-states", lang: "English (US)" },
                { code: "japan", lang: "日本語" },
                { code: "germany", lang: "Deutsch" },
                { code: "france", lang: "Français" },
              ].map((l) => (
                <li key={l.code} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-bg-weak-50">
                  <Flag code={l.code} size={20} />
                  <span className="flex-1">{l.lang}</span>
                  <span className="text-xs text-text-soft-400">{l.code}</span>
                </li>
              ))}
            </ul>
          }
          code={`{languages.map(l => (
  <li>
    <Flag code={l.code} size={20} />
    {l.label}
  </li>
))}`}
        />
      </DocsSection>

      <DocsSection title={`All flags (${flagManifest.count})`}>
        <div className="max-w-sm">
          <InputRoot>
            <InputIcon>
              <Search className="size-4" />
            </InputIcon>
            <Input
              placeholder="Search region or key…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputRoot>
        </div>
        <p className="mt-2 text-xs text-text-soft-400">
          {filtered.length} shown · click any flag to copy its{" "}
          <code className="text-[11px] px-1 rounded bg-bg-weak-50">&lt;Flag /&gt;</code> tag.
        </p>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
          {filtered.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => copy(f.key)}
              title={`<Flag code="${f.key}" />`}
              className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-2 text-left hover:bg-bg-weak-50 transition-colors"
            >
              <Flag code={f.key} size={20} />
              <span className="flex-1 truncate text-xs text-text-sub-600">
                {copied === f.key ? "Copied!" : f.name}
              </span>
            </button>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "code", type: "string", description: "Region slug key, e.g. \"indonesia\". Matches public/flags/manifest.json." },
            { name: "size", type: "number", description: "Square render size in px. Default 24." },
            { name: "basePath", type: "string", description: "Public base path for the SVG. Default \"/flags\". Override if assets are served elsewhere (e.g. Sandpack preview)." },
            { name: "className", type: "string", description: "Extra classes (e.g. rounded-full, ring)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="SVG asset vs Unicode emoji">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Use the <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;Flag&gt;</code> SVG
          asset in production. Don&apos;t ship Unicode flag emoji — Windows renders them as a
          2-letter text pair and breaks the visual.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-3">
                <Flag code={DEMO_KEY} size={24} />
                <span className="text-xs">+62 · Indonesia</span>
              </div>
            ),
            caption: "SVG flag renders the same on Windows, macOS, and Linux. Crisp at any zoom, accessible for phone-number inputs.",
          }}
          dont={{
            preview: (
              <div className="flex items-center gap-3">
                <span className="text-base">🇮🇩</span>
                <span className="text-xs">+62 · Indonesia</span>
                <span className="text-[9px] text-text-soft-400">(Windows renders as &quot;ID&quot;)</span>
              </div>
            ),
            caption: "Don't use flag emoji in production UI. Windows users see plain text in place of flags — an instant visual break.",
          }}
        />
      </DocsSection>

      <DocsSection title="Sensitive regions policy">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Some flags carry political weight. Drive the selection from the user&apos;s verified
          account locale — don&apos;t hardcode a default or make an editorial choice for them.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1 text-xs">
                <p>Region (from your account locale):</p>
                <div className="h-9 rounded-md border border-stroke-soft-200 px-3 flex items-center gap-2">
                  <Flag code={DEMO_KEY} size={20} />
                  <span>Indonesia</span>
                </div>
              </div>
            ),
            caption: "Region comes from the user's verified account locale. No editorial override, no political assumptions.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1 text-xs">
                <p>Region (picked for you):</p>
                <div className="h-9 rounded-md border border-stroke-soft-200 px-3 flex items-center gap-2">
                  <span>🌍</span>
                  <span>(default · contact support to change)</span>
                </div>
              </div>
            ),
            caption: "Don't pre-pick a region for the user. Defaulting the wrong one in a sensitive flow erodes trust.",
          }}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
