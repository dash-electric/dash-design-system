"use client"

import * as React from "react"
import { ScrollArea } from "@/registry/dash/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
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
 * ScrollArea — Figma 1:1 (node 166941:61889 verified 2026-05-18).
 *
 * Track sizes: x-small (12px), small (16px), medium (20px default).
 * Track styles: default (white track + soft border), lighter (bg-weak-50 track).
 * Thumb always 4px rounded-full. Wraps Radix ScrollArea with vertical + horizontal support.
 */

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas at sapien at lorem feugiat tempus. Sed at orci euismod, blandit sapien id, fermentum nisl. Suspendisse potenti. Vivamus ut tortor at metus iaculis interdum. Pellentesque vitae lectus eget mauris facilisis tristique. Curabitur consequat tortor sit amet quam ullamcorper, ut tincidunt nisi facilisis. Aenean ut tempus erat. Ut sit amet velit nec velit dignissim laoreet. Phasellus euismod, ipsum vel mattis fermentum, nulla erat egestas tellus, vitae auctor eros lectus a libero. Praesent maximus, libero a hendrerit pulvinar, lorem nisl rutrum lectus, eget dignissim odio enim ut sem. Maecenas dignissim, magna sit amet rhoncus eleifend, sem ipsum convallis felis.`

export default function ScrollAreaDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Layout"
        title="Scroll Area"
        description="Custom scrollbar wrapping Radix ScrollArea. Three track sizes (12 / 16 / 20 px) × two styles (default white, lighter weak-50). Thumb is always 4px rounded-full. Use for content panels where the native scrollbar would clash with the Dash visual language."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add scroll-area`} />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Three track widths — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">x-small (12px)</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">small (16px)</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">medium (20px default)</code>. Thumb stays 4px regardless — the larger track adds padding around it.
        </p>
        <DocsExample
          title="3 vertical sizes"
          preview={
            <div className="grid grid-cols-3 gap-3">
              {(["x-small","small","medium"] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <ScrollArea size={s} className="h-44 w-full rounded-md border border-stroke-soft-200 p-3 text-xs text-text-sub-600">
                    {longText}
                  </ScrollArea>
                  <span className="text-[10px] text-text-soft-400">{s}</span>
                </div>
              ))}
            </div>
          }
          code={`<ScrollArea size="x-small">{...}</ScrollArea>
<ScrollArea size="small">{...}</ScrollArea>
<ScrollArea size="medium">{...}</ScrollArea>`}
        />
      </DocsSection>

      <DocsSection title="Styles">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two track styles — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">default</code> (white track + soft border) vs <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">lighter</code> (bg-weak-50 track + stronger thumb). Pick lighter when the scroll area sits inside a white card and the bordered track would visually clash.
        </p>
        <DocsExample
          title="default + lighter"
          preview={
            <div className="grid grid-cols-2 gap-3">
              {(["default","lighter"] as const).map((v) => (
                <div key={v} className="flex flex-col items-center gap-1.5">
                  <ScrollArea variant={v} className="h-44 w-full rounded-md border border-stroke-soft-200 p-3 text-xs text-text-sub-600">
                    {longText}
                  </ScrollArea>
                  <span className="text-[10px] text-text-soft-400">{v}</span>
                </div>
              ))}
            </div>
          }
          code={`<ScrollArea variant="default">{...}</ScrollArea>
<ScrollArea variant="lighter">{...}</ScrollArea>`}
        />
      </DocsSection>

      <DocsSection title="Inside a card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Long lists or chat transcripts inside cards need a contained scroll surface. Wrap the inner content with ScrollArea and set a fixed height.
        </p>
        <DocsExample
          title="Member list"
          preview={
            <div className="max-w-sm rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-(--shadow-custom-sm)">
              <header className="px-4 py-3 border-b border-stroke-soft-200">
                <div className="text-sm font-semibold text-text-strong-950">Members</div>
                <div className="text-xs text-text-sub-600">128 active in your team</div>
              </header>
              <ScrollArea size="small" className="h-64">
                <ul className="divide-y divide-stroke-soft-200">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-3">
                      <Avatar size="sm">
                        <AvatarImage src={`https://i.pravatar.cc/40?u=scroll-${i}`} />
                        <AvatarFallback>{String.fromCharCode(65 + (i % 26))}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-strong-950 truncate">Member #{i + 1}</div>
                        <div className="text-xs text-text-soft-400 truncate">member{i + 1}@dash.com</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          }
          code={`<ScrollArea size="small" className="h-64">
  <ul>{members.map(m => <Row key={m.id} {...m} />)}</ul>
</ScrollArea>`}
        />
      </DocsSection>

      <DocsSection title="Horizontal">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Horizontal overflow works the same — set <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">whitespace-nowrap</code> on the inner row and the ScrollArea will surface a horizontal track.
        </p>
        <DocsExample
          title="Horizontal chip row"
          preview={
            <ScrollArea size="small" className="w-full max-w-xl rounded-md border border-stroke-soft-200">
              <div className="flex gap-2 p-3 whitespace-nowrap">
                {Array.from({ length: 20 }).map((_, i) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-bg-weak-50 px-3 py-1 text-xs text-text-strong-950">
                    Tag #{i + 1}
                  </span>
                ))}
              </div>
            </ScrollArea>
          }
          code={`<ScrollArea size="small">
  <div className="flex gap-2 whitespace-nowrap">{...}</div>
</ScrollArea>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          ScrollArea untuk container content yang melebihi viewport. Tetap pertahankan scroll affordance — user harus tahu konten masih ada.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs text-xs">
                <div className="rounded border border-stroke-soft-200 bg-bg-white-0 max-h-24 overflow-hidden relative">
                  <div className="p-2 space-y-1">
                    <div>DLV-7821 · PICKED_UP</div>
                    <div>DLV-7822 · ALLOCATING</div>
                    <div>DLV-7823 · QUEUEING</div>
                    <div>DLV-7824 · COMPLETED</div>
                  </div>
                  <div className="absolute top-1 right-1 w-1 h-12 rounded-full bg-text-soft-400" />
                </div>
                <div className="text-[10px] text-text-soft-400 mt-1">24 delivery total</div>
              </div>
            ),
            caption: "Scroll bar visible saat hover. Sertakan total count di luar — dispatcher tahu \"masih ada 20 lagi\".",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs">
                <div className="rounded border border-stroke-soft-200 bg-bg-white-0 max-h-24 overflow-hidden">
                  <div className="p-2 space-y-1">
                    <div>DLV-7821</div>
                    <div>DLV-7822</div>
                    <div>DLV-7823</div>
                  </div>
                </div>
              </div>
            ),
            caption: "Jangan sembunyikan scrollbar tanpa hint visual (fade gradient bottom / counter). User kira list cuma 3 item.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Pakai untuk 50-500 row. Di atas 500 row, switch ke virtualized list — ScrollArea masih DOM-render semua child.",
          }}
          dont={{
            caption: "Jangan bungkus seluruh halaman dengan ScrollArea. Native page scroll lebih familiar (scroll-to-top browser shortcut, dll).",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "size", type: '"x-small" | "small" | "medium"', defaultValue: '"medium"', description: "Track width — 12 / 16 / 20 px." },
            { name: "variant", type: '"default" | "lighter"', defaultValue: '"default"', description: "Track style. lighter swaps the white track for bg-weak-50." },
            { name: "className", type: "string", description: "Forwarded to the Radix Root — set h-* / max-h-* to bound the scroll surface." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
