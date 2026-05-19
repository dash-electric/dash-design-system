"use client"

import * as React from "react"
import {
  RiCloseLine as Close,
  RiSearchLine as SearchIcon,
  RiFilter3Line as FilterIcon,
  RiArrowUpDownLine as Sort,
  RiMailLine as Mail,
  RiFlag2Line as Flag,
  RiAttachmentLine as Paperclip,
  RiPriceTag3Line as TagIcon,
  RiUser3Line as UserIcon,
  RiAddLine as Plus,
} from "@remixicon/react"
import { Filter } from "@/registry/dash/ui/filter"
import { Tag } from "@/registry/dash/ui/tag"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Filter — Figma 1:1 (12 nodes verified 2026-05-18).
 *
 * Pill trigger + Popover Command list w/ checkbox rows + Tag chips for selected values.
 * Composes Filter, Tag, Popover, Command from the rest of the system.
 */

const STATUS_OPTIONS = [
  { value: "active",  label: "Active" },
  { value: "absent",  label: "Absent" },
  { value: "paused",  label: "Paused" },
  { value: "blocked", label: "Blocked" },
]

const ROLE_OPTIONS = [
  { value: "marketing", label: "Marketing Manager" },
  { value: "hr",        label: "HR Assistant" },
  { value: "engineer",  label: "Engineer" },
  { value: "designer",  label: "Designer" },
  { value: "ops",       label: "Operations" },
]

const SENDER_OPTIONS = [
  { value: "james",  label: "James Brown",     description: "@james"  },
  { value: "sophia", label: "Sophia Williams", description: "@sophia" },
  { value: "laura",  label: "Laura Perez",     description: "@laura"  },
  { value: "wei",    label: "Wei Chen",        description: "@wei"    },
]

const MAILBOX_FILTERS: { id: string; label: string; icon: React.ReactNode; options: { value: string; label: string }[] }[] = [
  { id: "from",     label: "From",     icon: <UserIcon className="size-3.5" />, options: SENDER_OPTIONS },
  { id: "label",    label: "Label",    icon: <TagIcon className="size-3.5" />,  options: [
    { value: "client",   label: "Client" },
    { value: "internal", label: "Internal" },
    { value: "urgent",   label: "Urgent" },
  ] },
  { id: "flag",     label: "Flag",     icon: <Flag className="size-3.5" />, options: [
    { value: "starred",  label: "Starred" },
    { value: "important",label: "Important" },
  ] },
  { id: "attached", label: "Attached", icon: <Paperclip className="size-3.5" />, options: [
    { value: "pdf",  label: "PDF" },
    { value: "img",  label: "Image" },
    { value: "doc",  label: "Document" },
  ] },
]

export default function FilterDocsPage() {
  const [status, setStatus] = React.useState<string[]>(["active"])
  const [role, setRole] = React.useState<string[]>([])
  const [senders, setSenders] = React.useState<string[]>(["james"])
  const [mailbox, setMailbox] = React.useState<Record<string, string[]>>({ from: ["james"], label: ["urgent"] })
  const totalApplied = Object.values(mailbox).flat().length

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Forms"
        title="Filter"
        description="Faceted-search pill. Dashed-border trigger with leading + icon, opens a Popover with a Command list (checkbox rows + clear). Selected values render as removable Tags inline."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add filter`} />
      </DocsSection>

      <DocsSection title="Single pill">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          One Filter trigger with a small option list. Selected values render as Tag chips after the trigger — click the × to remove.
        </p>
        <DocsExample
          title="Status filter"
          preview={
            <div className="max-w-md">
              <Filter
                label="Status"
                options={STATUS_OPTIONS}
                value={status}
                onValueChange={setStatus}
              />
            </div>
          }
          code={`<Filter
  label="Status"
  options={STATUS_OPTIONS}
  value={status}
  onValueChange={setStatus}
/>`}
        />
      </DocsSection>

      <DocsSection title="Faceted toolbar w/ Reset">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Several Filter pills side-by-side over a table or list. Once any pill has a value, surface a Reset button to clear the entire row at once.
        </p>
        <DocsExample
          title="Multi-filter toolbar"
          preview={
            <div className="flex items-center gap-2 flex-wrap max-w-3xl">
              <Filter label="Status" options={STATUS_OPTIONS} value={status} onValueChange={setStatus} />
              <Filter label="Role"   options={ROLE_OPTIONS}   value={role}   onValueChange={setRole} />
              <Filter label="Sender" options={SENDER_OPTIONS} value={senders} onValueChange={setSenders} />
              {status.length + role.length + senders.length > 0 ? (
                <Button
                  size="sm"
                  tone="neutral"
                  style="ghost"
                  rightIcon={<Close />}
                  onClick={() => { setStatus([]); setRole([]); setSenders([]) }}
                >
                  Reset
                </Button>
              ) : null}
            </div>
          }
          code={`<div className="flex items-center gap-2 flex-wrap">
  <Filter label="Status" options={STATUS_OPTIONS} value={status} onValueChange={setStatus} />
  <Filter label="Role"   options={ROLE_OPTIONS}   value={role}   onValueChange={setRole} />
  <Filter label="Sender" options={SENDER_OPTIONS} value={senders} onValueChange={setSenders} />
  {anyApplied ? <Button onClick={resetAll}>Reset</Button> : null}
</div>`}
        />
      </DocsSection>

      <DocsSection title="Table header pattern">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Drop the faceted toolbar above a table. Pair with a search input, sort selector, and per-row Tag summary so the active filters double as headlines.
        </p>
        <DocsExample
          title="Members table"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-(--shadow-custom-sm)">
              <header className="px-5 py-4 border-b border-stroke-soft-200">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm font-semibold text-text-strong-950">Members</div>
                    <div className="text-xs text-text-sub-600">Filter the directory by role + status + sender.</div>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 h-8 px-2.5 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-soft-400">
                      <SearchIcon className="size-3.5" /> Search…
                    </div>
                    <Button size="sm" tone="neutral" style="stroke" leftIcon={<Sort />}>Sort by</Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Filter label="Status" options={STATUS_OPTIONS} value={status} onValueChange={setStatus} />
                  <Filter label="Role"   options={ROLE_OPTIONS}   value={role}   onValueChange={setRole} />
                  <Filter label="Sender" options={SENDER_OPTIONS} value={senders} onValueChange={setSenders} />
                  {status.length + role.length + senders.length > 0 ? (
                    <Button size="sm" tone="neutral" style="ghost" rightIcon={<Close />} onClick={() => { setStatus([]); setRole([]); setSenders([]) }}>Reset</Button>
                  ) : null}
                </div>
              </header>
              <div className="px-5 py-3 text-xs text-text-soft-400">
                Showing {status.length || "all"} statuses · {role.length || "all"} roles · {senders.length || "all"} senders.
              </div>
            </div>
          }
          code={`<header>
  <Title />
  <SearchAndSort />
  <FilterRow status role sender + Reset />
</header>
<Table />`}
        />
      </DocsSection>

      <DocsSection title="Faceted sidebar (email triage)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Vertical filter list for inbox-style triage UIs. Each facet keeps its own value state; show the count of applied filters at the top with a single Clear All action.
        </p>
        <DocsExample
          title="Mailbox sidebar"
          preview={
            <div className="max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-(--shadow-custom-sm)">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                  <Mail className="size-4" /> Mailbox filters
                  {totalApplied > 0 ? (
                    <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-(--primary-alpha-16) text-primary text-[10px] font-medium">{totalApplied}</span>
                  ) : null}
                </div>
                {totalApplied > 0 ? (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setMailbox({})}
                  >
                    Clear All
                  </button>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                {MAILBOX_FILTERS.map((f) => (
                  <div key={f.id} className="flex items-start gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-text-soft-400 pt-1.5 w-[80px] shrink-0">{f.icon} {f.label}</span>
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      <Filter
                        label={f.label}
                        options={f.options}
                        value={mailbox[f.id] ?? []}
                        onValueChange={(v) => setMailbox((m) => ({ ...m, [f.id]: v }))}
                      />
                      {(mailbox[f.id] ?? []).length > 0 ? (
                        <Tag
                          variant="gray"
                          onRemove={() => setMailbox((m) => ({ ...m, [f.id]: [] }))}
                        >
                          {(mailbox[f.id] ?? []).length} applied
                        </Tag>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
          code={`{facets.map(f => (
  <Filter
    label={f.label}
    options={f.options}
    value={state[f.id]}
    onValueChange={(v) => setState(s => ({ ...s, [f.id]: v }))}
  />
))}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "label", type: "string", description: "Pill label text. Appears next to the + icon." },
            { name: "options", type: "{ value: string; label: string; description?: string }[]", description: "Selectable rows. Description renders below the label inside the Command list." },
            { name: "value", type: "string[]", description: "Controlled multi-select state." },
            { name: "onValueChange", type: "(value: string[]) => void", description: "Fires per toggle. Also fires with [] when Clear filter is clicked." },
            { name: "placeholder", type: "string", defaultValue: '"Cari…"', description: "Empty-state placeholder for the inner CommandInput." },
            { name: "emptyText", type: "string", defaultValue: '"Tidak ada hasil."', description: "Empty-state fallback for zero matches." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
