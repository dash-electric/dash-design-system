"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function DarkModePage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Foundations"
        title="Dark Mode"
        description="Dash drives dark mode through a single .dark class on <html>. Every semantic token (bg / text / stroke / icon) re-points to its inverted scale shade — no per-component dark: variants required."
      />

      <DocsSection
        title="How it works"
        description="One class toggle, the entire token tier flips."
      >
        <p className="text-sm text-text-sub-600 mb-3">
          Dash uses the <code className="text-xs">.dark</code> class strategy (not OS preference
          auto). When <code className="text-xs">html.dark</code> is present, the cascade overrides
          every semantic token in <code className="text-xs">app/globals.css</code>:
        </p>
        <DocsCode
          language="css"
          code={`/* light (default) */
:root {
  --bg-strong-950: var(--dash-neutral-950);
  --bg-white-0:    var(--dash-neutral-0);
  --text-strong-950: var(--dash-neutral-950);
  --text-white-0:    var(--dash-neutral-0);
  --stroke-soft-200: var(--dash-neutral-200);
}

/* dark — same names, inverted scale shades */
.dark {
  --bg-strong-950: var(--dash-neutral-0);
  --bg-white-0:    var(--dash-neutral-950);
  --text-strong-950: var(--dash-neutral-0);
  --text-white-0:    var(--dash-neutral-950);
  --stroke-soft-200: var(--dash-neutral-800);
}`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Components only reference semantic names (<code className="text-xs">bg-bg-strong-950</code>,{" "}
          <code className="text-xs">text-text-sub-600</code>). They stay one-liners — no{" "}
          <code className="text-xs">dark:</code> variants needed.
        </p>
      </DocsSection>

      <DocsSection
        title="Token map (light → dark)"
        description="Every tier reverses. Strong becomes white-0; weak becomes strong-950. Brand stays the same on both modes."
      >
        <DocsPropsTable
          rows={[
            { name: "--bg-white-0",      type: "background", defaultValue: "neutral-0 → neutral-950", description: "Canvas surface, flips white ↔ near-black." },
            { name: "--bg-weak-50",      type: "background", defaultValue: "neutral-50 → neutral-800", description: "Subtle elevation tile (cards, code blocks)." },
            { name: "--bg-soft-200",     type: "background", defaultValue: "neutral-200 → neutral-700", description: "Disabled / muted surface." },
            { name: "--bg-strong-950",   type: "background", defaultValue: "neutral-950 → neutral-0",  description: "Inverted CTA fill (text-on-dark in light mode)." },
            { name: "--text-strong-950", type: "text",       defaultValue: "neutral-950 → neutral-0",  description: "Headings + primary copy." },
            { name: "--text-sub-600",    type: "text",       defaultValue: "neutral-600 → neutral-400", description: "Body / secondary copy." },
            { name: "--text-soft-400",   type: "text",       defaultValue: "neutral-400 → neutral-500", description: "Tertiary, captions." },
            { name: "--stroke-soft-200", type: "stroke",     defaultValue: "neutral-200 → neutral-800", description: "Default card / input border." },
            { name: "--icon-sub-600",    type: "icon",       defaultValue: "neutral-600 → neutral-400", description: "Default icon color." },
            { name: "--primary-base",    type: "brand",      defaultValue: "purple-500 (both)",         description: "Dash brand purple — identical light and dark." },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="Configuration"
        description="Wire next-themes once, never touch dark: variants again."
      >
        <p className="text-sm text-text-sub-600 mb-3">1. Install:</p>
        <DocsCode language="bash" code={`pnpm add next-themes`} />
        <p className="text-sm text-text-sub-600 mt-4 mb-3">
          2. Wrap your app in <code className="text-xs">app/layout.tsx</code>:
        </p>
        <DocsCode
          language="tsx"
          code={`// app/layout.tsx
import { ThemeProvider } from "next-themes"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"      // toggles .dark on <html>
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}`}
        />
        <p className="text-sm text-text-sub-600 mt-4 mb-3">3. Add a toggle:</p>
        <DocsCode
          language="tsx"
          code={`"use client"

import { RiMoonLine as Moon, RiSunLine as Sun } from "@remixicon/react"
import { useTheme } from "next-themes"
import { IconButton } from "@/registry/dash/ui/icon-button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const next = resolvedTheme === "dark" ? "light" : "dark"
  return (
    <IconButton
      variant="ghost"
      size="sm"
      onClick={() => setTheme(next)}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </IconButton>
  )
}`}
        />
      </DocsSection>

      <DocsSection
        title="Testing dark mode"
        description="Three ways to verify your build looks right both directions."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-2">
          <li>
            <strong className="text-text-strong-950">Toggle in-app:</strong>{" "}
            click the theme toggle (above). Halo-dash topbar ships one out of the box.
          </li>
          <li>
            <strong className="text-text-strong-950">Force in DevTools:</strong>{" "}
            apply <code className="text-xs">class=&quot;dark&quot;</code> to{" "}
            <code className="text-xs">&lt;html&gt;</code> manually to inspect transitions
            without flicker.
          </li>
          <li>
            <strong className="text-text-strong-950">OS preference:</strong>{" "}
            with <code className="text-xs">enableSystem</code>, macOS appearance switch
            propagates within ~150ms.
          </li>
        </ul>
      </DocsSection>

      <DocsSection
        title="Tailwind v4 @variant dark"
        description="Dash does NOT use Tailwind&apos;s @variant dark. Here&apos;s why."
      >
        <p className="text-sm text-text-sub-600 mb-3">
          Tailwind v4 ships a <code className="text-xs">@variant dark</code> directive that
          forks utilities (<code className="text-xs">dark:bg-neutral-900</code>). Dash
          rejects this pattern because it scatters dark-mode policy across every component file.
        </p>
        <p className="text-sm text-text-sub-600">
          Instead, the policy lives in <strong className="text-text-strong-950">one place</strong> —{" "}
          the <code className="text-xs">.dark {`{ ... }`}</code> override block in{" "}
          <code className="text-xs">app/globals.css</code>. Components write{" "}
          <code className="text-xs">bg-bg-white-0</code> once and the token does the work.
          If you ever fork the theme (e.g. high-contrast accessibility mode), you only edit globals.css.
        </p>
      </DocsSection>

      <DocsSection title="Common pitfalls">
        <div className="space-y-4 text-sm text-text-sub-600">
          <div>
            <div className="font-semibold text-text-strong-950">Hydration mismatch warning</div>
            Make sure <code className="text-xs">&lt;html suppressHydrationWarning&gt;</code> is
            set when using next-themes. The initial server render can&apos;t know the user&apos;s preference.
          </div>
          <div>
            <div className="font-semibold text-text-strong-950">Flash of wrong theme</div>
            next-themes injects a blocking script. If you stripped it, the page flashes light→dark on
            first paint. Keep the default behaviour.
          </div>
          <div>
            <div className="font-semibold text-text-strong-950">Brand purple looks dim in dark mode</div>
            Intentional — <code className="text-xs">--primary-base</code> stays at{" "}
            <code className="text-xs">purple-500</code> both modes. If you need more punch
            for a hero CTA, layer a <code className="text-xs">FancyButton</code> with a gradient.
          </div>
          <div>
            <div className="font-semibold text-text-strong-950">Mitra status badges hard to read</div>
            Use <code className="text-xs">appearance=&quot;light&quot;</code> (soft fill, dark text)
            instead of <code className="text-xs">appearance=&quot;solid&quot;</code> in tables.
            Soft variants are tuned for both modes.
          </div>
        </div>
      </DocsSection>
      <DocsSection title="Token-driven theming">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Dark mode flips through semantic tokens — `bg-bg-white-0` swaps automatically. Don't ship `dark:` class overrides on every element.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs space-y-1">
                <p className="font-mono">bg-bg-white-0</p>
                <p className="font-mono">text-text-strong-950</p>
                <p className="text-text-soft-400 text-[10px]">— flips automatically in dark mode —</p>
              </div>
            ),
            caption: "Use semantic tokens for surface, text, stroke. Dark mode flips them through a single CSS variable swap.",
          }}
          dont={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs space-y-1">
                <p className="font-mono">bg-white dark:bg-zinc-900</p>
                <p className="font-mono">text-black dark:text-white</p>
                <p className="font-mono">border-gray-200 dark:border-gray-800</p>
                <p className="text-text-soft-400 text-[10px]">— authored 2× per element —</p>
              </div>
            ),
            caption: "Don't author light + dark variants per element. Every new element doubles your test surface and drifts from the system.",
          }}
        />
      </DocsSection>

      <DocsSection title="Contrast in both modes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Verify contrast ratios in both light and dark. Don't ship a 'pretty' dark mode that fails WCAG-AA on key text.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-lg bg-bg-strong-950 text-text-white-0 p-3 text-xs space-y-1">
                <p className="font-semibold">Mitra aktif</p>
                <p>734 · ↑ 12% vs minggu lalu</p>
                <p className="text-[10px] text-text-sub-300">Ratio 7.2 : 1 — AAA</p>
              </div>
            ),
            caption: "Dark surface paired with high-contrast text passes WCAG-AAA. Numbers, status badges, axis labels all readable.",
          }}
          dont={{
            preview: (
              <div className="rounded-lg p-3 text-xs space-y-1" style={{background: "#1A1422", color: "#7C4FC4"}}>
                <p className="font-semibold">Mitra aktif</p>
                <p>734</p>
                <p className="text-[10px]">Ratio 2.4 : 1 — fails AA</p>
              </div>
            ),
            caption: "Don't use brand purple as dark-mode body text. 2.4 : 1 contrast = unreadable for anyone over 40 or with low-light dimming.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
