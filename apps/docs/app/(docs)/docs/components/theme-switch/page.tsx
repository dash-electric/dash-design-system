"use client"

import * as React from "react"
import { ThemeSwitch } from "@/registry/dash/ui/theme-switch"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * ThemeSwitch — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/theme-switch.tsx
 *
 * Three-segment toggle for theme preference: light / dark / system. Wraps
 * SegmentedControl and binds to next-themes' `useTheme` hook (or any equivalent
 * controlled state). Square aspect ratio per segment — icon-only.
 */

export default function ThemeSwitchDocsPage() {
  const [value, setValue] = React.useState<"light" | "dark" | "system">("system")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Settings"
        title="Theme Switch"
        description="Three-segment icon toggle for theme preference — light / dark / system. Built on SegmentedControl. Wire to next-themes' setTheme in real apps."
        status="new"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add theme-switch
# plus the theme provider:
pnpm add next-themes`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`"use client"
import { useTheme } from "next-themes"

export function Header() {
  const { theme, setTheme } = useTheme()
  return <ThemeSwitch value={theme} onValueChange={setTheme} />
}`}
        />
      </DocsSection>

      <DocsSection title="Live: controlled">
        <DocsExample
          title="Click to swap"
          description={<>Current value: <code>{value}</code></>}
          preview={
            <ThemeSwitch
              value={value}
              onValueChange={(v) => setValue(v as "light" | "dark" | "system")}
            />
          }
          code={`const [value, setValue] = useState<"light" | "dark" | "system">("system")
<ThemeSwitch value={value} onValueChange={(v) => setValue(v as any)} />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: '"light" | "dark" | "system"', description: "Controlled active segment." },
            { name: "defaultValue", type: '"light" | "dark" | "system"', defaultValue: '"system"', description: "Uncontrolled initial value." },
            { name: "onValueChange", type: "(value: string) => void", description: "Called whenever a segment is selected. Bind to setTheme()." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>3× SegmentedItem with square aspect-ratio and icon-only content.</li>
          <li>Icons: <code>RiSunLine</code> / <code>RiMoonLine</code> / <code>RiEqualizer3Fill</code>.</li>
          <li>aria-label on each segment for screen readers (icon-only buttons must label).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
