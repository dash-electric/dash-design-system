"use client"

import { useState } from "react"
import { RiTruckLine as Truck, RiUserLine as User, RiSettings3Line as Settings, RiBankCardLine as CreditCard, RiNotification3Line as Bell, RiLogoutBoxLine as LogOut, RiAddLine as Plus, RiMapPinLine as MapPin, RiFilter3Line as Filter, RiEyeLine as Eye, RiPencilLine as Pencil, RiDeleteBinLine as Trash2, RiArrowDownSLine as ChevronDown, RiSunLine as Sun, RiMoonLine as Moon, RiComputerLine as Monitor } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRichItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/registry/dash/ui/dropdown-menu"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function DropdownMenuDocsPage() {
  const [showSurge, setShowSurge] = useState(true)
  const [showSuspended, setShowSuspended] = useState(false)
  const [theme, setTheme] = useState("system")

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Overlay"
        title="Dropdown Menu"
        description="Action menu anchored to a trigger. Use it on row-level actions (mitra rows, dispatch entries), filter chips, profile menus — anywhere a list of one-tap commands belongs near its anchor."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add dropdown-menu`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Compound. Always renders <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">DropdownMenu</code> (root) wrapping a <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">DropdownMenuTrigger</code> and a <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">DropdownMenuContent</code> portal. Inside the content panel, choose the right item primitive per row.
        </p>
        <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-weak-50">
              <tr className="text-left">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400 w-1/3">Part</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">Use for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-soft-200">
              {[
                ["DropdownMenu", "Root provider. Owns open/closed state."],
                ["DropdownMenuTrigger", "Clickable opener. Wrap a Button via asChild."],
                ["DropdownMenuContent", "Portalled panel. Set align/sideOffset here."],
                ["DropdownMenuLabel", "Non-interactive group heading (e.g. “Actions”)."],
                ["DropdownMenuItem", "Plain action row. Pair with a leading icon."],
                ["DropdownMenuRichItem", "Two-line row with icon + description + shortcut."],
                ["DropdownMenuCheckboxItem", "Toggleable row (multi-select preference)."],
                ["DropdownMenuRadioGroup / RadioItem", "Single-choice cluster (theme picker)."],
                ["DropdownMenuSub / SubTrigger / SubContent", "One level of nested menu (e.g. “More”)."],
                ["DropdownMenuSeparator", "Horizontal divider between groups."],
                ["DropdownMenuShortcut", "Trailing kbd hint inside an item."],
              ].map(([part, use]) => (
                <tr key={part} className="align-top">
                  <td className="px-4 py-3 text-xs text-text-strong-950">{part}</td>
                  <td className="px-4 py-3 text-text-sub-600 leading-relaxed">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/registry/dash/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuItem><Eye /><span>View</span></DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Mitra row actions"
          preview={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button rightIcon={<ChevronDown />}>Mitra actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>mtr-9412 · Reservasi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye />
                  <span>View profile</span>
                  <DropdownMenuShortcut>↵</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil />
                  <span>Edit policy</span>
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MapPin />
                  <span>Locate now</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive>
                  <Trash2 />
                  <span>Suspend permanently</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button rightIcon={<ChevronDown />}>Mitra actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start" className="w-56">
    <DropdownMenuLabel>mtr-9412 · Reservasi</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem><Eye /><span>View profile</span><DropdownMenuShortcut>↵</DropdownMenuShortcut></DropdownMenuItem>
    <DropdownMenuItem><Pencil /><span>Edit policy</span><DropdownMenuShortcut>⌘E</DropdownMenuShortcut></DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem destructive><Trash2 /><span>Suspend permanently</span></DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        />

        <DocsExample
          title="Profile menu with rich item"
          preview={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button tone="neutral" style="stroke" rightIcon={<ChevronDown />}>
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuRichItem icon={<User />} description="Reservasi tribe · ops">
                  Fayzul
                </DropdownMenuRichItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Settings /><span>Workspace settings</span></DropdownMenuItem>
                <DropdownMenuItem><CreditCard /><span>Billing &amp; payouts</span></DropdownMenuItem>
                <DropdownMenuItem><Bell /><span>Notifications</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive><LogOut /><span>Sign out</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          code={`<DropdownMenuRichItem icon={<User />} description="Reservasi tribe · ops">
  Fayzul
</DropdownMenuRichItem>`}
        />

        <DocsExample
          title="Dispatch type picker (rich items)"
          preview={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button leftIcon={<Plus />} rightIcon={<ChevronDown />}>New dispatch</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="start">
                <DropdownMenuRichItem icon={<Truck />} description="Routes to nearest mitra in < 60 seconds." shortcut="⌘1">
                  Instant dispatch
                </DropdownMenuRichItem>
                <DropdownMenuRichItem icon={<MapPin />} description="Pre-scheduled. Mitra accepts up to 30 minutes before pickup." shortcut="⌘2">
                  Reservasi
                </DropdownMenuRichItem>
                <DropdownMenuRichItem icon={<Truck />} description="Multi-stop within Jakarta service area." shortcut="⌘3">
                  Express batch
                </DropdownMenuRichItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          code={`<DropdownMenuRichItem
  icon={<Truck />}
  description="Routes to nearest mitra in < 60 seconds."
  shortcut="⌘1"
>
  Instant dispatch
</DropdownMenuRichItem>`}
        />

        <DocsExample
          title="Checkbox + Radio items"
          preview={
            <div className="flex flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button tone="neutral" style="stroke" leftIcon={<Filter />} rightIcon={<ChevronDown />}>
                    Filter dispatches
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60" align="start">
                  <DropdownMenuLabel>Status flags</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem checked={showSurge} onCheckedChange={(v) => setShowSurge(v === true)}>
                    Show surge zones
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={showSuspended} onCheckedChange={(v) => setShowSuspended(v === true)}>
                    Include suspended mitra
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button tone="neutral" style="stroke" leftIcon={<Sun />} rightIcon={<ChevronDown />}>
                    Theme: {theme}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44" align="start">
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light"><Sun className="!size-3.5" />Light</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark"><Moon className="!size-3.5" />Dark</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system"><Monitor className="!size-3.5" />System</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
          code={`<DropdownMenuCheckboxItem
  checked={showSurge}
  onCheckedChange={(v) => setShowSurge(v === true)}
>
  Show surge zones
</DropdownMenuCheckboxItem>

<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
  <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
  <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
</DropdownMenuRadioGroup>`}
        />

        <DocsExample
          title="Sub menu"
          preview={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button tone="neutral" style="stroke" rightIcon={<ChevronDown />}>Trip actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem><Eye /><span>View trip detail</span></DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><Truck /><span>Reassign to tribe</span></DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Reservasi</DropdownMenuItem>
                    <DropdownMenuItem>Express</DropdownMenuItem>
                    <DropdownMenuItem>Tribe-Express</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><Filter /><span>Export</span></DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>CSV</DropdownMenuItem>
                    <DropdownMenuItem>JSON</DropdownMenuItem>
                    <DropdownMenuItem>Halo-dash report</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive><Trash2 /><span>Cancel trip</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          code={`<DropdownMenuSub>
  <DropdownMenuSubTrigger>
    <Truck /><span>Reassign to tribe</span>
  </DropdownMenuSubTrigger>
  <DropdownMenuSubContent>
    <DropdownMenuItem>Reservasi</DropdownMenuItem>
    <DropdownMenuItem>Express</DropdownMenuItem>
  </DropdownMenuSubContent>
</DropdownMenuSub>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "asChild", type: "boolean", description: "Forward to child element. On DropdownMenuTrigger." },
            { name: "align", type: '"start" | "center" | "end"', defaultValue: '"center"', description: "Horizontal alignment. On DropdownMenuContent." },
            { name: "destructive", type: "boolean", defaultValue: "false", description: "Red text + hover. On DropdownMenuItem." },
            { name: "inset", type: "boolean", defaultValue: "false", description: "Pad-left so item aligns with iconed siblings. On DropdownMenuItem." },
            { name: "checked", type: "boolean", description: "Toggle state. On DropdownMenuCheckboxItem." },
            { name: "icon", type: "ReactNode", description: "Leading icon. On DropdownMenuRichItem." },
            { name: "description", type: "ReactNode", description: "Sub-line copy. On DropdownMenuRichItem." },
            { name: "shortcut", type: "ReactNode", description: "Trailing kbd. On DropdownMenuRichItem." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Dropdown menu attached ke trigger button — bukan untuk navigation utama atau form input.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-0.5 text-xs rounded border border-stroke-soft-200 bg-bg-weak-50 p-1">
                <div className="text-[10px] uppercase text-text-soft-400 px-2 pt-1">Aksi mitra</div>
                <div className="rounded px-2 py-1.5">Buka profil</div>
                <div className="rounded px-2 py-1.5">Reassign trip</div>
                <div className="border-t border-stroke-soft-200 my-1" />
                <div className="rounded px-2 py-1.5 text-error-dark">Suspend permanent</div>
              </div>
            ),
            caption: "Group items dengan label, destructive di bottom separator. 3-6 item per dropdown ideal.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs rounded border border-stroke-soft-200 bg-bg-weak-50 p-1 max-h-32 overflow-hidden">
                {Array.from({length: 12}, (_, i) => <div key={i} className="px-2 py-1">Action #{i+1}</div>)}
              </div>
            ),
            caption: "Hindari 10+ item flat. Itu butuh Command palette atau sub-menu, bukan dropdown.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Pakai untuk action contextual (per row, per item). Contoh: kebab menu di mitra row tabel.",
          }}
          dont={{
            caption: "Jangan pakai untuk pilih opsi form value (Active/Suspended/Pending). Itu Select, bukan Dropdown Menu.",
          }}
        />
      </DocsSection>

      <DocsSection title="Rules">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Cap each group at ~6 items.</li>
          <li>• One destructive item per menu, bottom, separated.</li>
          <li>• RichItem only when description adds disambiguation.</li>
          <li>• Submenus max one level deep.</li>
          <li>• Shortcut chips only on items with real handlers.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <p className="text-sm text-text-sub-600">Built on <a href="https://www.radix-ui.com/primitives/docs/components/dropdown-menu" target="_blank" rel="noreferrer" className="underline">Radix DropdownMenu</a>.</p>
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — Content is <code className="text-xs">role=&quot;menu&quot;</code>; items are <code className="text-xs">menuitem</code> / <code className="text-xs">menuitemcheckbox</code> / <code className="text-xs">menuitemradio</code>.</li>
          <li>• <strong>Trigger</strong> — gets <code className="text-xs">aria-haspopup=&quot;menu&quot;</code> + <code className="text-xs">aria-expanded</code> auto-wired.</li>
          <li>• <strong>Keyboard</strong>
            <ul className="ml-5 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li><code className="text-xs">Enter</code> / <code className="text-xs">Space</code> / <code className="text-xs">↓</code> opens the menu and focuses the first item.</li>
              <li><code className="text-xs">↑</code> / <code className="text-xs">↓</code> walks items, looping at edges.</li>
              <li><code className="text-xs">→</code> opens a submenu; <code className="text-xs">←</code> closes it.</li>
              <li><code className="text-xs">Enter</code> / <code className="text-xs">Space</code> activates the focused item.</li>
              <li><code className="text-xs">Esc</code> closes the menu and returns focus to the trigger.</li>
              <li>Type-ahead — typing a letter focuses the next item starting with it.</li>
            </ul>
          </li>
          <li>• <strong>ARIA you add</strong>
            <ul className="ml-5 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li>Icon-only Trigger requires <code className="text-xs">aria-label</code>.</li>
              <li>Use DropdownMenuLabel to group items semantically (renders <code className="text-xs">role=&quot;presentation&quot;</code>).</li>
            </ul>
          </li>
          <li>• <strong>Focus trap</strong> — focus stays inside the menu while open; outside clicks close it.</li>
          <li>• <strong>Reduced motion</strong> — open/close fade respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
