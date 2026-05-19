"use client"

import * as React from "react"
import { RiSearchLine as Search, RiEqualizerLine as SlidersHorizontal, RiArrowUpDownLine as ArrowDownUp } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import { cn } from "@/registry/dash/lib/utils"
import { FinanceSettingsShell } from "@/registry/dash/templates/_finance-settings-shell"

/**
 * FinanceIntegrationSettings — port of AlignUI Pro Figma frame
 * "Integration Settings [Finance & Banking]" (node 3969:10954).
 *
 * Composition:
 *  - FinanceSettingsShell with activeTab="integrations".
 *  - Filter row: SegmentedControl [All|Connected|Disconnected] + Search + Filter + Sort.
 *  - Grid of integration cards: logo, name, description, status badge, Manage button.
 */

export type IntegrationApp = {
  id: string
  name: string
  description: string
  status: "connected" | "disconnected"
  /** Optional emoji or letter for placeholder logo. */
  glyph?: string
}

const defaultApps: IntegrationApp[] = [
  { id: "ms365", name: "Microsoft Office 365", description: "Seamless collaboration and document management.", status: "connected", glyph: "M" },
  { id: "slack", name: "Slack", description: "For team communication and real-time collaboration.", status: "connected", glyph: "S" },
  { id: "asana", name: "Asana", description: "For project management and task tracking.", status: "disconnected", glyph: "A" },
  { id: "zoom", name: "Zoom", description: "For conducting virtual meetings and interviews.", status: "connected", glyph: "Z" },
  { id: "dropbox", name: "Dropbox", description: "Cloud-based platform for storing, sharing, and synchronizing files.", status: "connected", glyph: "D" },
  { id: "zendesk", name: "Zendesk", description: "For customer support and ticket management.", status: "disconnected", glyph: "Z" },
]

export type FinanceIntegrationSettingsProps = {
  apps?: IntegrationApp[]
  className?: string
}

export function FinanceIntegrationSettings({
  apps = defaultApps,
  className,
}: FinanceIntegrationSettingsProps) {
  const [filter, setFilter] = React.useState<"all" | "connected" | "disconnected">("all")
  const filtered = apps.filter((a) =>
    filter === "all" ? true : a.status === filter,
  )

  return (
    <FinanceSettingsShell
      activeTab="integrations"
      title="Integrations"
      subtitle="Connect and sync with essential tools and platforms."
      className={className}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          value={filter}
          onValueChange={(v: string) => v && setFilter(v as typeof filter)}
        >
          <SegmentedItem value="all">All Apps</SegmentedItem>
          <SegmentedItem value="connected">Connected</SegmentedItem>
          <SegmentedItem value="disconnected">Disconnected</SegmentedItem>
        </SegmentedControl>
        <div className="flex flex-wrap items-center gap-2">
          <InputRoot className="w-full sm:w-[260px]">
            <InputIcon>
              <Search className="size-4" />
            </InputIcon>
            <Input placeholder="Search..." />
          </InputRoot>
          <Button style="stroke" tone="neutral" size="md">
            <SlidersHorizontal className="size-4" /> Filter
          </Button>
          <Button style="stroke" tone="neutral" size="md">
            <ArrowDownUp className="size-4" /> Sort by
          </Button>
        </div>
      </div>

      <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3")}>
        {filtered.map((app) => (
          <div
            key={app.id}
            className="flex items-start gap-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4"
          >
            <div
              aria-hidden
              className="size-12 shrink-0 rounded-xl bg-bg-weak-50 grid place-items-center text-base font-semibold text-text-strong-950"
            >
              {app.glyph ?? app.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-text-strong-950 truncate">{app.name}</h3>
                <Badge
                  appearance="lighter"
                  status={app.status === "connected" ? "success" : "neutral"}
                  size="sm"
                >
                  {app.status === "connected" ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-text-sub-600 line-clamp-2">{app.description}</p>
              <div className="mt-3">
                <Button style="stroke" tone="neutral" size="sm">
                  {app.status === "connected" ? "Manage" : "Connect"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FinanceSettingsShell>
  )
}
