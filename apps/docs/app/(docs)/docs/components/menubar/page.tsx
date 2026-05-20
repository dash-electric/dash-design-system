"use client"

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarShortcut,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarCheckboxItem,
} from "@/registry/dash/ui/menubar"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function MenubarDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Navigation"
        title="Menubar"
        description="Persistent horizontal menubar — desktop app conventions (File / Edit / View). Hover switches active menu. Use for Halo-dash power user shell."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add menubar`} />
      </DocsSection>

      <DocsSection title="Example">
        <DocsExample
          title="Halo-dash menubar"
          preview={
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>New ticket <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
                  <MenubarItem>Open mitra <MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Export CSV</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
                  <MenubarItem>Redo <MenubarShortcut>⌘⇧Z</MenubarShortcut></MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarCheckboxItem checked>Show suspended</MenubarCheckboxItem>
                  <MenubarCheckboxItem>Show tribe column</MenubarCheckboxItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>Layout</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>3-pane</MenubarItem>
                      <MenubarItem>2-pane</MenubarItem>
                      <MenubarItem>Single column</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          }
          code={`<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New ticket <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Export CSV</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  …
</Menubar>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Menubar = desktop power-user shell. Top of screen, persistent, multi-menu sibling. Bukan untuk web app casual.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md flex gap-1 text-xs px-2 py-1 rounded border border-stroke-soft-200 bg-bg-weak-50">
                {["Dispatch", "Mitra", "Outlet", "Laporan"].map(m => (
                  <div key={m} className="px-2 py-1 hover:bg-bg-white-0 rounded">{m}</div>
                ))}
              </div>
            ),
            caption: "Menubar untuk Halo-dash support tool yang dispatcher pakai 8 jam/hari. Familiar OS pattern, keyboard-driven.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md flex gap-1 text-xs px-2 py-1 rounded border border-stroke-soft-200 bg-bg-weak-50">
                <div className="px-2 py-1">Menu</div>
              </div>
            ),
            caption: "Jangan pakai Menubar untuk landing page atau dashboard customer. Itu pakai NavigationMenu (clearer hierarchy).",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Group action per domain: File (export/import), Edit (cut/copy), View (toggle column), Mitra (suspend/reactivate). Konsisten lintas app.",
          }}
          dont={{
            caption: "Jangan stuff 8 menu items langsung di Menubar tanpa sub-menu. Itu jadi navbar, bukan menubar.",
          }}
        />
      </DocsSection>

      <DocsSection title="When to use vs Dropdown Menu">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Menubar</strong> = persistent multi-menu bar (desktop power-user app).</li>
          <li>• <strong>Dropdown Menu</strong> = on-demand single menu attached to a trigger button.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold text-text-strong-950 pt-2">Menubar</h3>
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Controlled currently-open menu id." },
            { name: "onValueChange", type: "(value: string) => void", description: "Open-menu change callback." },
            { name: "loop", type: "boolean", defaultValue: "true", description: "Wrap focus on Arrow nav." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">MenubarMenu / MenubarTrigger / MenubarContent</h3>
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Identifies the menu (used for controlled state)." },
            { name: "side / align / sideOffset", type: "see Dropdown", description: "Positioning props on MenubarContent." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">Item variants</h3>
        <DocsPropsTable
          rows={[
            { name: "MenubarItem", type: "leaf", description: "Standard click item." },
            { name: "MenubarCheckboxItem", type: "stateful", description: "Toggleable; uses checked + onCheckedChange." },
            { name: "MenubarRadioItem", type: "stateful", description: "Use inside MenubarRadioGroup with value." },
            { name: "MenubarSub", type: "nested", description: "Wrap SubTrigger + SubContent for cascading menus." },
            { name: "MenubarShortcut", type: "decoration", description: "Right-aligned shortcut text." },
            { name: "MenubarSeparator", type: "divider", description: "Hairline between sections." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <code className="text-xs">Menubar</code> — container holding multiple <code className="text-xs">MenubarMenu</code> entries.</li>
          <li>• Each <code className="text-xs">MenubarMenu</code> = one top-level entry (File / Edit / View).</li>
          <li>• Hover automatically opens adjacent menu when one is already open.</li>
          <li>• Composes <code className="text-xs">MenubarSub</code> for nested cascades; <code className="text-xs">MenubarCheckboxItem</code> / <code className="text-xs">MenubarRadioItem</code> for stateful toggles.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Built on Radix Menubar — full WAI-ARIA menubar pattern.</li>
          <li>• Keyboard: <code className="text-xs">Tab</code> enters bar; <code className="text-xs">Arrow Left/Right</code> moves between menus; <code className="text-xs">Arrow Down</code> opens; <code className="text-xs">Enter</code> activates; <code className="text-xs">Esc</code> closes.</li>
          <li>• Type-ahead: typing a letter focuses the matching menu item.</li>
          <li>• Each Item has the right ARIA role (<code className="text-xs">menuitem</code> / <code className="text-xs">menuitemcheckbox</code> / <code className="text-xs">menuitemradio</code>).</li>
          <li>• Pair shortcut chord (Kbd / MenubarShortcut) with a real listener — visual chord without functionality is misleading.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
