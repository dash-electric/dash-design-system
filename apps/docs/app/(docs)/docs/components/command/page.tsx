"use client"

import * as React from "react"
import {
  RiSearchLine as Search,
  RiInformationLine as Info,
  RiCloseLine as Close,
  RiArrowUpLine as ArrowUp,
  RiArrowDownLine as ArrowDown,
  RiCornerDownLeftLine as Enter,
  RiUser3Line as UserIcon,
  RiArrowRightSLine as ChevronRight,
} from "@remixicon/react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  CommandKbd,
} from "@/registry/dash/ui/command"
import { Avatar, AvatarImage, AvatarFallback, AvatarIndicator } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Command Menu — Figma 1:1 (14 nodes verified 2026-05-18).
 *
 *   4187:559        Search trigger input — 3 states (default/hover/focus + close)
 *   4171:15653      Item leading-icon spec (none/icon/avatar/brand) × description
 *   4172:16590      Item layout spec — title + description + chevron
 *   4222:43176      Master command palette LIGHT
 *   4222:43178      same DARK
 *   166999:147581   "What are you looking for?" — filter chips + History + Results + footer
 *   166999:147729   same content, expanded state
 *   166999:147877   same DARK
 *   166824:17370    HR Tools palette — Recent chips + 4 multi-column groups + footer
 *   166824:17462    same expanded
 *   166824:17615    same DARK
 *   166824:17713    same different focus
 *   166824:17552    same alt
 *   166824:17802    same DARK alt
 */

const SearchTrigger = ({
  label = "Search or jump to",
  focused = false,
  showClose = false,
  onClick,
}: {
  label?: string
  focused?: boolean
  showClose?: boolean
  onClick?: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "flex items-center gap-2 w-full h-10 px-3 rounded-md bg-bg-white-0 text-sm transition-colors",
      focused ? "border-2 border-primary" : "border border-stroke-soft-200 hover:border-stroke-sub-300",
    ].join(" ")}
  >
    <Search className={["size-4", focused ? "text-primary" : "text-icon-soft-400"].join(" ")} />
    <span className={["flex-1 text-left", focused ? "text-text-strong-950" : "text-text-soft-400"].join(" ")}>
      {label}
    </span>
    <CommandKbd className="border border-stroke-soft-200">⌘K</CommandKbd>
    {showClose ? (
      <Close className="size-4 text-icon-soft-400" />
    ) : (
      <Info className="size-4 text-icon-soft-400" />
    )}
  </button>
)

const PaletteShell = ({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) => (
  <div className="max-w-xl rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-(--shadow-custom-md) overflow-hidden">
    {children}
    {footer ? <div className="border-t border-stroke-soft-200 px-4 py-2.5 flex items-center justify-between text-xs text-text-sub-600">{footer}</div> : null}
  </div>
)

const FilterChip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-bg-weak-50 px-2.5 py-1 text-xs text-text-strong-950">
    {children}
    <button aria-label="Remove filter" className="text-icon-soft-400 hover:text-text-strong-950"><Close className="size-3" /></button>
  </span>
)

const KbdHint = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="inline-flex items-center justify-center size-5 rounded border border-stroke-soft-200 text-[10px] text-text-sub-600">
      {icon}
    </span>
    <span>{label}</span>
  </span>
)

export default function CommandDocsPage() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Navigation"
        title="Command Menu"
        description="Keyboard-first launcher. Triggered by a search input or ⌘K. Built on cmdk + Radix Dialog. Supports leading icons / avatars, descriptions, group headings, dismissible filter chips, multi-column layouts, and a kbd-hint footer."
      />

      <DocsSection title="Search trigger">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          3 states: default (gray border + ⌘K kbd + info), hover (darker border), focus (primary border + close X). Click opens the command dialog.
        </p>
        <DocsExample
          title="default / hover / focus"
          preview={
            <div className="space-y-3 max-w-md p-4 bg-bg-weak-50 rounded-xl">
              <SearchTrigger />
              <SearchTrigger />
              <SearchTrigger focused showClose />
            </div>
          }
          code={`<button className="flex items-center gap-2 h-10 px-3 rounded-md border bg-bg-white-0">
  <Search /> Search or jump to
  <CommandKbd>⌘K</CommandKbd>
  <Info /> or <Close />
</button>`}
        />
      </DocsSection>

      <DocsSection title="Item leading variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Items support 4 leading visuals: none / icon / avatar / brand mark. Optional 2-line description below the label. Trailing chevron indicates drill-down.
        </p>
        <DocsExample
          title="Layout spec"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
              {[
                { lead: null,                                                                                                          desc: false },
                { lead: null,                                                                                                          desc: true  },
                { lead: <UserIcon className="size-4 text-icon-soft-400" />,                                                              desc: false },
                { lead: <UserIcon className="size-4 text-icon-soft-400" />,                                                              desc: true  },
                { lead: <Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/80?u=arthur" /><AvatarFallback>A</AvatarFallback></Avatar>, desc: false },
                { lead: <Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/80?u=arthur" /><AvatarFallback>A</AvatarFallback><AvatarIndicator tone="online" size="sm" /></Avatar>, desc: true },
                { lead: <span className="size-7 rounded-full bg-(--state-success-base) inline-flex items-center justify-center text-static-white text-xs">♪</span>, desc: false },
                { lead: <span className="size-7 rounded-full bg-(--state-information-base) inline-flex items-center justify-center text-static-white text-xs">▼</span>, desc: true  },
              ].map((c, i) => (
                <div key={i} className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 flex items-center gap-3 text-sm">
                  {c.lead}
                  <div className="flex-1 min-w-0">
                    <div className="text-text-strong-950">Label</div>
                    {c.desc ? <div className="text-xs text-text-soft-400">Insert description here.</div> : null}
                  </div>
                  <ChevronRight className="size-4 text-icon-soft-400" />
                </div>
              ))}
            </div>
          }
          code={`<CommandItem>
  <Avatar size="sm">...</Avatar>
  <div>
    <div>Label</div>
    <div className="text-xs text-text-soft-400">Insert description here.</div>
  </div>
  <ChevronRight />
</CommandItem>`}
        />
      </DocsSection>

      <DocsSection title="Master palette">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Full command palette in a Dialog. Press <kbd className="text-[10px] px-1 py-0.5 rounded bg-bg-weak-50 border border-stroke-soft-200">⌘K</kbd> or click to open.
        </p>
        <DocsExample
          title="Open dialog"
          preview={
            <div className="flex items-center gap-3">
              <Button tone="neutral" style="stroke" onClick={() => setOpen(true)} leftIcon={<Search />}>Open command menu (⌘K)</Button>
              <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Quick actions">
                    <CommandItem onSelect={() => setOpen(false)}>Create new project<CommandShortcut>⌘N</CommandShortcut></CommandItem>
                    <CommandItem onSelect={() => setOpen(false)}>Invite teammate<CommandShortcut>⌘I</CommandShortcut></CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => setOpen(false)}>Go to Dashboard</CommandItem>
                    <CommandItem onSelect={() => setOpen(false)}>Go to Settings</CommandItem>
                  </CommandGroup>
                </CommandList>
              </CommandDialog>
            </div>
          }
          code={`const [open, setOpen] = useState(false)

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Quick actions">
      <CommandItem>Create new project <CommandShortcut>⌘N</CommandShortcut></CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`}
        />
      </DocsSection>

      <DocsSection title="Filter chips + History + Results">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          People-search palette with dismissible scope filters at top, History group, Results count, and keyboard-hint footer with Help Center fallback link.
        </p>
        <DocsExample
          title="People search"
          preview={
            <PaletteShell
              footer={
                <>
                  <div className="flex items-center gap-3">
                    <KbdHint icon={<ArrowUp className="size-3" />} label="" /> <KbdHint icon={<ArrowDown className="size-3" />} label="Navigate" />
                    <KbdHint icon={<Enter className="size-3" />} label="Select" />
                  </div>
                  <span>Not what you&apos;re looking for? Try the <a href="#" className="text-primary underline underline-offset-2">Help Center</a></span>
                </>
              }
            >
              <Command className="h-auto">
                <CommandInput placeholder="Search" />
                <div className="border-b border-stroke-soft-200 px-4 py-3 space-y-2">
                  <div className="text-xs text-text-soft-400">What are you looking for?</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <FilterChip>People</FilterChip>
                    <FilterChip>Files</FilterChip>
                    <FilterChip>Emails</FilterChip>
                    <FilterChip>Actions</FilterChip>
                  </div>
                </div>
                <CommandList className="max-h-[400px]">
                  <CommandGroup heading={<div className="flex items-center justify-between w-full"><span>History</span><a href="#" className="text-xs text-primary">See All</a></div>}>
                    <CommandItem>
                      <Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/80?u=james-cm" /><AvatarFallback>JB</AvatarFallback></Avatar>
                      <span>James Brown</span>
                      <span className="ml-auto text-text-soft-400">@james</span>
                    </CommandItem>
                    <CommandItem>
                      <Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/80?u=sophia-cm" /><AvatarFallback>SW</AvatarFallback></Avatar>
                      <span>Sophia Williams</span>
                      <span className="ml-auto text-text-soft-400">@sophia</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading={<div className="flex items-center justify-between w-full"><span>Results (4)</span><a href="#" className="text-xs text-primary">See All</a></div>}>
                    {[
                      { name: "Matthew Johnson", handle: "@matheww" },
                      { name: "Laura Perez",     handle: "@laura"   },
                      { name: "Wei Chen",        handle: "@wei"     },
                      { name: "Lena Müller",     handle: "@lena"    },
                      { name: "Juma Omondi",     handle: "@juma"    },
                    ].map((p) => (
                      <CommandItem key={p.handle}>
                        <Avatar size="sm"><AvatarImage src={`https://i.pravatar.cc/80?u=${p.handle}`} /><AvatarFallback>{p.name[0]}</AvatarFallback></Avatar>
                        <span>{p.name}</span>
                        <span className="ml-auto text-text-soft-400">{p.handle}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PaletteShell>
          }
          code={`<CommandDialog>
  <CommandInput placeholder="Search" />
  <FilterChipRow>People, Files, Emails, Actions</FilterChipRow>
  <CommandList>
    <CommandGroup heading="History">
      <CommandItem><Avatar /> James Brown <handle>@james</handle></CommandItem>
    </CommandGroup>
    <CommandGroup heading="Results (4)">
      <CommandItem>Matthew Johnson @matheww</CommandItem>
    </CommandGroup>
  </CommandList>
  <Footer hints={<>↑↓ Navigate · ↵ Select</>} />
</CommandDialog>`}
        />
      </DocsSection>

      <DocsSection title="HR Tools — multi-column">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          2-column palette with Recent chip row and 4 grouped collections (Tools &amp; Apps / Employees / Teams / Locations). Each group heading is clickable (external link icon).
        </p>
        <DocsExample
          title='"Search HR tools" palette'
          preview={
            <PaletteShell
              footer={
                <>
                  <div className="flex items-center gap-3">
                    <KbdHint icon={<ArrowUp className="size-3" />} label="" /> <KbdHint icon={<ArrowDown className="size-3" />} label="Navigate" />
                    <KbdHint icon={<Enter className="size-3" />} label="Select" />
                  </div>
                  <span>Any problem? <a href="#" className="text-primary underline underline-offset-2">Contact</a></span>
                </>
              }
            >
              <Command className="h-auto">
                <CommandInput placeholder="Search HR tools or press..." />
                <div className="border-b border-stroke-soft-200 px-4 py-3 space-y-2">
                  <div className="text-xs text-text-soft-400">Recent</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {["Onboarding","Reviews","Hiring","Benefits","Learning"].map((c) => (
                      <span key={c} className="inline-flex items-center rounded-full bg-bg-weak-50 px-2.5 py-1 text-xs text-text-strong-950">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-stroke-soft-200">
                  <CommandList className="max-h-[260px]">
                    <CommandGroup heading={<div className="flex items-center justify-between w-full"><span>Tools &amp; Apps</span><span className="text-icon-soft-400 text-xs">↗</span></div>}>
                      <CommandItem><span className="size-5 rounded-md bg-(--dash-red-200) inline-flex items-center justify-center text-[10px]">M</span><span>Monday.com</span></CommandItem>
                      <CommandItem><span className="size-5 rounded-md bg-(--state-feature-base) inline-flex items-center justify-center text-static-white text-[10px]">L</span><span>Loom</span></CommandItem>
                      <CommandItem><span className="size-5 rounded-md bg-(--state-error-base) inline-flex items-center justify-center text-static-white text-[10px]">A</span><span>Asana</span></CommandItem>
                    </CommandGroup>
                    <CommandGroup heading={<div className="flex items-center justify-between w-full"><span>Teams</span><span className="text-icon-soft-400 text-xs">↗</span></div>}>
                      <CommandItem><span className="size-5 rounded-full bg-(--state-error-base)" /><span>Aurora Solutions</span></CommandItem>
                      <CommandItem><span className="size-5 rounded-full bg-(--state-information-base)" /><span>Pulse Medical</span></CommandItem>
                      <CommandItem><span className="size-5 rounded-full bg-(--state-feature-base)" /><span>Synergy HR</span></CommandItem>
                    </CommandGroup>
                  </CommandList>
                  <CommandList className="max-h-[260px]">
                    <CommandGroup heading={<div className="flex items-center justify-between w-full"><span>Employees</span><span className="text-icon-soft-400 text-xs">↗</span></div>}>
                      <CommandItem><Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/80?u=james-hr" /><AvatarFallback>J</AvatarFallback></Avatar><span>James Brown</span></CommandItem>
                      <CommandItem><Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/80?u=sophia-hr" /><AvatarFallback>S</AvatarFallback></Avatar><span>Sophia Williams</span><ChevronRight className="ml-auto size-4 text-icon-soft-400" /></CommandItem>
                      <CommandItem><Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/80?u=laura-hr" /><AvatarFallback>L</AvatarFallback></Avatar><span>Laura Perez</span></CommandItem>
                    </CommandGroup>
                    <CommandGroup heading={<div className="flex items-center justify-between w-full"><span>Locations</span><span className="text-icon-soft-400 text-xs">↗</span></div>}>
                      <CommandItem><span className="size-5 rounded-full bg-(--state-information-base) text-static-white text-[10px] inline-flex items-center justify-center">US</span><span>United States</span></CommandItem>
                      <CommandItem><span className="size-5 rounded-full bg-(--state-warning-base) text-static-white text-[10px] inline-flex items-center justify-center">ES</span><span>Spain</span></CommandItem>
                      <CommandItem><span className="size-5 rounded-full bg-(--state-success-base) text-static-white text-[10px] inline-flex items-center justify-center">IT</span><span>Italy</span></CommandItem>
                    </CommandGroup>
                  </CommandList>
                </div>
              </Command>
            </PaletteShell>
          }
          code={`<Command>
  <CommandInput />
  <RecentChipRow />
  <div className="grid grid-cols-2 divide-x">
    <CommandList>
      <CommandGroup heading="Tools & Apps">...</CommandGroup>
      <CommandGroup heading="Teams">...</CommandGroup>
    </CommandList>
    <CommandList>
      <CommandGroup heading="Employees">...</CommandGroup>
      <CommandGroup heading="Locations">...</CommandGroup>
    </CommandList>
  </div>
</Command>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "Command", type: "ComponentPropsWithoutRef<typeof CommandPrimitive>", description: "cmdk root — inline command surface (no dialog wrapper)." },
            { name: "CommandDialog", type: "Radix Dialog props", description: "Modal wrapper around Command. Open via state + ⌘K shortcut." },
            { name: "CommandInput", type: "input-like", description: "Search box at the top. Filters items by their `value` prop." },
            { name: "CommandList", type: "container", description: "Scrollable list of groups + items. max-h via className." },
            { name: "CommandEmpty", type: "fallback", description: "Renders when CommandInput value matches zero items." },
            { name: "CommandGroup", type: "section", description: "heading prop accepts string or ReactNode (use ReactNode for See-All links / external icons)." },
            { name: "CommandSeparator", type: "divider", description: "1px row separator between groups." },
            { name: "CommandItem", type: "row", description: "Filterable row. value prop (or children) drives filtering. onSelect callback when activated." },
            { name: "CommandShortcut", type: "trailing", description: "Right-aligned ⌘K-style chip inside an item." },
            { name: "CommandKbd", type: "chip", description: "Standalone kbd chip — use in search-trigger or footer hints." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
