"use client"

import { Kbd } from "@/registry/dash/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/registry/dash/ui/tooltip"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function KbdDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Displaying Data"
        title="Kbd"
        description="Keyboard key glyph. Pair with Command Menu hints, Tooltip shortcuts, and settings docs to surface the canonical chord for an action."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add kbd`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { Kbd } from "@/registry/dash/ui/kbd"

<p>Tekan <Kbd>⌘</Kbd> <Kbd>K</Kbd> untuk command menu.</p>`}
        />
      </DocsSection>

      <DocsSection title="Examples" description="Inline runs, chord stacks, and Halo-dash live keyboard hints.">
        <DocsExample
          title="Inline shortcut"
          preview={
            <p className="text-sm text-text-strong-950 leading-relaxed">
              Tekan <Kbd>⌘</Kbd> <Kbd>K</Kbd> untuk buka command menu Dash, atau{" "}
              <Kbd>⌘</Kbd> <Kbd>⇧</Kbd> <Kbd>S</Kbd> untuk suspend mitra terpilih.
            </p>
          }
          code={`<p>
  Tekan <Kbd>⌘</Kbd> <Kbd>K</Kbd> untuk command menu, atau{" "}
  <Kbd>⌘</Kbd> <Kbd>⇧</Kbd> <Kbd>S</Kbd> untuk suspend mitra terpilih.
</p>`}
        />

        <DocsExample
          title="Sizes"
          description="Three glyph sizes — match to surrounding type scale."
          preview={
            <div className="flex items-center gap-3">
              <Kbd size="sm">Esc</Kbd>
              <Kbd size="md">Enter</Kbd>
              <Kbd size="lg">⌘ K</Kbd>
            </div>
          }
          code={`<Kbd size="sm">Esc</Kbd>
<Kbd size="md">Enter</Kbd>
<Kbd size="lg">⌘ K</Kbd>`}
        />

        <DocsExample
          title="Inside a Tooltip"
          description="Hint chord for an icon-only action. Common pattern in Halo-dash toolbars."
          preview={
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button tone="neutral" style="stroke" size="sm">Suspend mitra</Button>
                </TooltipTrigger>
                <TooltipContent className="flex items-center gap-2">
                  Suspend mitra
                  <span className="flex items-center gap-1">
                    <Kbd size="sm">⌘</Kbd>
                    <Kbd size="sm">⇧</Kbd>
                    <Kbd size="sm">S</Kbd>
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
          code={`<TooltipContent>
  Suspend mitra
  <Kbd size="sm">⌘</Kbd> <Kbd size="sm">⇧</Kbd> <Kbd size="sm">S</Kbd>
</TooltipContent>`}
        />

        <DocsExample
          title="Command menu footer"
          description="Bottom-of-palette hint strip; matches the cmdk + Dash command menu layout."
          preview={
            <div className="w-full max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 flex items-center justify-between text-xs text-text-sub-600">
              <span>3 hasil untuk &ldquo;mitra-9412&rdquo;</span>
              <span className="flex items-center gap-1.5">
                <Kbd size="sm">↑</Kbd>
                <Kbd size="sm">↓</Kbd>
                navigasi
                <span className="mx-2 text-text-soft-400">·</span>
                <Kbd size="sm">↵</Kbd>
                pilih
                <span className="mx-2 text-text-soft-400">·</span>
                <Kbd size="sm">Esc</Kbd>
                tutup
              </span>
            </div>
          }
          code={`<div className="flex items-center gap-1.5 text-xs">
  <Kbd size="sm">↑</Kbd> <Kbd size="sm">↓</Kbd> navigasi
  <Kbd size="sm">↵</Kbd> pilih
  <Kbd size="sm">Esc</Kbd> tutup
</div>`}
        />

        <DocsExample
          title="Chord with non-modifier key"
          preview={
            <p className="text-sm text-text-strong-950">
              Quick search: <Kbd>/</Kbd> · New dispatch: <Kbd>N</Kbd> · Help: <Kbd>?</Kbd>
            </p>
          }
          code={`Quick search: <Kbd>/</Kbd>
New dispatch: <Kbd>N</Kbd>
Help: <Kbd>?</Kbd>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Kbd menampilkan keycap glyph. Satu Kbd per tombol, dipisah spasi. Gunakan untuk shortcut yang BENAR-BENAR aktif (terhubung listener). Jangan dipakai sebagai dekorasi.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <p className="text-xs text-text-strong-950">
                Suspend mitra: <Kbd size="sm">⌘</Kbd> <Kbd size="sm">⇧</Kbd> <Kbd size="sm">S</Kbd>
              </p>
            ),
            caption: "Satu Kbd per tombol, dipisah spasi. User dengan keyboard tahu chord exact. Pair dengan real hotkey listener.",
          }}
          dont={{
            preview: (
              <p className="text-xs text-text-strong-950">
                Suspend mitra: <Kbd size="sm">⌘+⇧+S</Kbd>
              </p>
            ),
            caption: "Tiga key dalam satu Kbd dengan '+' = bukan visual keycap, jadi text biasa. Pisah jadi 3 Kbd.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs text-text-sub-600 flex items-center gap-1.5">
                <Kbd size="sm">↑</Kbd> <Kbd size="sm">↓</Kbd> navigasi
                <span className="text-text-soft-400">·</span>
                <Kbd size="sm">↵</Kbd> pilih
                <span className="text-text-soft-400">·</span>
                <Kbd size="sm">Esc</Kbd> tutup
              </div>
            ),
            caption: "Footer command palette dengan shortcut hint. Unicode glyph (↑ ↓ ↵) konsisten dengan macOS menu.",
          }}
          dont={{
            preview: (
              <p className="text-xs">
                Halaman dashboard <Kbd size="sm">Cool</Kbd> dengan <Kbd size="sm">Mitra</Kbd> aktif
              </p>
            ),
            caption: "Kbd untuk teks biasa ('Cool', 'Mitra') = misleading. Kbd HANYA untuk keyboard key glyph yang real.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Glyph size." },
            { name: "className", type: "string", description: "Extend or override classes." },
            { name: "children", type: "ReactNode", description: "Key glyph — symbol (⌘), letter (K), or word (Esc)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Renders a semantic <code className="text-xs">&lt;kbd&gt;</code> element so screen readers and copy-paste treat the content as a key glyph.</li>
          <li>• Uses tabular-friendly monospace font + 1-pixel inset bottom shadow to feel like a physical keycap.</li>
          <li>• Display one key per <code className="text-xs">Kbd</code>. Compose a chord with a space between siblings — never use <code className="text-xs">+</code> in the glyph body.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Semantic <code className="text-xs">&lt;kbd&gt;</code> tag — screen readers announce content as a keyboard key.</li>
          <li>• Pair every visual shortcut with a real listener (cmdk, react-hotkeys-hook). Do not rely on Kbd alone as a control.</li>
          <li>• Use the Unicode glyph (<code className="text-xs">⌘ ⇧ ⌥ ⌃ ↵ ↑ ↓ ← →</code>) over ASCII for parity with macOS menus.</li>
          <li>• Provide a Windows fallback (<code className="text-xs">Ctrl</code> / <code className="text-xs">Alt</code>) when the audience is cross-platform — branch on <code className="text-xs">navigator.userAgent</code> or a stored preference.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
