"use client"

import * as React from "react"
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
 * Cursors — Figma 1:1 (1 node verified 2026-05-18).
 *
 *   2810:7063   Master grid — 10 cursor states (pointer, grab, grabbing,
 *               zoom-in, zoom-out, move, help, text/i-beam, caret)
 *
 * Implementation: CSS `cursor` property values. Browser/OS renders system glyph.
 * Zero SVG asset weight. Use Tailwind `cursor-*` utility or inline style.
 */

type Cursor = {
  key: string
  label: string
  css: string
  tw: string
  glyph: string
  example: string
}

const CURSORS: Cursor[] = [
  { key: "default", label: "Default", css: "default", tw: "cursor-default", glyph: "↖", example: "Idle / non-interactive surface" },
  { key: "pointer", label: "Pointer", css: "pointer", tw: "cursor-pointer", glyph: "☝", example: "Buttons, links, clickable rows" },
  { key: "grab", label: "Grab", css: "grab", tw: "cursor-grab", glyph: "✋", example: "Draggable item (idle)" },
  { key: "grabbing", label: "Grabbing", css: "grabbing", tw: "cursor-grabbing", glyph: "✊", example: "Drag in progress" },
  { key: "zoom-in", label: "Zoom In", css: "zoom-in", tw: "cursor-zoom-in", glyph: "🔍+", example: "Image / chart zoomable" },
  { key: "zoom-out", label: "Zoom Out", css: "zoom-out", tw: "cursor-zoom-out", glyph: "🔍−", example: "Image / chart zoomed-in state" },
  { key: "move", label: "Move", css: "move", tw: "cursor-move", glyph: "✥", example: "Movable / repositionable element" },
  { key: "help", label: "Help", css: "help", tw: "cursor-help", glyph: "?", example: "Element with extra context tooltip" },
  { key: "text", label: "Text (I-beam)", css: "text", tw: "cursor-text", glyph: "I", example: "Text input / editable region" },
  { key: "wait", label: "Wait / Caret", css: "wait", tw: "cursor-wait", glyph: "⏱", example: "Async operation in progress" },
  { key: "not-allowed", label: "Not Allowed", css: "not-allowed", tw: "cursor-not-allowed", glyph: "🚫", example: "Disabled control" },
  { key: "crosshair", label: "Crosshair", css: "crosshair", tw: "cursor-crosshair", glyph: "✛", example: "Precise selection (canvas tool)" },
]

export default function CursorsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Foundations"
        title="Cursors"
        description="Pointer affordances driven by the CSS cursor property. Browser/OS renders the system glyph — zero asset weight. Use the Tailwind cursor-* utility to signal interactivity, dragability, async state, and disabled state."
      />

      <DocsSection title="How it works">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Set <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">cursor</code> via Tailwind utility or inline style. The OS provides the actual glyph (macOS vs Windows vs Linux vs touch all differ slightly). Pair with <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">role</code> + <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">tabIndex</code> when adding custom interactivity to non-button elements.
        </p>
        <DocsCode
          language="tsx"
          code={`<button className="cursor-pointer">Click me</button>
<div className="cursor-grab active:cursor-grabbing">Drag me</div>
<button disabled className="cursor-not-allowed">Disabled</button>`}
        />
      </DocsSection>

      <DocsSection title="Catalog">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Hover any tile to preview its cursor. Click to copy the Tailwind class.
        </p>
        <DocsExample
          title="All cursor states"
          preview={
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-4xl">
              {CURSORS.map((c) => (
                <CursorTile key={c.key} cursor={c} />
              ))}
            </div>
          }
          code={`<div className="cursor-pointer">...</div>
<div className="cursor-grab">...</div>
<div className="cursor-not-allowed">...</div>`}
        />
      </DocsSection>

      <DocsSection title="Usage examples">
        <DocsExample
          title="Drag handle (grab → grabbing on press)"
          preview={
            <div className="space-y-2 max-w-md">
              {["Task 1: Review PR #1234", "Task 2: Deploy staging", "Task 3: Update changelog"].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-sm cursor-grab active:cursor-grabbing"
                >
                  <span className="text-text-soft-400 select-none">⋮⋮</span>
                  <span className="text-text-strong-950">{t}</span>
                </div>
              ))}
            </div>
          }
          code={`<li className="cursor-grab active:cursor-grabbing">
  <DragHandle /> {task}
</li>`}
        />
        <DocsExample
          title="Zoomable image"
          preview={
            <div className="cursor-zoom-in rounded-xl overflow-hidden border border-stroke-soft-200 inline-block">
              <div className="size-32 bg-gradient-to-br from-purple-500 to-pink-500" />
            </div>
          }
          code={`<img className="cursor-zoom-in" onClick={openLightbox} />`}
        />
        <DocsExample
          title="Help cursor on info chips"
          preview={
            <div className="flex flex-wrap gap-2 max-w-md">
              <span className="inline-flex items-center gap-1 rounded-full border border-stroke-soft-200 px-2.5 h-7 text-xs cursor-help" title="Last sync 2 min ago">
                Synced
                <span className="text-text-soft-400">ⓘ</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-stroke-soft-200 px-2.5 h-7 text-xs cursor-help" title="Premium feature">
                PRO
              </span>
            </div>
          }
          code={`<span className="cursor-help" title="...">
  Synced
</span>`}
        />
        <DocsExample
          title="Disabled button"
          preview={
            <button disabled className="rounded-md bg-bg-weak-50 text-text-disabled-300 px-4 h-9 text-sm cursor-not-allowed">
              Submit (form invalid)
            </button>
          }
          code={`<button disabled className="cursor-not-allowed">
  Submit
</button>`}
        />
        <DocsExample
          title="Async wait state"
          preview={
            <button className="rounded-md bg-bg-strong-950 text-white px-4 h-9 text-sm cursor-wait inline-flex items-center gap-2">
              <span className="inline-block size-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Processing…
            </button>
          }
          code={`<button className="cursor-wait" disabled>Processing…</button>`}
        />
      </DocsSection>

      <DocsSection title="Touch caveats">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Cursor is desktop-only</strong> — touch devices ignore cursor entirely.</li>
          <li>• <strong>Don't rely on cursor</strong> for interactivity signals on mobile. Always pair with visible affordance (button bg, underline, drag handle icon).</li>
          <li>• <strong>iPad pointer</strong> — iPadOS surfaces a hover-style cursor for hardware mouse/trackpad. Test there if you support iPad keyboard cases.</li>
          <li>• <strong>Hover-only interactions</strong> — bad for touch. Use <code className="text-xs">@media (hover: hover)</code> to gate hover-only flows.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "cursor-default", type: "CSS class", description: "System arrow. Use sparingly — only override when nested element overrides hint." },
            { name: "cursor-pointer", type: "CSS class", description: "Hand. Use for buttons + links + clickable rows." },
            { name: "cursor-grab / cursor-grabbing", type: "CSS class", description: "Open / closed hand. Pair with active: variant for press feedback." },
            { name: "cursor-zoom-in / cursor-zoom-out", type: "CSS class", description: "Magnifying glass + / −. Image lightbox + chart zoom." },
            { name: "cursor-move", type: "CSS class", description: "4-direction arrow. Movable / repositionable element." },
            { name: "cursor-help", type: "CSS class", description: "Question mark. Pair with title or Tooltip for context." },
            { name: "cursor-text", type: "CSS class", description: "I-beam. Auto-applied to text inputs / editable regions." },
            { name: "cursor-wait", type: "CSS class", description: "Stopwatch. Async operation in progress." },
            { name: "cursor-not-allowed", type: "CSS class", description: "Forbidden circle. Disabled control." },
            { name: "cursor-crosshair", type: "CSS class", description: "Crosshair. Precise selection (canvas tool, image crop)." },
          ]}
        />
      </DocsSection>
      <DocsSection title="Pointer for interactive, default for non-interactive">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Hoverable button → `cursor-pointer`. Disabled button → `cursor-not-allowed`. Plain text → default. Don't apply pointer to entire cards by reflex.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-2 w-full max-w-sm">
                <button className="h-8 px-3 rounded-md bg-primary-base text-static-white text-xs cursor-pointer">Dispatch · pointer</button>
                <button className="h-8 px-3 rounded-md bg-bg-soft-200 text-text-soft-400 text-xs cursor-not-allowed" disabled>Disabled · not-allowed</button>
                <p className="text-xs">Plain paragraph · default cursor</p>
              </div>
            ),
            caption: "Cursor matches affordance. Reader's mouse pointer becomes a UX signal — interactive vs disabled vs static.",
          }}
          dont={{
            preview: (
              <div className="space-y-2 w-full max-w-sm">
                <p className="text-xs cursor-pointer">Plain text with pointer cursor (does nothing)</p>
                <p className="text-xs cursor-move">Display text with grabby cursor (does nothing)</p>
                <button className="h-8 px-3 rounded-md bg-bg-soft-200 text-text-soft-400 text-xs cursor-pointer" disabled>Disabled with pointer</button>
              </div>
            ),
            caption: "Don't apply `cursor-pointer` to non-interactive elements. User hovers, expects click, gets nothing — frustrating dead-end.",
          }}
        />
      </DocsSection>

      <DocsSection title="Drag affordance">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Use `cursor-grab` on draggable handles, `cursor-grabbing` while actively dragging. Don't use `move` for everything draggable.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center gap-2 cursor-grab"><span className="text-text-soft-400">⋮⋮</span><span className="text-xs">Sortable mitra row · grab</span></div>
            ),
            caption: "Six-dot handle paired with grab cursor on hover, grabbing during the drag. Predictable across the web.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center gap-2 cursor-move"><span className="text-text-soft-400">⋮⋮</span><span className="text-xs">Sortable mitra row · move</span></div>
            ),
            caption: "Don't use `cursor-move` for list reordering. `move` historically meant 'will move in any direction' — wrong semantic for vertical sortable.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}

function CursorTile({ cursor }: { cursor: Cursor }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      onClick={() => {
        if (typeof navigator !== "undefined") {
          navigator.clipboard?.writeText(cursor.tw)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }
      }}
      className={cn(
        "rounded-xl border border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50 p-3 text-left transition-colors",
        cursor.tw,
      )}
    >
      <div className="text-2xl mb-2 text-text-strong-950">{cursor.glyph}</div>
      <div className="text-sm font-medium text-text-strong-950">{cursor.label}</div>
      <code className="text-[11px] text-text-sub-600 tabular-nums">{cursor.tw}</code>
      <div className="text-[11px] text-text-soft-400 mt-1.5 line-clamp-2">{cursor.example}</div>
      {copied ? <div className="text-[10px] text-success-base mt-1">Copied!</div> : null}
    </button>
  )
}
