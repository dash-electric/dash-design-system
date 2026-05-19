"use client"

import * as React from "react"
import {
  RiUser3Line as User,
  RiBriefcaseLine as Briefcase,
  RiMapPin2Line as MapPin,
  RiSearchLine as SearchIcon,
  RiInformationLine as Info,
  RiErrorWarningLine as AlertCircle,
  RiArrowDownSLine as ChevronDown,
  RiCheckLine as Check,
} from "@remixicon/react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "@/registry/dash/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { Field, FieldDescription } from "@/registry/dash/ui/field"
import { Label } from "@/registry/dash/ui/label"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Select — Figma 1:1 (11 nodes verified 2026-05-18).
 *
 *   270:1085      Trigger master spec (default / hover / focus / open / disabled / error)
 *   377:5083      Item spec (default / hover / selected / disabled)
 *   307:16883     Sizes — sm 32 / md 36 / lg 40 / xl 44
 *   332:4537      Trigger w/ leading icon
 *   3238:9696     Item w/ leading avatar / brand icon + 2-line content
 *   166999:142558 Group + Label + Separator pattern
 *   166999:142767 Search inside dropdown (Combobox-like)
 *   166999:142911 Error state inside Form Field
 *   166999:143185 Selected-state checkmark on item
 *   166999:143188 Multi-row item content (title + secondary line)
 *   3248:20586    Native form integration (placeholder → value flip)
 */

export default function SelectDocsPage() {
  const [country, setCountry] = React.useState("id")
  const [role, setRole] = React.useState("")
  const [team, setTeam] = React.useState("aurora")
  const [errored, setErrored] = React.useState(true)
  const [size, setSize] = React.useState("md")
  const [search, setSearch] = React.useState("")
  const [searchVal, setSearchVal] = React.useState("james")

  const employees = [
    { id: "james",  name: "James Brown",     role: "Marketing Manager",    handle: "@james",  fall: "bg-(--state-success-light) text-(--state-success-dark)" },
    { id: "sophia", name: "Sophia Williams", role: "HR Assistant",          handle: "@sophia", fall: "bg-(--state-warning-light) text-(--state-warning-dark)" },
    { id: "laura",  name: "Laura Perez",     role: "Fashion Designer",      handle: "@laura",  fall: "bg-(--state-information-light) text-(--state-information-dark)" },
    { id: "wei",    name: "Wei Chen",        role: "Operations Manager",    handle: "@wei",    fall: "bg-(--state-feature-light) text-(--state-feature-dark)" },
  ]
  const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Forms"
        title="Select"
        description="Native-feel single-value dropdown built on Radix Select. Trigger matches Input + DatePicker sizing. Supports leading icon, group + label + separator, multi-row item content, error state via aria-invalid, and inline filter for medium-sized option lists."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add select`} />
      </DocsSection>

      <DocsSection title="Trigger states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          5 visual states: default (stroke-soft-200) / hover (bg-weak-50) / focus (ring-primary-alpha-10) / open (border-stroke-strong-950) / disabled (text-disabled-300). Plus error via aria-invalid.
        </p>
        <DocsExample
          title="States grid"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger><SelectValue placeholder="Pick a country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Indonesia</SelectItem>
                  <SelectItem value="sg">Singapore</SelectItem>
                  <SelectItem value="my">Malaysia</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Hover me" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Option A</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger disabled><SelectValue placeholder="Disabled" /></SelectTrigger>
                <SelectContent />
              </Select>
              <Select>
                <SelectTrigger aria-invalid="true"><SelectValue placeholder="Error state" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Option A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
          code={`<Select value={country} onValueChange={setCountry}>
  <SelectTrigger><SelectValue placeholder="Pick a country" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="id">Indonesia</SelectItem>
  </SelectContent>
</Select>

<SelectTrigger disabled />
<SelectTrigger aria-invalid="true" />`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          4 sizes — matches Input + DatePicker. <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm</code> 32px, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">md</code> 36px, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">lg</code> 40px (default), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">xl</code> 44px.
        </p>
        <DocsExample
          title="sm / md / lg / xl"
          preview={
            <div className="flex flex-col gap-3 max-w-xs">
              {(["sm","md","lg","xl"] as const).map((s) => (
                <Select key={s} value={size} onValueChange={setSize}>
                  <SelectTrigger size={s}><SelectValue placeholder={`Size ${s}`} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">sm</SelectItem>
                    <SelectItem value="md">md</SelectItem>
                    <SelectItem value="lg">lg</SelectItem>
                    <SelectItem value="xl">xl</SelectItem>
                  </SelectContent>
                </Select>
              ))}
            </div>
          }
          code={`<SelectTrigger size="sm" />
<SelectTrigger size="md" />
<SelectTrigger size="lg" />
<SelectTrigger size="xl" />`}
        />
      </DocsSection>

      <DocsSection title="With leading icon">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Slot a 16-20px glyph inside the trigger to hint the field type (user / location / category).
        </p>
        <DocsExample
          title="User + Location"
          preview={
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <div className="inline-flex items-center gap-2">
                    <User className="size-4 text-icon-soft-400" />
                    <SelectValue placeholder="Select a role" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing Manager</SelectItem>
                  <SelectItem value="hr">HR Assistant</SelectItem>
                  <SelectItem value="ops">Operations Manager</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="jkt">
                <SelectTrigger>
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-icon-soft-400" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jkt">Jakarta</SelectItem>
                  <SelectItem value="bdg">Bandung</SelectItem>
                  <SelectItem value="sby">Surabaya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
          code={`<SelectTrigger>
  <div className="inline-flex items-center gap-2">
    <User className="size-4 text-icon-soft-400" />
    <SelectValue placeholder="Select a role" />
  </div>
</SelectTrigger>`}
        />
      </DocsSection>

      <DocsSection title="Item w/ avatar + 2-line content">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Each SelectItem accepts arbitrary children — embed an Avatar + identity row + meta line + Badge.
        </p>
        <DocsExample
          title="Employee assignment"
          preview={
            <div className="max-w-sm">
              <Select defaultValue="james">
                <SelectTrigger><SelectValue placeholder="Assign to..." /></SelectTrigger>
                <SelectContent className="w-[320px]">
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm"><AvatarImage src={`https://i.pravatar.cc/80?u=${e.id}`} /><AvatarFallback className={e.fall}>{e.name[0]}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-strong-950 truncate">{e.name}</div>
                          <div className="text-xs text-text-soft-400 truncate">{e.role}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
          code={`<SelectItem value="james">
  <div className="flex items-center gap-3">
    <Avatar size="sm">...</Avatar>
    <div>
      <div>James Brown</div>
      <div className="text-xs text-text-soft-400">Marketing Manager</div>
    </div>
  </div>
</SelectItem>`}
        />
      </DocsSection>

      <DocsSection title="Group + label + separator">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Stack groups inside the dropdown. <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">SelectGroup</code> + <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">SelectLabel</code> renders an uppercase section header; <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">SelectSeparator</code> divides groups.
        </p>
        <DocsExample
          title="Teams selector"
          preview={
            <div className="max-w-sm">
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger>
                  <div className="inline-flex items-center gap-2">
                    <Briefcase className="size-4 text-icon-soft-400" />
                    <SelectValue placeholder="Select team" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Marketing</SelectLabel>
                    <SelectItem value="aurora">Aurora Solutions</SelectItem>
                    <SelectItem value="pulse">Pulse Medical</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Engineering</SelectLabel>
                    <SelectItem value="phoenix">Phoenix</SelectItem>
                    <SelectItem value="catalyst">Catalyst</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Ops</SelectLabel>
                    <SelectItem value="synergy">Synergy HR</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          }
          code={`<SelectContent>
  <SelectGroup>
    <SelectLabel>Marketing</SelectLabel>
    <SelectItem value="aurora">Aurora Solutions</SelectItem>
  </SelectGroup>
  <SelectSeparator />
  <SelectGroup>
    <SelectLabel>Engineering</SelectLabel>
    <SelectItem value="phoenix">Phoenix</SelectItem>
  </SelectGroup>
</SelectContent>`}
        />
      </DocsSection>

      <DocsSection title="Inline search">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          For 10-30 option lists, embed a search input above the items inside <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">SelectContent</code>. For 30+ options, prefer Combobox.
        </p>
        <DocsExample
          title="Find a person"
          preview={
            <div className="max-w-sm">
              <Select value={searchVal} onValueChange={setSearchVal}>
                <SelectTrigger>
                  <SelectValue placeholder="Find a person" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 border-b border-stroke-soft-200">
                    <div className="inline-flex items-center gap-2 w-full h-8 px-2 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-soft-400">
                      <SearchIcon className="size-3.5" />
                      <input
                        type="text"
                        placeholder="Search…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-text-strong-950 placeholder:text-text-soft-400"
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {filtered.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-text-soft-400">No results.</div>
                  ) : (
                    filtered.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        <div className="flex items-center gap-2">
                          <Avatar size="xs"><AvatarImage src={`https://i.pravatar.cc/64?u=${e.id}`} /><AvatarFallback>{e.name[0]}</AvatarFallback></Avatar>
                          <span>{e.name}</span>
                          <span className="text-text-soft-400 text-xs">{e.handle}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          }
          code={`<SelectContent>
  <div className="px-2 py-1.5 border-b">
    <input value={search} onChange={...} onKeyDown={(e) => e.stopPropagation()} />
  </div>
  {filtered.map(...)}
</SelectContent>`}
        />
      </DocsSection>

      <DocsSection title="Error state inside Field">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Wrap the Select inside a <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">Field</code> with <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">aria-invalid</code> on the trigger. Pair with error description text.
        </p>
        <DocsExample
          title="Required field unfilled"
          preview={
            <div className="space-y-3 max-w-sm">
              <Field>
                <Label htmlFor="country-select">Country <span className="text-(--state-error-base)">*</span></Label>
                <Select value={errored ? "" : "id"} onValueChange={(v) => setErrored(!v)}>
                  <SelectTrigger id="country-select" aria-invalid={errored ? "true" : undefined}>
                    <SelectValue placeholder="Pick a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Indonesia</SelectItem>
                    <SelectItem value="sg">Singapore</SelectItem>
                  </SelectContent>
                </Select>
                {errored ? (
                  <div className="text-xs text-(--state-error-base) inline-flex items-center gap-1 mt-1">
                    <AlertCircle className="size-3.5" /> Country is required.
                  </div>
                ) : null}
              </Field>
              <Button size="sm" tone="neutral" style="stroke" onClick={() => setErrored((v) => !v)}>
                Toggle error
              </Button>
            </div>
          }
          code={`<Field label="Country" required>
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger aria-invalid={!value || undefined}>
      <SelectValue placeholder="Pick a country" />
    </SelectTrigger>
    ...
  </Select>
  {!value ? <ErrorMessage>Country is required.</ErrorMessage> : null}
</Field>`}
        />
      </DocsSection>

      <DocsSection title="In a form field">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Standard form-row pattern: label + helper text + Select + per-field hint.
        </p>
        <DocsExample
          title='"Reporting manager" field'
          preview={
            <div className="max-w-sm">
              <Field>
                <Label htmlFor="reporting-manager">Reporting manager</Label>
                <Select defaultValue="james">
                  <SelectTrigger id="reporting-manager">
                    <SelectValue placeholder="Choose someone" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        <div className="flex items-center gap-2">
                          <Avatar size="xs"><AvatarImage src={`https://i.pravatar.cc/64?u=${e.id}-form`} /><AvatarFallback>{e.name[0]}</AvatarFallback></Avatar>
                          <span>{e.name}</span>
                          <span className="text-text-soft-400 text-xs ml-auto">{e.handle}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>Pick the person you report to day-to-day.</FieldDescription>
              </Field>
            </div>
          }
          code={`<Field label="Reporting manager" hint="Pick the person you report to day-to-day.">
  <Select defaultValue="james">
    <SelectTrigger><SelectValue placeholder="Choose someone" /></SelectTrigger>
    <SelectContent>{employees.map(...)}</SelectContent>
  </Select>
</Field>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "Select", type: "Radix Select Root", description: "Pass value + onValueChange for controlled state, or defaultValue for uncontrolled." },
            { name: "SelectTrigger.size", type: '"sm" | "md" | "lg" | "xl"', defaultValue: '"lg"', description: "Trigger height — matches Input + DatePicker." },
            { name: "SelectTrigger.disabled", type: "boolean", description: "Greyed-out non-interactive state." },
            { name: "SelectTrigger.aria-invalid", type: '"true" | undefined', description: 'Renders red border for error state. Pair with description below the field.' },
            { name: "SelectValue.placeholder", type: "string", description: "Empty-state hint when no value selected." },
            { name: "SelectContent", type: "Radix Content", description: "Portal-rendered dropdown surface. Accepts className for width override." },
            { name: "SelectGroup + SelectLabel", type: "section header", description: "Uppercase tracking-wider category header inside the dropdown." },
            { name: "SelectItem.value", type: "string", description: "Required identifier. Children render the visible row content — supports arbitrary nodes (Avatar, Badge, multi-row)." },
            { name: "SelectSeparator", type: "divider", description: "1px row separator between groups." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
