"use client"

import * as React from "react"
import {
  RiEqualizerLine,
  RiAddLine,
  RiSearch2Line,
  RiFilter3Fill,
  RiSortDesc,
  RiSettings2Line,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { Divider } from "@/registry/dash/ui/divider"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Kbd } from "@/registry/dash/ui/kbd"
import {
  SegmentedControl,
  SegmentedItem,
} from "@/registry/dash/ui/segmented-control"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { Switch } from "@/registry/dash/ui/switch"
import { cn } from "@/registry/dash/lib/utils"
import {
  HrAppShell,
  HrHeader,
} from "@/registry/dash/templates/_internal/hr-app-shell"

/* -------------------------------------------------------------------------- *
 *  HR Integrations (Deep)                                                    *
 *  Mirrors `template-hr-master/app/(main)/integrations/{page,filters,grid}.tsx`. *
 *  Source data verbatim:                                                     *
 *    Available: Microsoft Office 365 · Zoom · Slack · Trello · Monday.com   *
 *               · Skype                                                      *
 *    Upcoming:  Jira · Asana · Zendesk (all SOON)                            *
 * -------------------------------------------------------------------------- */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

type Integration = {
  id: string
  name: string
  description: string
  logo: string
  logoBg: string
  defaultOn?: boolean
  soon?: boolean
}

const available: Integration[] = [
  {
    id: "office365",
    name: "Microsoft Office 365",
    description: "Seamless collaboration and document management.",
    logo: "O",
    logoBg: "bg-(--state-error-base)",
    defaultOn: true,
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "For conducting virtual meetings and interviews.",
    logo: "Z",
    logoBg: "bg-(--state-information-base)",
    defaultOn: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "For team communication and real-time collaboration.",
    logo: "S",
    logoBg: "bg-(--dash-purple-500)",
    defaultOn: true,
  },
  {
    id: "trello",
    name: "Trello",
    description: "For task management and project collaboration.",
    logo: "T",
    logoBg: "bg-(--state-information-base)",
  },
  {
    id: "monday",
    name: "Monday.com",
    description: "For project tracking, and HR task management.",
    logo: "M",
    logoBg: "bg-(--dash-red-500)",
  },
  {
    id: "skype",
    name: "Skype",
    description: "For virtual meetings, and real-time communication.",
    logo: "S",
    logoBg: "bg-(--dash-blue-500)",
  },
]

const upcoming: Integration[] = [
  {
    id: "jira",
    name: "Jira",
    description: "For agile project management and issue tracking.",
    logo: "J",
    logoBg: "bg-(--state-information-base)",
    soon: true,
  },
  {
    id: "asana",
    name: "Asana",
    description: "For project management and task tracking.",
    logo: "A",
    logoBg: "bg-(--dash-red-500)",
    soon: true,
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "For customer support and ticket management.",
    logo: "Z",
    logoBg: "bg-bg-strong-950",
    soon: true,
  },
]

function IntegrationCard({ item }: { item: Integration }) {
  const [on, setOn] = React.useState(!!item.defaultOn)
  return (
    <div className="relative flex flex-col items-start gap-3.5 rounded-xl bg-bg-white-0 p-4 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
      <Switch
        className="absolute right-5 top-5"
        checked={on}
        onCheckedChange={setOn}
        disabled={item.soon}
      />
      <div className="grid size-10 place-items-center rounded-full bg-bg-white-0 ring-1 ring-stroke-soft-200">
        <div
          className={cn(
            "grid size-6 place-items-center rounded-full text-static-white text-[11px] font-semibold",
            item.logoBg,
          )}
        >
          {item.logo}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-text-strong-950">
          <span>{item.name}</span>
          {item.soon ? (
            <Badge status="neutral" appearance="lighter" size="sm">
              SOON
            </Badge>
          ) : null}
        </div>
        <div className="text-xs text-text-sub-600">{item.description}</div>
      </div>
      <Button size="sm" style="stroke" tone="neutral" className="w-full">
        <RiSettings2Line className="size-4" />
        Manage
      </Button>
    </div>
  )
}

function IntegrationsFilters() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <SegmentedControl defaultValue="all-apps" className="lg:w-80">
        <SegmentedItem value="all-apps">All Apps</SegmentedItem>
        <SegmentedItem value="connected">Connected</SegmentedItem>
        <SegmentedItem value="disconnected">Disconnected</SegmentedItem>
      </SegmentedControl>
      <div className="flex flex-wrap items-center gap-3">
        <InputRoot size="sm" className="w-[300px]">
          <InputIcon>
            <RiSearch2Line className="size-4" />
          </InputIcon>
          <Input placeholder="Search…" />
          <Kbd size="sm">⌘1</Kbd>
        </InputRoot>
        <Button size="sm" style="stroke" tone="neutral">
          <RiFilter3Fill className="size-4" />
          Filter
        </Button>
        <Select>
          <SelectTrigger size="sm" className="w-auto gap-2">
            <RiSortDesc className="size-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">ASC</SelectItem>
            <SelectItem value="desc">DESC</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function IntegrationsGrid({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: Integration[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <div className="text-base font-medium text-text-strong-950">
          {title}
        </div>
        <div className="text-sm text-text-sub-600">{description}</div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {items.map((item) => (
          <IntegrationCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

function HrIntegrationsPreview() {
  return (
    <HrAppShell active="integrations">
      <HrHeader
        icon={
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200">
            <RiEqualizerLine className="size-6 text-text-sub-600" />
          </div>
        }
        title="Integrations"
        description="Manage your integrations to enhance and automate your workflow."
        actions={
          <Button size="sm">
            <RiAddLine className="size-4" />
            Add Integration
          </Button>
        }
      />
      <div className="px-8">
        <Divider />
      </div>
      <div className="flex flex-col gap-6 px-8 pb-8 pt-6">
        <IntegrationsFilters />
        <IntegrationsGrid
          title="Available Integrations"
          description="Access the integrated tools and apps ready for your HR tasks."
          items={available}
        />
        <IntegrationsGrid
          title="Upcoming Integrations"
          description="Explore the upcoming tools and apps that will soon be available for your HR tasks."
          items={upcoming}
        />
      </div>
    </HrAppShell>
  )
}

export default function HrIntegrationsDeepDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR"
        title="HR Integrations (Deep)"
        description="Synergy HR Integrations marketplace — header w/ Add Integration CTA + SegmentedControl filter (All Apps / Connected / Disconnected) + search/filter/sort row + 2 section grids: Available (Office 365, Zoom, Slack, Trello, Monday.com, Skype) and Upcoming (Jira, Asana, Zendesk — all SOON). All integration names, descriptions, and brand tones ported verbatim from the source."
      />

      <DocsSection title="Full preview">
        <DocsTemplatePreview>
          <HrIntegrationsPreview />
        </DocsTemplatePreview>
      </DocsSection>

      <DocsSection
        title="Anatomy"
        description="Two stacked grids share one filter bar. Cards are 3-up on desktop, brand-mark + name + 1-line description + Manage CTA, with the Switch toggle anchored top-right."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>
            <strong>Header</strong> — circular Equalizer icon avatar + "Integrations"
            + tagline + primary <code>Add Integration</code> CTA.
          </li>
          <li>
            <strong>Filter row</strong> — SegmentedControl left, 300px search ·
            Filter button · Sort by select right.
          </li>
          <li>
            <strong>Available section</strong> — h2 + description + 3-column grid
            of 6 cards. 3 cards default-on (Office 365, Zoom, Slack) so the
            Switch reflects "connected" state.
          </li>
          <li>
            <strong>Upcoming section</strong> — same grid, 3 cards with a SOON
            badge inline next to the name and the Switch disabled.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Components used">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Badge</strong> — SOON pill (neutral · lighter · sm).</li>
          <li><strong>Button</strong> — Add Integration, Manage (per card), Filter.</li>
          <li><strong>InputRoot / Input / InputIcon</strong> — 300px search w/ kbd hint.</li>
          <li><strong>Kbd</strong> — ⌘1 search hint.</li>
          <li><strong>SegmentedControl / SegmentedItem</strong> — All Apps / Connected / Disconnected.</li>
          <li><strong>Select / SelectTrigger / SelectValue / SelectContent / SelectItem</strong> — Sort by.</li>
          <li><strong>Switch</strong> — per-card on/off control; disabled on Upcoming.</li>
          <li><strong>Divider</strong> — Between header and content.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
