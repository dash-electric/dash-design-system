"use client"

import { useState } from "react"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/registry/dash/ui/context-menu"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ContextMenuDocsPage() {
  const [pin, setPin] = useState(true)
  const [showTribe, setShowTribe] = useState(false)

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Overlays"
        title="Context Menu"
        description="Right-click menu attached to a region. Use for table row actions, canvas tooling, file explorer. Built on Radix ContextMenu."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add context-menu`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Right-click on mitra row"
          preview={
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="flex h-32 w-full max-w-md cursor-context-menu items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-sm text-text-sub-600">
                  Klik kanan di sini (atau ctrl-click di Mac)
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>mtr-9412 · Sigit P.</ContextMenuLabel>
                <ContextMenuItem>
                  Lihat detail
                  <ContextMenuShortcut>⌘O</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem>Edit info</ContextMenuItem>
                <ContextMenuCheckboxItem checked={pin} onCheckedChange={setPin}>
                  Pin di list teratas
                </ContextMenuCheckboxItem>
                <ContextMenuCheckboxItem checked={showTribe} onCheckedChange={setShowTribe}>
                  Tampilkan tribe di kolom
                </ContextMenuCheckboxItem>
                <ContextMenuSeparator />
                <ContextMenuSub>
                  <ContextMenuSubTrigger>Pindahkan tribe</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem>Reservasi</ContextMenuItem>
                    <ContextMenuItem>Express</ContextMenuItem>
                    <ContextMenuItem>Bulk</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem destructive>
                  Suspend mitra
                  <ContextMenuShortcut>⌘⇧S</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          }
          code={`<ContextMenu>
  <ContextMenuTrigger asChild>
    <div>Klik kanan di sini</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuLabel>mtr-9412 · Sigit P.</ContextMenuLabel>
    <ContextMenuItem>Lihat detail</ContextMenuItem>
    <ContextMenuCheckboxItem checked>Pin di list teratas</ContextMenuCheckboxItem>
    <ContextMenuSeparator />
    <ContextMenuItem destructive>Suspend mitra</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`}
        />

        <DocsExample
          title="With radio group (priority picker)"
          preview={
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="flex h-24 w-full max-w-md cursor-context-menu items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-sm text-text-sub-600">
                  Klik kanan untuk set prioritas dispatch
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>Prioritas dispatch</ContextMenuLabel>
                <ContextMenuItem>Tinggi</ContextMenuItem>
                <ContextMenuItem>Normal</ContextMenuItem>
                <ContextMenuItem>Rendah</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Reset ke default</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          }
          code={`<ContextMenu>
  <ContextMenuTrigger>…</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuLabel>Prioritas dispatch</ContextMenuLabel>
    <ContextMenuItem>Tinggi</ContextMenuItem>
    <ContextMenuItem>Normal</ContextMenuItem>
    <ContextMenuItem>Rendah</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`}
        />

        <DocsExample
          title="Disabled items"
          preview={
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="flex h-24 w-full max-w-md cursor-context-menu items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-sm text-text-sub-600">
                  Klik kanan — beberapa item disabled
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Duplicate</ContextMenuItem>
                <ContextMenuItem disabled>Move (locked — Lebaran freeze)</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem disabled destructive>Delete (require admin)</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          }
          code={`<ContextMenuItem disabled>Move (locked)</ContextMenuItem>
<ContextMenuItem disabled destructive>Delete (require admin)</ContextMenuItem>`}
        />

        <DocsExample
          title="Table row context menu"
          description="Each row's right-click target hosts its own menu with row-specific actions."
          preview={
            <div className="w-full border border-stroke-soft-200 rounded-lg overflow-hidden bg-bg-white-0">
              {[
                { id: "mtr-9412", name: "Sigit P." },
                { id: "mtr-9419", name: "Andi W." },
                { id: "mtr-9425", name: "Rina S." },
              ].map((r) => (
                <ContextMenu key={r.id}>
                  <ContextMenuTrigger asChild>
                    <div className="grid grid-cols-2 px-3 py-2 text-sm border-b last:border-b-0 border-stroke-soft-200 cursor-context-menu hover:bg-bg-weak-50">
                      <div className="">{r.id}</div>
                      <div>{r.name}</div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuLabel>{r.id}</ContextMenuLabel>
                    <ContextMenuItem>Lihat detail</ContextMenuItem>
                    <ContextMenuItem>Send message</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem destructive>Suspend mitra</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          }
          code={`{rows.map(row => (
  <ContextMenu key={row.id}>
    <ContextMenuTrigger asChild>
      <div>{row.id} · {row.name}</div>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuLabel>{row.id}</ContextMenuLabel>
      <ContextMenuItem>Lihat detail</ContextMenuItem>
      <ContextMenuItem destructive>Suspend</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
))}`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Context menu = shortcut untuk action yang sudah ada di UI. Bukan satu-satunya cara akses fitur.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-0.5 text-xs rounded border border-stroke-soft-200 bg-bg-weak-50 p-1">
                <div className="rounded px-2 py-1.5">Buka detail mitra</div>
                <div className="rounded px-2 py-1.5">Reassign trip</div>
                <div className="border-t border-stroke-soft-200 my-1" />
                <div className="rounded px-2 py-1.5 text-error-dark">Suspend mitra</div>
              </div>
            ),
            caption: "Action grouped: navigasi → edit → destructive di bawah (separator). Pattern familiar dari OS-level menu.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-0.5 text-xs rounded border border-stroke-soft-200 bg-bg-weak-50 p-1">
                <div className="rounded px-2 py-1.5 text-error-dark">Suspend mitra</div>
                <div className="rounded px-2 py-1.5">Edit</div>
                <div className="rounded px-2 py-1.5">View</div>
                <div className="rounded px-2 py-1.5 text-error-dark">Hapus permanen</div>
                <div className="rounded px-2 py-1.5">Export</div>
              </div>
            ),
            caption: "Hindari destructive action di posisi pertama atau scattered. Salah klik = mitra ke-suspend tanpa konfirmasi.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Setiap context-menu action HARUS ada juga di toolbar/overflow menu. Right-click = shortcut, bukan exclusive path.",
          }}
          dont={{
            caption: "Jangan sembunyikan action critical (Cancel delivery) hanya di context-menu. User mobile tanpa mouse tidak bisa akses.",
          }}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>ContextMenu</strong> — root, owns open state per trigger area.</li>
          <li className="pl-4">├ <strong>ContextMenuTrigger</strong> — the region that listens for right-click / long-press.</li>
          <li className="pl-4">└ <strong>ContextMenuContent</strong> — menu surface, portal-rendered.</li>
          <li className="pl-8">├ <strong>ContextMenuLabel</strong> — non-interactive section header.</li>
          <li className="pl-8">├ <strong>ContextMenuItem</strong> — clickable action. Pass <code className="text-xs">destructive</code> for the red tone.</li>
          <li className="pl-8">├ <strong>ContextMenuCheckboxItem</strong> — toggleable option with checkmark.</li>
          <li className="pl-8">├ <strong>ContextMenuSeparator</strong> — visual divider between groups.</li>
          <li className="pl-8">├ <strong>ContextMenuShortcut</strong> — trailing keyboard shortcut hint.</li>
          <li className="pl-8">└ <strong>ContextMenuSub</strong> + <strong>SubTrigger</strong> + <strong>SubContent</strong> — nested submenu.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "asChild", type: "boolean", description: "On Trigger — wrap consumer element instead of default span." },
            { name: "destructive", type: "boolean", description: "On Item — destructive tone (red)." },
            { name: "inset", type: "boolean", description: "On Item/Label — adds left-padding for alignment with checkbox/radio rows." },
            { name: "disabled", type: "boolean", description: "On Item — disable interaction." },
            { name: "checked", type: "boolean", description: "On CheckboxItem — controlled state." },
            { name: "onCheckedChange", type: "(checked: boolean) => void", description: "On CheckboxItem — state change callback." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <p className="text-sm text-text-sub-600">Built on <a href="https://www.radix-ui.com/primitives/docs/components/context-menu" target="_blank" rel="noreferrer" className="underline">Radix ContextMenu</a>.</p>
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Trigger</strong> — listens for <code className="text-xs">contextmenu</code> event (right-click on desktop, long-press on touch).</li>
          <li>• <strong>Role</strong> — Content is <code className="text-xs">role=&quot;menu&quot;</code>; items are <code className="text-xs">role=&quot;menuitem&quot;</code> / <code className="text-xs">menuitemcheckbox</code> / <code className="text-xs">menuitemradio</code>.</li>
          <li>• <strong>Keyboard</strong>
            <ul className="ml-5 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li>Open via <code className="text-xs">Shift+F10</code> or <code className="text-xs">Menu</code> key when the trigger has focus.</li>
              <li><code className="text-xs">↑</code> / <code className="text-xs">↓</code> walks items. <code className="text-xs">→</code> opens submenu, <code className="text-xs">←</code> closes it.</li>
              <li><code className="text-xs">Enter</code> / <code className="text-xs">Space</code> activates the focused item.</li>
              <li><code className="text-xs">Esc</code> closes the menu.</li>
              <li>Type-ahead — typing a letter focuses the next item starting with it.</li>
            </ul>
          </li>
          <li>• <strong>Focus management</strong> — on close, focus returns to the trigger region.</li>
          <li>• <strong>Touch users</strong> — provide an alternative trigger (kebab menu / row hover action) since long-press is discoverable only by a fraction of users.</li>
          <li>• <strong>Reduced motion</strong> — menu fade-in respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
