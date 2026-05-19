"use client"

import * as React from "react"
import { RiAddLine as Plus, RiSearchLine as Search, RiFilter3Line as Filter, RiSettings4Line as Settings2 } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Switch } from "@/registry/dash/ui/switch"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
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
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrIntegrations — ported 1:1 (structural parity) from AlignUI Pro Figma node 3880:63624.
 * Synergy HR Integrations marketplace page (full standalone view, not inside settings):
 *   - Header (title + Add Integration CTA)
 *   - Filter row (segmented control All/Connected/Disconnected + search + filter + sort)
 *   - Available Integrations section: 6 connected apps (with switch + Manage)
 *   - Upcoming section: 3 SOON apps (disabled)
 *
 * Stand-alone — assumes parent app shell provides sidebar + header.
 */

export type HrIntegrationsProps = {
  className?: string
}

type IntegrationApp = {
  id: string
  name: string
  description: string
  initials: string
  color: string
  badge?: "SOON"
  defaultOn?: boolean
  disabled?: boolean
}

const available: IntegrationApp[] = [
  {
    id: "office365",
    name: "Microsoft Office 365",
    description: "Seamless collaboration and document management.",
    initials: "O",
    color: "bg-(--dash-blue-500)",
    defaultOn: true,
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "For conducting virtual meetings and interviews.",
    initials: "Z",
    color: "bg-(--dash-blue-500)",
    defaultOn: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "For team communication and real-time collaboration.",
    initials: "S",
    color: "bg-(--dash-purple-500)",
    defaultOn: true,
  },
  {
    id: "trello",
    name: "Trello",
    description: "For task management and project collaboration.",
    initials: "T",
    color: "bg-(--dash-blue-500)",
    defaultOn: false,
  },
  {
    id: "monday",
    name: "Monday.com",
    description: "For project tracking, and HR task management.",
    initials: "M",
    color: "bg-(--dash-red-500)",
    defaultOn: false,
  },
  {
    id: "skype",
    name: "Skype",
    description: "For virtual meetings, and real-time communication.",
    initials: "S",
    color: "bg-(--dash-blue-500)",
    defaultOn: false,
  },
]

const upcoming: IntegrationApp[] = [
  {
    id: "jira",
    name: "Jira",
    description: "For agile project management and issue tracking.",
    initials: "J",
    color: "bg-(--dash-blue-500)",
    badge: "SOON",
    disabled: true,
  },
  {
    id: "asana",
    name: "Asana",
    description: "For project management and task tracking.",
    initials: "A",
    color: "bg-(--dash-red-500)",
    badge: "SOON",
    disabled: true,
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "For customer support and ticket management.",
    initials: "Z",
    color: "bg-(--dash-green-500)",
    badge: "SOON",
    disabled: true,
  },
]

export function HrIntegrations({ className }: HrIntegrationsProps) {
  const [tab, setTab] = React.useState("all")
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(
    Object.fromEntries(
      [...available, ...upcoming].map((a) => [a.id, !!a.defaultOn]),
    ),
  )

  return (
    <div className={cn("space-y-6", className)}>
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
            Integrations
          </h1>
          <p className="text-sm text-text-sub-600 mt-1">
            Manage your integrations to enhance and automate your workflow.
          </p>
        </div>
        <Button tone="primary" style="filled">
          <Plus className="size-4" /> Add Integration
        </Button>
      </header>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl value={tab} onValueChange={setTab}>
          <SegmentedItem value="all">All Apps</SegmentedItem>
          <SegmentedItem value="connected">Connected</SegmentedItem>
          <SegmentedItem value="disconnected">Disconnected</SegmentedItem>
        </SegmentedControl>

        <div className="flex-1 min-w-[200px] max-w-sm">
          <InputRoot>
            <InputIcon><Search /></InputIcon>
            <Input placeholder="Search..." />
          </InputRoot>
        </div>

        <Button tone="neutral" style="stroke" size="sm">
          <Filter className="size-3.5" /> Filter
        </Button>
        <Button tone="neutral" style="stroke" size="sm" aria-label="Customize">
          <Settings2 className="size-3.5" />
        </Button>

        <Select defaultValue="popular">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Sort by: Popular</SelectItem>
            <SelectItem value="newest">Sort by: Newest</SelectItem>
            <SelectItem value="az">Sort by: A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Available Integrations */}
      <Section title="Available Integrations" description="Access the integrated tools and apps ready for your HR tasks.">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {available.map((app) => (
            <IntegrationCard
              key={app.id}
              app={app}
              enabled={enabled[app.id]}
              onToggle={(c) =>
                setEnabled((s) => ({ ...s, [app.id]: c === true }))
              }
            />
          ))}
        </div>
      </Section>

      {/* Upcoming */}
      <Section title="Upcoming" description="New apps coming soon to Synergy.">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {upcoming.map((app) => (
            <IntegrationCard
              key={app.id}
              app={app}
              enabled={false}
              onToggle={() => {}}
            />
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text-strong-950">{title}</h2>
        <p className="text-sm text-text-sub-600 mt-0.5">{description}</p>
      </div>
      {children}
    </section>
  )
}

function IntegrationCard({
  app,
  enabled,
  onToggle,
}: {
  app: IntegrationApp
  enabled: boolean
  onToggle: (next: boolean) => void
}) {
  return (
    <Card
      className={cn(
        "transition-colors",
        app.disabled && "opacity-70",
      )}
    >
      <CardContent className="flex items-start gap-3 py-4">
        <span
          className={cn(
            "size-10 shrink-0 rounded-xl grid place-items-center text-text-white-0 font-semibold",
            app.color,
          )}
          aria-hidden
        >
          {app.initials}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-strong-950 truncate">
              {app.name}
            </span>
            {app.badge ? (
              <Badge appearance="lighter" status="information" size="sm">
                {app.badge}
              </Badge>
            ) : null}
          </div>
          <div className="text-xs text-text-sub-600 mt-0.5 line-clamp-2">
            {app.description}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Button
              tone="neutral"
              style="stroke"
              size="sm"
              disabled={app.disabled}
            >
              <Settings2 className="size-3.5" /> Manage
            </Button>
            <Switch
              checked={enabled}
              onCheckedChange={(c) => onToggle(c === true)}
              disabled={app.disabled}
              aria-label={`Toggle ${app.name}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
