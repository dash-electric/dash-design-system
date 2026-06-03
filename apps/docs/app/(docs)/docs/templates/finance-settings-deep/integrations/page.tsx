"use client"

import {
  RiEqualizerLine,
  RiFilter3Fill,
  RiSearch2Line,
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
  SettingsPagePreview,
  SettingsSectionHeader,
} from "../_shared"

/* ------------------------------------------------------------------------- */
/* Brand logos — colored boxes with first letter (no asset shipping)         */
/* ------------------------------------------------------------------------- */

type App = {
  name: string
  description: string
  connected: boolean
  /** Tailwind background for the brand placeholder box. */
  bg: string
  /** Initial letter shown inside the placeholder. */
  initial: string
}

const apps: App[] = [
  {
    name: "Microsoft Office 365",
    description: "Seamless collaboration and document management.",
    connected: true,
    bg: "bg-(--dash-red-600)",
    initial: "M",
  },
  {
    name: "Slack",
    description: "For team communication and real-time collaboration.",
    connected: true,
    bg: "bg-(--dash-purple-600)",
    initial: "S",
  },
  {
    name: "Asana",
    description: "For project management and task tracking.",
    connected: false,
    bg: "bg-(--dash-red-500)",
    initial: "A",
  },
  {
    name: "Zoom",
    description: "For conducting virtual meetings and interviews.",
    connected: true,
    bg: "bg-(--dash-blue-500)",
    initial: "Z",
  },
  {
    name: "Dropbox",
    description:
      "Cloud-based platform for storing, sharing, and synchronizing files.",
    connected: true,
    bg: "bg-(--dash-blue-600)",
    initial: "D",
  },
  {
    name: "Zendesk",
    description: "For customer support and ticket management.",
    connected: false,
    bg: "bg-bg-strong-950",
    initial: "Z",
  },
]

function BrandBox({ bg, initial }: { bg: string; initial: string }) {
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
      <div
        className={`flex size-8 items-center justify-center rounded text-base font-semibold text-static-white ${bg}`}
        aria-hidden
      >
        {initial}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* Filters                                                                   */
/* ------------------------------------------------------------------------- */

function IntegrationsFilters() {
  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
      <InputRoot size="md" className="lg:hidden">
        <InputIcon>
          <RiSearch2Line className="size-5" />
        </InputIcon>
        <Input placeholder="Search..." />
        <button type="button" aria-label="Filter">
          <RiFilter3Fill className="size-5 text-text-soft-400" />
        </button>
      </InputRoot>

      <SegmentedControl defaultValue="all" className="lg:w-80">
        <SegmentedItem value="all">All Apps</SegmentedItem>
        <SegmentedItem value="connected">Connected</SegmentedItem>
        <SegmentedItem value="disconnected">Disconnected</SegmentedItem>
      </SegmentedControl>

      <div className="hidden flex-wrap gap-3 min-[560px]:flex-nowrap lg:flex">
        <InputRoot size="sm" className="w-[300px]">
          <InputIcon>
            <RiSearch2Line className="size-4" />
          </InputIcon>
          <Input placeholder="Search..." />
          <Kbd>⌘1</Kbd>
        </InputRoot>

        <Button
          tone="neutral"
          style="stroke"
          size="sm"
          className="flex-1 min-[560px]:flex-none"
        >
          <RiFilter3Fill className="size-4" />
          Filter
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* Integration row list                                                      */
/* ------------------------------------------------------------------------- */

function AppsList() {
  return (
    <div className="flex flex-col gap-6 py-6">
      {apps.map((app, i) => (
        <div key={app.name}>
          <div className="grid gap-4 sm:flex sm:items-center sm:gap-3">
            <div className="flex flex-1 items-center gap-3">
              <BrandBox bg={app.bg} initial={app.initial} />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <div className="text-base font-medium text-text-strong-950">
                    {app.name}
                  </div>
                  {!app.connected ? (
                    <Badge
                      appearance="lighter"
                      status="neutral"
                      size="sm"
                    >
                      Disconnected
                    </Badge>
                  ) : null}
                </div>
                <div className="text-sm text-text-sub-600">
                  {app.description}
                </div>
              </div>
            </div>
            <Button tone="neutral" style="stroke" size="sm">
              <RiSettings2Line className="size-4" />
              Manage
            </Button>
          </div>
          {i < apps.length - 1 ? (
            <div className="mt-6">
              <Divider />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* Section body                                                              */
/* ------------------------------------------------------------------------- */

function IntegrationsSectionBody() {
  return (
    <>
      <SettingsSectionHeader
        icon={RiEqualizerLine}
        title="Integrations"
        description="Connect and sync with essential tools and platforms."
      />
      <div className="px-4 lg:px-8">
        <Divider />
      </div>
      <div className="flex w-full flex-1 flex-col px-4 py-6 lg:px-8">
        <div className="pb-6">
          <IntegrationsFilters />
        </div>
        <Divider />
        <div className="pb-6 pt-6">
          <div className="text-base font-medium text-text-strong-950">
            All Apps
          </div>
          <div className="mt-1 text-sm text-text-sub-600">
            Access all the integrated tools and apps ready for your Finance &
            Banking experience.
          </div>
        </div>
        <Divider />
        <AppsList />
      </div>
    </>
  )
}

export default function FinanceSettingsDeepIntegrationsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance / Settings"
        title="Integrations"
        description="Filter row (All Apps / Connected / Disconnected SegmentedControl + 300px search with ⌘1 Kbd + Filter button), an All Apps caption, then 6 integration rows (Microsoft Office 365, Slack, Asana, Zoom, Dropbox, Zendesk) — each with a brand placeholder, name + optional Disconnected badge, description, and a Manage button. Ported from app/settings/integrations/{page,apps,filters}.tsx."
      />

      <DocsSection title="Integrations section preview">
        <SettingsPagePreview active="integrations">
          <IntegrationsSectionBody />
        </SettingsPagePreview>
      </DocsSection>

      <DocsSection title="App inventory">
        <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">
              Microsoft Office 365
            </strong>{" "}
            — Connected. "Seamless collaboration and document management."
          </li>
          <li>
            <strong className="text-text-strong-950">Slack</strong> —
            Connected. "For team communication and real-time collaboration."
          </li>
          <li>
            <strong className="text-text-strong-950">Asana</strong> —
            Disconnected (Badge lighter neutral). "For project management and
            task tracking."
          </li>
          <li>
            <strong className="text-text-strong-950">Zoom</strong> — Connected.
            "For conducting virtual meetings and interviews."
          </li>
          <li>
            <strong className="text-text-strong-950">Dropbox</strong> —
            Connected. "Cloud-based platform for storing, sharing, and
            synchronizing files."
          </li>
          <li>
            <strong className="text-text-strong-950">Zendesk</strong> —
            Disconnected. "For customer support and ticket management."
            (Source uses <code>ThemedImage</code> for the light/dark logo.)
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Brand chip</strong> — 48px
            <code> ring-stroke-soft-200</code> circle with a 32px colored box
            inside (first letter, static-white text). In the source, this is
            the brand SVG from <code>/images/major-brands/*.svg</code>.
          </li>
          <li>
            <strong className="text-text-strong-950">Disconnected badge</strong>{" "}
            — small lighter neutral Badge inline with the name. Connected rows
            have no badge.
          </li>
          <li>
            <strong className="text-text-strong-950">Manage</strong> — small
            stroke button with the <code>RiSettings2Line</code> icon, right-
            aligned on desktop, full-width on mobile.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
