"use client"

import * as React from "react"
import { RiSearchLine as Search } from "@remixicon/react"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Badge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Country Flags — Figma 1:1 (1 node verified 2026-05-18).
 *
 *   2806:2385   Master grid — 254 country flags (ISO 3166-1 alpha-2)
 *
 * Implementation: native Unicode regional-indicator pairs. No SVG assets
 * needed — the OS/browser renders the flag glyph from the ISO 2-letter code.
 * Falls back gracefully on platforms without flag support (Windows desktop
 * shows letter pair).
 */

type Country = { code: string; name: string; region: Region }
type Region = "Africa" | "Americas" | "Asia" | "Europe" | "Oceania"

const COUNTRIES: Country[] = [
  { code: "DZ", name: "Algeria", region: "Africa" },
  { code: "AO", name: "Angola", region: "Africa" },
  { code: "BJ", name: "Benin", region: "Africa" },
  { code: "BW", name: "Botswana", region: "Africa" },
  { code: "BF", name: "Burkina Faso", region: "Africa" },
  { code: "BI", name: "Burundi", region: "Africa" },
  { code: "CM", name: "Cameroon", region: "Africa" },
  { code: "CV", name: "Cape Verde", region: "Africa" },
  { code: "CF", name: "Central African Republic", region: "Africa" },
  { code: "TD", name: "Chad", region: "Africa" },
  { code: "KM", name: "Comoros", region: "Africa" },
  { code: "CG", name: "Congo", region: "Africa" },
  { code: "CD", name: "Congo (DRC)", region: "Africa" },
  { code: "CI", name: "Côte d'Ivoire", region: "Africa" },
  { code: "DJ", name: "Djibouti", region: "Africa" },
  { code: "EG", name: "Egypt", region: "Africa" },
  { code: "GQ", name: "Equatorial Guinea", region: "Africa" },
  { code: "ER", name: "Eritrea", region: "Africa" },
  { code: "SZ", name: "Eswatini", region: "Africa" },
  { code: "ET", name: "Ethiopia", region: "Africa" },
  { code: "GA", name: "Gabon", region: "Africa" },
  { code: "GM", name: "Gambia", region: "Africa" },
  { code: "GH", name: "Ghana", region: "Africa" },
  { code: "GN", name: "Guinea", region: "Africa" },
  { code: "GW", name: "Guinea-Bissau", region: "Africa" },
  { code: "KE", name: "Kenya", region: "Africa" },
  { code: "LS", name: "Lesotho", region: "Africa" },
  { code: "LR", name: "Liberia", region: "Africa" },
  { code: "LY", name: "Libya", region: "Africa" },
  { code: "MG", name: "Madagascar", region: "Africa" },
  { code: "MW", name: "Malawi", region: "Africa" },
  { code: "ML", name: "Mali", region: "Africa" },
  { code: "MR", name: "Mauritania", region: "Africa" },
  { code: "MU", name: "Mauritius", region: "Africa" },
  { code: "MA", name: "Morocco", region: "Africa" },
  { code: "MZ", name: "Mozambique", region: "Africa" },
  { code: "NA", name: "Namibia", region: "Africa" },
  { code: "NE", name: "Niger", region: "Africa" },
  { code: "NG", name: "Nigeria", region: "Africa" },
  { code: "RW", name: "Rwanda", region: "Africa" },
  { code: "ST", name: "São Tomé and Príncipe", region: "Africa" },
  { code: "SN", name: "Senegal", region: "Africa" },
  { code: "SC", name: "Seychelles", region: "Africa" },
  { code: "SL", name: "Sierra Leone", region: "Africa" },
  { code: "SO", name: "Somalia", region: "Africa" },
  { code: "ZA", name: "South Africa", region: "Africa" },
  { code: "SS", name: "South Sudan", region: "Africa" },
  { code: "SD", name: "Sudan", region: "Africa" },
  { code: "TZ", name: "Tanzania", region: "Africa" },
  { code: "TG", name: "Togo", region: "Africa" },
  { code: "TN", name: "Tunisia", region: "Africa" },
  { code: "UG", name: "Uganda", region: "Africa" },
  { code: "ZM", name: "Zambia", region: "Africa" },
  { code: "ZW", name: "Zimbabwe", region: "Africa" },
  { code: "AG", name: "Antigua and Barbuda", region: "Americas" },
  { code: "AR", name: "Argentina", region: "Americas" },
  { code: "BS", name: "Bahamas", region: "Americas" },
  { code: "BB", name: "Barbados", region: "Americas" },
  { code: "BZ", name: "Belize", region: "Americas" },
  { code: "BO", name: "Bolivia", region: "Americas" },
  { code: "BR", name: "Brazil", region: "Americas" },
  { code: "CA", name: "Canada", region: "Americas" },
  { code: "CL", name: "Chile", region: "Americas" },
  { code: "CO", name: "Colombia", region: "Americas" },
  { code: "CR", name: "Costa Rica", region: "Americas" },
  { code: "CU", name: "Cuba", region: "Americas" },
  { code: "DM", name: "Dominica", region: "Americas" },
  { code: "DO", name: "Dominican Republic", region: "Americas" },
  { code: "EC", name: "Ecuador", region: "Americas" },
  { code: "SV", name: "El Salvador", region: "Americas" },
  { code: "GD", name: "Grenada", region: "Americas" },
  { code: "GT", name: "Guatemala", region: "Americas" },
  { code: "GY", name: "Guyana", region: "Americas" },
  { code: "HT", name: "Haiti", region: "Americas" },
  { code: "HN", name: "Honduras", region: "Americas" },
  { code: "JM", name: "Jamaica", region: "Americas" },
  { code: "MX", name: "Mexico", region: "Americas" },
  { code: "NI", name: "Nicaragua", region: "Americas" },
  { code: "PA", name: "Panama", region: "Americas" },
  { code: "PY", name: "Paraguay", region: "Americas" },
  { code: "PE", name: "Peru", region: "Americas" },
  { code: "KN", name: "Saint Kitts and Nevis", region: "Americas" },
  { code: "LC", name: "Saint Lucia", region: "Americas" },
  { code: "VC", name: "Saint Vincent", region: "Americas" },
  { code: "SR", name: "Suriname", region: "Americas" },
  { code: "TT", name: "Trinidad and Tobago", region: "Americas" },
  { code: "US", name: "United States", region: "Americas" },
  { code: "UY", name: "Uruguay", region: "Americas" },
  { code: "VE", name: "Venezuela", region: "Americas" },
  { code: "AF", name: "Afghanistan", region: "Asia" },
  { code: "AM", name: "Armenia", region: "Asia" },
  { code: "AZ", name: "Azerbaijan", region: "Asia" },
  { code: "BH", name: "Bahrain", region: "Asia" },
  { code: "BD", name: "Bangladesh", region: "Asia" },
  { code: "BT", name: "Bhutan", region: "Asia" },
  { code: "BN", name: "Brunei", region: "Asia" },
  { code: "KH", name: "Cambodia", region: "Asia" },
  { code: "CN", name: "China", region: "Asia" },
  { code: "CY", name: "Cyprus", region: "Asia" },
  { code: "GE", name: "Georgia", region: "Asia" },
  { code: "HK", name: "Hong Kong", region: "Asia" },
  { code: "IN", name: "India", region: "Asia" },
  { code: "ID", name: "Indonesia", region: "Asia" },
  { code: "IR", name: "Iran", region: "Asia" },
  { code: "IQ", name: "Iraq", region: "Asia" },
  { code: "IL", name: "Israel", region: "Asia" },
  { code: "JP", name: "Japan", region: "Asia" },
  { code: "JO", name: "Jordan", region: "Asia" },
  { code: "KZ", name: "Kazakhstan", region: "Asia" },
  { code: "KW", name: "Kuwait", region: "Asia" },
  { code: "KG", name: "Kyrgyzstan", region: "Asia" },
  { code: "LA", name: "Laos", region: "Asia" },
  { code: "LB", name: "Lebanon", region: "Asia" },
  { code: "MO", name: "Macao", region: "Asia" },
  { code: "MY", name: "Malaysia", region: "Asia" },
  { code: "MV", name: "Maldives", region: "Asia" },
  { code: "MN", name: "Mongolia", region: "Asia" },
  { code: "MM", name: "Myanmar", region: "Asia" },
  { code: "NP", name: "Nepal", region: "Asia" },
  { code: "KP", name: "North Korea", region: "Asia" },
  { code: "OM", name: "Oman", region: "Asia" },
  { code: "PK", name: "Pakistan", region: "Asia" },
  { code: "PS", name: "Palestine", region: "Asia" },
  { code: "PH", name: "Philippines", region: "Asia" },
  { code: "QA", name: "Qatar", region: "Asia" },
  { code: "SA", name: "Saudi Arabia", region: "Asia" },
  { code: "SG", name: "Singapore", region: "Asia" },
  { code: "KR", name: "South Korea", region: "Asia" },
  { code: "LK", name: "Sri Lanka", region: "Asia" },
  { code: "SY", name: "Syria", region: "Asia" },
  { code: "TW", name: "Taiwan", region: "Asia" },
  { code: "TJ", name: "Tajikistan", region: "Asia" },
  { code: "TH", name: "Thailand", region: "Asia" },
  { code: "TL", name: "Timor-Leste", region: "Asia" },
  { code: "TR", name: "Turkey", region: "Asia" },
  { code: "TM", name: "Turkmenistan", region: "Asia" },
  { code: "AE", name: "United Arab Emirates", region: "Asia" },
  { code: "UZ", name: "Uzbekistan", region: "Asia" },
  { code: "VN", name: "Vietnam", region: "Asia" },
  { code: "YE", name: "Yemen", region: "Asia" },
  { code: "AL", name: "Albania", region: "Europe" },
  { code: "AD", name: "Andorra", region: "Europe" },
  { code: "AT", name: "Austria", region: "Europe" },
  { code: "BY", name: "Belarus", region: "Europe" },
  { code: "BE", name: "Belgium", region: "Europe" },
  { code: "BA", name: "Bosnia and Herzegovina", region: "Europe" },
  { code: "BG", name: "Bulgaria", region: "Europe" },
  { code: "HR", name: "Croatia", region: "Europe" },
  { code: "CZ", name: "Czech Republic", region: "Europe" },
  { code: "DK", name: "Denmark", region: "Europe" },
  { code: "EE", name: "Estonia", region: "Europe" },
  { code: "FI", name: "Finland", region: "Europe" },
  { code: "FR", name: "France", region: "Europe" },
  { code: "DE", name: "Germany", region: "Europe" },
  { code: "GR", name: "Greece", region: "Europe" },
  { code: "HU", name: "Hungary", region: "Europe" },
  { code: "IS", name: "Iceland", region: "Europe" },
  { code: "IE", name: "Ireland", region: "Europe" },
  { code: "IT", name: "Italy", region: "Europe" },
  { code: "XK", name: "Kosovo", region: "Europe" },
  { code: "LV", name: "Latvia", region: "Europe" },
  { code: "LI", name: "Liechtenstein", region: "Europe" },
  { code: "LT", name: "Lithuania", region: "Europe" },
  { code: "LU", name: "Luxembourg", region: "Europe" },
  { code: "MT", name: "Malta", region: "Europe" },
  { code: "MD", name: "Moldova", region: "Europe" },
  { code: "MC", name: "Monaco", region: "Europe" },
  { code: "ME", name: "Montenegro", region: "Europe" },
  { code: "NL", name: "Netherlands", region: "Europe" },
  { code: "MK", name: "North Macedonia", region: "Europe" },
  { code: "NO", name: "Norway", region: "Europe" },
  { code: "PL", name: "Poland", region: "Europe" },
  { code: "PT", name: "Portugal", region: "Europe" },
  { code: "RO", name: "Romania", region: "Europe" },
  { code: "RU", name: "Russia", region: "Europe" },
  { code: "SM", name: "San Marino", region: "Europe" },
  { code: "RS", name: "Serbia", region: "Europe" },
  { code: "SK", name: "Slovakia", region: "Europe" },
  { code: "SI", name: "Slovenia", region: "Europe" },
  { code: "ES", name: "Spain", region: "Europe" },
  { code: "SE", name: "Sweden", region: "Europe" },
  { code: "CH", name: "Switzerland", region: "Europe" },
  { code: "UA", name: "Ukraine", region: "Europe" },
  { code: "GB", name: "United Kingdom", region: "Europe" },
  { code: "VA", name: "Vatican City", region: "Europe" },
  { code: "AU", name: "Australia", region: "Oceania" },
  { code: "FJ", name: "Fiji", region: "Oceania" },
  { code: "KI", name: "Kiribati", region: "Oceania" },
  { code: "MH", name: "Marshall Islands", region: "Oceania" },
  { code: "FM", name: "Micronesia", region: "Oceania" },
  { code: "NR", name: "Nauru", region: "Oceania" },
  { code: "NZ", name: "New Zealand", region: "Oceania" },
  { code: "PW", name: "Palau", region: "Oceania" },
  { code: "PG", name: "Papua New Guinea", region: "Oceania" },
  { code: "WS", name: "Samoa", region: "Oceania" },
  { code: "SB", name: "Solomon Islands", region: "Oceania" },
  { code: "TO", name: "Tonga", region: "Oceania" },
  { code: "TV", name: "Tuvalu", region: "Oceania" },
  { code: "VU", name: "Vanuatu", region: "Oceania" },
]

const REGIONS: Region[] = ["Africa", "Americas", "Asia", "Europe", "Oceania"]

function flagFromCode(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return ""
  const A = 0x1f1e6 - "A".charCodeAt(0)
  return String.fromCodePoint(code.charCodeAt(0) + A, code.charCodeAt(1) + A)
}

export default function CountryFlagsPage() {
  const [query, setQuery] = React.useState("")
  const [region, setRegion] = React.useState<Region | "All">("All")

  const filtered = COUNTRIES.filter(
    (c) =>
      (region === "All" || c.region === region) &&
      (!query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase())),
  )

  return (
    <DocsPageShell>
      <DocsHeader
        category="Foundations"
        title="Country Flags"
        description="Native Unicode flag glyphs via ISO 3166-1 alpha-2 codes. 200+ countries. Zero SVG assets needed — OS/browser renders the flag from a 2-letter pair. Use in phone number country selectors, language pickers, shipping address forms, billing region toggles."
      />

      <DocsSection title="How it works">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Unicode regional indicator symbols pair up to form a flag. Pass an ISO 2-letter country code (e.g. <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&quot;ID&quot;</code> for Indonesia), get back the flag emoji. No image fetching. Falls back to letter-pair on platforms without flag support (Windows desktop).
        </p>
        <DocsCode
          language="tsx"
          code={`function flagFromCode(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return ""
  const A = 0x1F1E6 - "A".charCodeAt(0)
  return String.fromCodePoint(
    code.charCodeAt(0) + A,
    code.charCodeAt(1) + A,
  )
}

flagFromCode("ID") // 🇮🇩
flagFromCode("US") // 🇺🇸
flagFromCode("GB") // 🇬🇧`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Flags render as text — scale with surrounding <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">font-size</code>.
        </p>
        <DocsExample
          title="text-xs / text-sm / text-base / text-lg / text-xl / text-2xl / text-3xl"
          preview={
            <div className="flex items-end gap-4">
              {(["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl"] as const).map((s) => (
                <div key={s} className="text-center space-y-1">
                  <div className={s}>{flagFromCode("ID")}</div>
                  <div className="text-[10px] text-text-soft-400">{s}</div>
                </div>
              ))}
            </div>
          }
          code={`<span className="text-base">{flagFromCode("ID")}</span>
<span className="text-2xl">{flagFromCode("ID")}</span>`}
        />
      </DocsSection>

      <DocsSection title="Usage examples">
        <DocsExample
          title="Phone number country selector"
          preview={
            <div className="max-w-sm">
              <div className="flex items-center gap-2 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-3 h-10">
                <button className="inline-flex items-center gap-1 text-sm">
                  <span className="text-lg leading-none">{flagFromCode("ID")}</span>
                  <span>+62</span>
                  <span className="text-text-soft-400">▾</span>
                </button>
                <div className="w-px h-5 bg-stroke-soft-200" />
                <input className="flex-1 bg-transparent outline-none text-sm" placeholder="(811) 1234-5678" />
              </div>
            </div>
          }
          code={`<button>
  <span>{flagFromCode("ID")}</span> +62 ▾
</button>`}
        />
        <DocsExample
          title="Language picker"
          preview={
            <ul className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 max-w-sm divide-y divide-stroke-soft-200">
              {[
                { code: "ID", lang: "Bahasa Indonesia" },
                { code: "US", lang: "English (US)" },
                { code: "JP", lang: "日本語" },
                { code: "DE", lang: "Deutsch" },
                { code: "FR", lang: "Français" },
              ].map((l) => (
                <li key={l.code} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-bg-weak-50">
                  <span className="text-xl">{flagFromCode(l.code)}</span>
                  <span className="flex-1">{l.lang}</span>
                  <span className="text-xs text-text-soft-400">{l.code}</span>
                </li>
              ))}
            </ul>
          }
          code={`{languages.map(l => (
  <li>
    <span>{flagFromCode(l.code)}</span>
    {l.label}
  </li>
))}`}
        />
        <DocsExample
          title="Shipping address country dropdown trigger"
          preview={
            <div className="max-w-sm flex items-center gap-2 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-3 h-10 text-sm">
              <span className="text-xl">{flagFromCode("MY")}</span>
              <span className="flex-1">Malaysia</span>
              <span className="text-text-soft-400">▾</span>
            </div>
          }
          code={`<SelectTrigger>
  <span>{flagFromCode(country)}</span>
  <span>{countryName}</span>
</SelectTrigger>`}
        />
      </DocsSection>

      <DocsSection title="Catalog">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Search by country name or ISO code. Filter by region.
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex-1 max-w-md">
            <InputRoot>
              <InputIcon><Search className="size-4" /></InputIcon>
              <Input placeholder="Search country or code…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </InputRoot>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...REGIONS] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r as Region | "All")}
                className={cn(
                  "inline-flex h-8 items-center rounded-md px-3 text-xs font-medium border transition-colors",
                  region === r
                    ? "bg-bg-strong-950 text-white border-bg-strong-950"
                    : "border-stroke-soft-200 text-text-sub-600 hover:bg-bg-weak-50",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-text-soft-400 mb-2 inline-flex items-center gap-2">
          <Badge size="sm" appearance="lighter" status="information">{filtered.length}</Badge>
          countries
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-stroke-soft-200 p-8 text-center text-sm text-text-sub-600">
            No match for "{query}".
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
            {filtered.map((c) => (
              <div
                key={c.code}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-bg-weak-50 cursor-pointer"
                title={c.name}
              >
                <span className="text-xl shrink-0">{flagFromCode(c.code)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{c.name}</div>
                  <div className="text-[10px] text-text-soft-400 tabular-nums">{c.code}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DocsSection>

      <DocsSection title="Helper component">
        <DocsCode
          language="tsx"
          code={`export function Flag({ code, className }: { code: string; className?: string }) {
  if (!/^[A-Z]{2}$/.test(code)) return null
  const A = 0x1F1E6 - "A".charCodeAt(0)
  const glyph = String.fromCodePoint(
    code.charCodeAt(0) + A,
    code.charCodeAt(1) + A,
  )
  return (
    <span
      role="img"
      aria-label={\`Flag of \${code}\`}
      className={className}
    >
      {glyph}
    </span>
  )
}

// Usage
<Flag code="ID" className="text-xl" />`}
        />
      </DocsSection>

      <DocsSection title="Caveats">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Windows desktop</strong> — Windows fonts don't render flag emoji. Falls back to ISO letter pair. Use SVG flags (e.g. flag-icons library) if cross-platform fidelity required.</li>
          <li>• <strong>Sub-region flags</strong> — England 🏴󠁧󠁢󠁥󠁮󠁧󠁿, Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿 use tag sequences (longer codepoint chain) — not handled by the 2-letter helper.</li>
          <li>• <strong>Sanctioned territories</strong> — some platforms strip Crimea, Taiwan, etc. Test on target devices.</li>
          <li>• <strong>Selection</strong> — flag glyphs share width; cursor selection may look odd next to ASCII text. Render in own span.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "flagFromCode(code)", type: "(code: string) => string", description: "Convert ISO 3166-1 alpha-2 (\"ID\") to flag glyph (🇮🇩). Returns empty string for invalid input." },
            { name: "Flag.code", type: "string", description: "ISO 2-letter country code (uppercase)." },
            { name: "Flag.className", type: "string", description: "Optional class for sizing." },
          ]}
        />
      </DocsSection>
      <DocsSection title="Flag emoji vs SVG">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Use SVG flag assets in production UI. Don't ship `🇮🇩` emoji — Windows renders it as 'ID' text and breaks the visual.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-3">
                <div className="rounded overflow-hidden w-6 h-4 grid grid-rows-2"><div className="bg-error-base" /><div className="bg-static-white" /></div>
                <span className="text-xs">+62 · Indonesia</span>
              </div>
            ),
            caption: "SVG flag renders the same on Windows, macOS, and Linux. Crisp at any zoom level, accessible for phone-number inputs.",
          }}
          dont={{
            preview: (
              <div className="flex items-center gap-3">
                <span className="text-base">🇮🇩</span>
                <span className="text-xs">+62 · Indonesia</span>
                <span className="text-[9px] text-text-soft-400">(Windows renders as "ID")</span>
              </div>
            ),
            caption: "Don't use flag emoji in production UI. Windows users see 'ID' / 'US' / 'SG' text in place of flags — instant visual break.",
          }}
        />
      </DocsSection>

      <DocsSection title="Sensitive flags policy">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Some flags are politically sensitive (Taiwan, Palestine, Crimea). Honor the user's locale data source — don't make up a default.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1 text-xs"><p>Country / region (from your account locale):</p><div className="h-9 rounded-md border border-stroke-soft-200 px-3 flex items-center gap-2"><div className="w-5 h-3.5 bg-error-base" /><span>Indonesia</span></div></div>
            ),
            caption: "Country comes from the user's verified account locale. No editorial override, no political assumptions.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1 text-xs"><p>Country / region (Dash decided for you):</p><div className="h-9 rounded-md border border-stroke-soft-200 px-3 flex items-center gap-2"><span>🌍</span><span>(default · contact support to change)</span></div></div>
            ),
            caption: "Don't pick a default country for the user. Pre-selecting the wrong region in a politically sensitive flow erodes trust.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
