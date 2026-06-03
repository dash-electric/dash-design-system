"use client"

import * as React from "react"
import { LanguageSelect } from "@/registry/dash/ui/language-select"
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
 * LanguageSelect — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/language-select.tsx
 *
 * Globe-iconed locale picker. Re-routes the user to the same path under a
 * different locale segment on change. In Next Portal v2 it pairs with next-intl
 * routing; the docs port below is decoupled — pass `onLocaleChange` and route
 * yourself.
 */

export default function LanguageSelectDocsPage() {
  const [locale, setLocale] = React.useState("en")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Settings"
        title="Language Select"
        description="Locale picker with a globe leading icon. Wraps Select. In real apps, the onLocaleChange handler should rewrite the URL's locale segment and reload."
        status="beta"
        kind="specialized"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add language-select
# plus locale routing (optional):
pnpm add next-intl`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`"use client"
import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"

export function LanguagePicker() {
  const locale = useLocale()
  const pathname = usePathname()
  return (
    <LanguageSelect
      value={locale}
      onLocaleChange={(next) => {
        const rest = pathname.split("/").slice(2).join("/")
        window.location.href = \`/\${next}/\${rest}\`
      }}
    />
  )
}`}
        />
      </DocsSection>

      <DocsSection title="Live: controlled">
        <DocsExample
          title="Locale picker"
          description={<>Current locale: <code>{locale}</code></>}
          preview={<LanguageSelect value={locale} onLocaleChange={setLocale} />}
          code={`const [locale, setLocale] = useState("en")
<LanguageSelect value={locale} onLocaleChange={setLocale} />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Language select untuk Dash = minimal 'Bahasa Indonesia' + 'English'. Label dalam bahasa native ('Bahasa Indonesia', bukan 'Indonesian'). Persist pilihan ke URL/cookie supaya reload tetap.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs">
                <LanguageSelect value={locale} onLocaleChange={setLocale} languages={[{ value: "id", label: "Bahasa Indonesia" }, { value: "en", label: "English" }]} />
              </div>
            ),
            caption: "Label native ('Bahasa Indonesia', 'English'). User Indonesia langsung kenali bahasanya. ID first karena audience primary Dash.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs">
                <LanguageSelect value={locale} onLocaleChange={setLocale} languages={[{ value: "en", label: "English" }, { value: "id", label: "Indonesian" }]} />
              </div>
            ),
            caption: "Label 'Indonesian' (English-translated) = mitra tidak yakin itu Bahasa Indonesia atau Malay. Selalu native-name.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs space-y-1 max-w-xs">
                <div>URL setelah pilih: <code className="text-text-strong-950">/id/dashboard</code></div>
                <div className="text-text-sub-600">Reload page tetap di Bahasa Indonesia.</div>
              </div>
            ),
            caption: "Locale tersimpan di URL segment (/id/, /en/). Reload, share link, bookmark — semua respect pilihan user.",
          }}
          dont={{
            preview: (
              <div className="text-xs space-y-1 max-w-xs">
                <div>URL: <code className="text-text-strong-950">/dashboard?lang=id</code></div>
                <div className="text-text-soft-400">Reload tanpa query = balik ke English.</div>
              </div>
            ),
            caption: "Query param tanpa persist = pilih bahasa, refresh, balik default. Pakai URL segment atau cookie, jangan ephemeral query.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Current locale code, e.g. 'en' / 'id'." },
            { name: "languages", type: "Lang[]", defaultValue: "[en, id]", description: "Override the option set. Each item is { value, label }." },
            { name: "onLocaleChange", type: "(locale: string) => void", description: "Called with the new locale. Real apps re-route here." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Variants">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>For an inline header treatment, swap the wrapper to <code>Select variant="inline"</code> if/when that variant ships.</li>
          <li>Pass flag glyphs in each SelectItem if you want country flags (Next Portal uses text-only — easier to maintain).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
