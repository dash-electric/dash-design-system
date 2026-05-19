"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/registry/dash/ui/command"
import {
  foundationInventory,
  componentInventory,
  blockInventory,
  templateInventory,
} from "@/components/docs/nav-config"

type Entry = { title: string; href: string; group: string; section: string }

const sections: { label: string; src: typeof componentInventory }[] = [
  { label: "Foundations", src: foundationInventory },
  { label: "Components",  src: componentInventory },
  { label: "Blocks",      src: blockInventory },
  { label: "Templates",   src: templateInventory },
]

// Flatten nav into search index — section/group/title/href.
const buildIndex = (): Entry[] => {
  const out: Entry[] = []
  for (const s of sections) {
    for (const g of s.src.groups) {
      for (const item of g.items) {
        out.push({ title: item.title, href: item.href, group: g.title, section: s.label })
      }
    }
  }
  return out
}

export function DocsCommandPalette() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const index = React.useMemo(buildIndex, [])

  React.useEffect(() => {
    // 1. Cmd/Ctrl+K shortcut
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    // 2. Topbar search button dispatches this custom event
    const onOpen = () => setOpen(true)

    window.addEventListener("keydown", onKey)
    window.addEventListener("dash-ds:command-menu", onOpen as EventListener)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("dash-ds:command-menu", onOpen as EventListener)
    }
  }, [])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  // Group entries by section for the CommandGroup layout.
  const grouped = React.useMemo(() => {
    const map = new Map<string, Entry[]>()
    for (const e of index) {
      const arr = map.get(e.section) ?? []
      arr.push(e)
      map.set(e.section, arr)
    }
    return [...map.entries()]
  }, [index])

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search documentation"
      description="Search components, blocks, templates, and foundations."
    >
      <CommandInput placeholder="Search components, blocks, templates…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {grouped.map(([section, entries]) => (
          <CommandGroup key={section} heading={section}>
            {entries.map((e) => (
              <CommandItem
                key={e.href}
                value={`${e.title} ${e.group} ${e.section}`}
                onSelect={() => go(e.href)}
              >
                <span className="flex-1 truncate">{e.title}</span>
                <span className="ml-auto text-[11px] text-text-soft-400 shrink-0">{e.group}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
