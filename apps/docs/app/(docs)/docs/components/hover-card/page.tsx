"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/registry/dash/ui/hover-card"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function HoverCardDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Overlays"
        title="Hover Card"
        description="Non-modal preview shown on hover or focus. Use for inline mitra preview in tables, dispatch detail tooltip-with-content, user mention popovers. Skip on mobile — pair with Popover or Drawer there."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hover-card`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Three parts on top of Radix Hover Card: <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">HoverCard</code> (root, owns open state), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">HoverCardTrigger</code> (the hovered surface — usually a link or avatar, wrap via <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">asChild</code>), and <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">HoverCardContent</code> (the portalled floating panel). The content is free-form — any JSX. Use this for rich, non-critical preview info; for short labels reach for Tooltip, and for click-driven content use Popover.
        </p>
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/registry/dash/ui/hover-card"

<HoverCard>
  <HoverCardTrigger asChild>
    <a className="underline">@mtr-9412</a>
  </HoverCardTrigger>
  <HoverCardContent>…</HoverCardContent>
</HoverCard>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Mitra preview"
          preview={
            <p className="text-sm">
              Suspend dijalankan oleh{" "}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="font-medium text-primary underline-offset-4 hover:underline">
                    @mtr-9412
                  </button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src="" alt="" />
                      <AvatarFallback>SP</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-strong-950">Sigit P.</span>
                        <Badge status="success" appearance="lighter">Active</Badge>
                      </div>
                      <p className="text-xs text-text-sub-600">
                        Reservasi · Bekasi · 142 trips · joined Jul 2025
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              {" "}atas instruksi Halo-dash Ops.
            </p>
          }
          code={`<HoverCard>
  <HoverCardTrigger asChild>
    <button>@mtr-9412</button>
  </HoverCardTrigger>
  <HoverCardContent>
    <Avatar>…</Avatar>
    <div>
      <span>Sigit P.</span>
      <Badge status="success" appearance="lighter">Active</Badge>
      <p>Reservasi · Bekasi · 142 trips</p>
    </div>
  </HoverCardContent>
</HoverCard>`}
        />

        <DocsExample
          title="Dispatch reference"
          preview={
            <p className="text-sm">
              Dispatch{" "}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="underline-offset-2 hover:underline">TRP-2026-05-08-9384</button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-text-sub-600">Pickup</span><span className="font-medium">Kemang, JKSEL</span></div>
                    <div className="flex justify-between"><span className="text-text-sub-600">Drop</span><span className="font-medium">PIK, JKUTA</span></div>
                    <div className="flex justify-between"><span className="text-text-sub-600">Mitra</span><span className="text-xs">mtr-9412</span></div>
                    <div className="flex justify-between"><span className="text-text-sub-600">Status</span><Badge status="success" appearance="lighter" size="sm">Selesai</Badge></div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              {" "}selesai 14:32.
            </p>
          }
          code={`<HoverCard>
  <HoverCardTrigger asChild>
    <button className="underline">TRP-2026-05-08-9384</button>
  </HoverCardTrigger>
  <HoverCardContent>
    <div>Pickup · Kemang, JKSEL</div>
    <div>Drop · PIK, JKUTA</div>
    <div>Mitra · mtr-9412</div>
  </HoverCardContent>
</HoverCard>`}
        />

        <DocsExample
          title="Tighter delay (for table rows)"
          description="Drop openDelay to 200ms when users will hover quickly across many rows."
          preview={
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button className="text-sm underline-offset-2 hover:underline">Hover quickly</button>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="text-sm">Opens after 200ms instead of 700ms.</p>
              </HoverCardContent>
            </HoverCard>
          }
          code={`<HoverCard openDelay={200} closeDelay={100}>
  <HoverCardTrigger>…</HoverCardTrigger>
  <HoverCardContent>…</HoverCardContent>
</HoverCard>`}
        />

        <DocsExample
          title="Alignment variants"
          preview={
            <div className="flex flex-wrap gap-4">
              {(["start", "center", "end"] as const).map((align) => (
                <HoverCard key={align}>
                  <HoverCardTrigger asChild>
                    <button className="text-sm underline-offset-2 hover:underline">align={align}</button>
                  </HoverCardTrigger>
                  <HoverCardContent align={align}>
                    <p className="text-sm">Aligned <code className="text-xs">{align}</code>.</p>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          }
          code={`<HoverCardContent align="start" />
<HoverCardContent align="center" />  {/* default */}
<HoverCardContent align="end" />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Hover Card = preview informasi non-critical. Skip di mobile (tidak ada hover). Bukan replacement Tooltip atau Popover.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="text-sm">
                Dispatch by <span className="underline decoration-dotted">Sigit P.</span>
                <div className="mt-2 inline-block rounded border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs space-y-1">
                  <div className="font-semibold">Sigit P. · mtr-9412</div>
                  <div className="text-text-sub-600">Active · Reservasi · 142 trip · Bekasi</div>
                </div>
              </div>
            ),
            caption: "Hover mitra name → preview profil singkat. Dispatcher tidak perlu klik, langsung dapat konteks.",
          }}
          dont={{
            preview: (
              <div className="text-sm">
                <span className="underline decoration-dotted">Suspend mitra</span>
                <div className="mt-2 inline-block rounded border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs">
                  <button className="text-error-dark">Confirm suspend</button>
                </div>
              </div>
            ),
            caption: "Jangan tempel action button di Hover Card. Hover → tangan geser → dismiss. Pakai Popover atau dropdown menu.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Konten ringkas (3-5 baris max): nama, status, badge, 1 metrik utama. User scan saat hover beberapa detik.",
          }}
          dont={{
            caption: "Jangan render Hover Card di mobile / touch device. Tidak ada hover state. Pakai Popover yang trigger by tap.",
          }}
        />
      </DocsSection>

      <DocsSection title="When to use vs Popover / Tooltip">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Tooltip</strong> — single-line text label for icons / abbreviated controls.</li>
          <li>• <strong>HoverCard</strong> — multi-element preview (avatar + name + status). Desktop hover/focus, not touch.</li>
          <li>• <strong>Popover</strong> — explicit click to open. Works on touch + keyboard.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "openDelay", type: "number", defaultValue: "700", description: "Hover delay before opening (ms). On Root." },
            { name: "closeDelay", type: "number", defaultValue: "300", description: "Hover delay before closing (ms). On Root." },
            { name: "align", type: '"start" | "center" | "end"', defaultValue: '"center"', description: "Horizontal alignment relative to trigger. On Content." },
            { name: "side", type: '"top" | "right" | "bottom" | "left"', defaultValue: '"bottom"', description: "Preferred side. On Content." },
            { name: "sideOffset", type: "number", defaultValue: "6", description: "Distance from trigger in px. On Content." },
            { name: "collisionPadding", type: "number", defaultValue: "8", description: "Edge buffer before flipping side. On Content." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <p className="text-sm text-text-sub-600">Built on <a href="https://www.radix-ui.com/primitives/docs/components/hover-card" target="_blank" rel="noreferrer" className="underline">Radix HoverCard</a>.</p>
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Trigger</strong> — must be a focusable element (button, link). Avoid wrapping plain spans.</li>
          <li>• <strong>Open conditions</strong>
            <ul className="ml-6 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li>Mouse hover after <code className="text-xs">openDelay</code>.</li>
              <li>Keyboard focus (immediate).</li>
              <li>Touch — does NOT open. Provide an alternate Popover for touch flows.</li>
            </ul>
          </li>
          <li>• <strong>Keyboard</strong> — <code className="text-xs">Tab</code> moves focus to the trigger (opens), <code className="text-xs">Tab</code> again moves focus out (closes after closeDelay). <code className="text-xs">Esc</code> closes immediately.</li>
          <li>• <strong>Non-interactive content</strong> — HoverCard content should NOT contain primary actions. If users need to act, use Popover.</li>
          <li>• <strong>Reduced motion</strong> — open/close fade respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
