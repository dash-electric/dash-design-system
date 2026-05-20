"use client"

import { useMobile } from "@/registry/dash/hooks/use-mobile"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function UseMobileDocsPage() {
  const isMobile = useMobile()
  return (
    <DocsPageShell>
      <DocsHeader
        status="wip"
        kind="atom"
        category="Utils / Hooks"
        title="useMobile"
        description="Returns true when viewport is below 768px (md breakpoint). Mirrors Tailwind's md: media query so component-level layout decisions stay in sync with class-based responsive styles."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add use-mobile`} />
      </DocsSection>

      <DocsSection title="Example">
        <DocsExample
          title="Conditional layout (resize browser to test)"
          preview={
            <div
              className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 text-sm text-text-strong-950"
              role="status"
            >
              Viewport mode: <span className="font-semibold">{isMobile ? "mobile (<768px)" : "desktop (≥768px)"}</span>
            </div>
          }
          code={`const isMobile = useMobile()

return isMobile ? <Drawer /> : <Sheet />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          useMobile untuk swap component variant (Sheet vs Drawer). Untuk layout responsif pakai Tailwind class (md:hidden). Hook bukan replacement untuk CSS — komplementer untuk decision component-level.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1 text-xs">
                <div className="font-medium text-text-strong-950">Mobile detect → Drawer</div>
                <code className="text-text-sub-600">{`isMobile ? <Drawer /> : <Sheet />`}</code>
              </div>
            ),
            caption: "useMobile untuk swap component (Drawer bottom-sheet di mobile, Sheet side-panel di desktop). Pilihan komponen tergantung viewport behavior.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1 text-xs">
                <div className="font-medium text-text-strong-950">Mobile detect → hide elements</div>
                <code className="text-text-sub-600">{`{!isMobile && <Sidebar />}`}</code>
              </div>
            ),
            caption: "Conditional render via JS untuk show/hide = SSR flicker + layout shift. Pakai Tailwind 'hidden md:block' supaya server+client match.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1 text-xs">
                <div className="font-medium text-text-strong-950">Tablet breakpoint custom</div>
                <code className="text-text-sub-600">{`useMobile(1024) // lg breakpoint`}</code>
              </div>
            ),
            caption: "Custom breakpoint untuk tablet (1024 = lg). Sesuaikan dengan Tailwind breakpoint supaya CSS + JS consistent.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1 text-xs">
                <div className="font-medium text-text-strong-950">Random breakpoint</div>
                <code className="text-text-sub-600">{`useMobile(689) // random pixel`}</code>
              </div>
            ),
            caption: "Custom breakpoint 689px (bukan Tailwind value) = CSS class 'md:' (768) + hook (689) tidak sinkron. Layout pecah di antara range.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "breakpoint", type: "number", defaultValue: "768", description: "Pixel width below which isMobile is true. Matches Tailwind md breakpoint." },
            { name: "returns", type: "boolean", description: "True when viewport width < breakpoint." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Custom breakpoint">
        <DocsExample
          title="Match a non-md breakpoint"
          description="Pass a custom px width — e.g., 1024 for lg breakpoint."
          preview={<p className="text-sm text-text-sub-600">Pass the breakpoint as the first arg.</p>}
          code={`// Match Tailwind lg breakpoint (1024px)
const isTabletOrSmaller = useMobile(1024)

// Match a custom design breakpoint
const isPhone = useMobile(480)`}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• SSR-safe — initial render returns <code className="text-xs">false</code>, then resyncs after mount. Avoid layout-shifting jumps by mirroring the same default in Tailwind classes (<code className="text-xs">block md:hidden</code>).</li>
          <li>• Don&apos;t use to swap entirely different keyboard models — use Tailwind classes so SSR + JS see the same layout intent.</li>
          <li>• Prefer container queries (<code className="text-xs">@container</code>) where the layout depends on the parent, not the viewport — useMobile is for viewport-bound behaviour like Sheet vs Drawer.</li>
          <li>• On Safari, the resize event fires on URL bar appear/disappear — debounce expensive consumers if needed.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
