"use client"

import * as React from "react"
import { LanguageSelect } from "@/registry/dash/ui/language-select"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
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
        status="new"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add language-select
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
