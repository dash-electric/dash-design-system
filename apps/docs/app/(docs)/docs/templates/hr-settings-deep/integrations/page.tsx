"use client"

import * as React from "react"
import {
  RiFolderSettingsLine,
  RiTimer2Line,
  RiAddCircleLine,
  RiAddLine,
  RiMagicFill,
  RiInformationFill,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Alert } from "@/registry/dash/ui/alert"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputAffix } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Hint } from "@/registry/dash/ui/hint"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Switch } from "@/registry/dash/ui/switch"
import { Divider } from "@/registry/dash/ui/divider"
import {
  SettingsPagePreview,
  SectionTabRail,
  SectionCard,
  SectionTitle,
} from "../_shared"

const INTEGRATION_TABS = [
  { label: "Integrations", icon: RiFolderSettingsLine },
  { label: "Upcoming", icon: RiTimer2Line },
  { label: "Make a Suggestion", icon: RiAddCircleLine },
]

type Brand = { id: string; letter: string; bg: string; fg?: string }

const BRAND_COLORS: Record<string, Brand> = {
  "microsoft-office": { id: "microsoft-office", letter: "M", bg: "#D83B01" },
  zoom: { id: "zoom", letter: "Z", bg: "#2D8CFF" },
  slack: { id: "slack", letter: "S", bg: "#4A154B" },
  trello: { id: "trello", letter: "T", bg: "#0079BF" },
  jira: { id: "jira", letter: "J", bg: "#0052CC" },
  asana: { id: "asana", letter: "A", bg: "#F06A6A" },
  zendesk: { id: "zendesk", letter: "Z", bg: "#03363D" },
  evernote: { id: "evernote", letter: "E", bg: "#2DBE60" },
}

function BrandLogo({ id }: { id: string }) {
  const b = BRAND_COLORS[id]
  if (!b) return null
  return (
    <span
      className="flex size-6 items-center justify-center rounded text-[12px] font-semibold text-white"
      style={{ backgroundColor: b.bg }}
    >
      {b.letter}
    </span>
  )
}

type IntegrationRow = {
  id: keyof typeof BRAND_COLORS | string
  name: string
  description: string
  defaultActive?: boolean
  soon?: boolean
}

function IntegrationCard({ row }: { row: IntegrationRow }) {
  const [checked, setChecked] = React.useState(!!row.defaultActive)
  return (
    <label className="relative flex cursor-pointer items-center gap-3.5 rounded-xl bg-bg-white-0 p-4 pr-16 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        disabled={row.soon}
        className="absolute right-5 top-5"
      />
      <div className="flex size-10 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
        <BrandLogo id={row.id} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-sm font-medium text-text-strong-950">
          <span>{row.name}</span>
          {row.soon ? (
            <Badge status="neutral" appearance="lighter" size="sm">
              SOON
            </Badge>
          ) : null}
        </div>
        <div className="text-xs text-text-sub-600">{row.description}</div>
      </div>
    </label>
  )
}

const ACTIVE_INTEGRATIONS: IntegrationRow[] = [
  {
    id: "microsoft-office",
    name: "Microsoft Office 365",
    description: "Seamless collaboration and document management.",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "For conducting virtual meetings and interviews.",
  },
  {
    id: "slack",
    name: "Slack",
    description: "For team communication and real-time collaboration.",
  },
  {
    id: "trello",
    name: "Trello",
    description: "For task management and project collaboration.",
  },
]

const UPCOMING_INTEGRATIONS: IntegrationRow[] = [
  {
    id: "jira",
    name: "Jira",
    description: "For agile project management and issue tracking.",
    soon: true,
  },
  {
    id: "asana",
    name: "Asana",
    description: "For project management and task tracking.",
    soon: true,
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "For customer support and ticket management.",
    soon: true,
  },
  {
    id: "evernote",
    name: "Evernote",
    description: "For note-taking and knowledge management.",
    soon: true,
  },
]

function IntegrationsPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Integrations"
        description="Connect and sync with essential tools and platforms."
      />
      <Divider />
      <div className="flex flex-col gap-3">
        {ACTIVE_INTEGRATIONS.map((row) => (
          <IntegrationCard key={row.id} row={row} />
        ))}
      </div>
      <Button style="stroke" className="mt-1 w-full">
        <RiAddLine />
        Add Integration
      </Button>
    </SectionCard>
  )
}

function UpcomingPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Upcoming Integrations"
        description="Preview of upcoming integrations."
      />
      <Divider />
      <div className="flex flex-col gap-3">
        {UPCOMING_INTEGRATIONS.map((row) => (
          <IntegrationCard key={row.id} row={row} />
        ))}
        <Alert
          status="feature"
          appearance="lighter"
          size="xs"
          icon={<RiMagicFill />}
        >
          These integrations are on their way and will be added soon.
        </Alert>
      </div>
    </SectionCard>
  )
}

function SuggestionPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Make a Suggestion"
        description="Recommend an Integration to help us."
      />
      <Divider />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="sug-name" required>
            Integration Name
          </Label>
          <InputRoot size="md">
            <Input id="sug-name" placeholder="Enter integration name..." />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="sug-site" hint="(Optional)">
            Website
          </Label>
          <InputRoot size="md">
            <InputAffix>https://</InputAffix>
            <Input id="sug-site" placeholder="www.example.com" />
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="sug-reason" required>
            Reason for Recommendation
          </Label>
          <Textarea
            id="sug-reason"
            className="min-h-[58px]"
            placeholder="Explain why you recommend this integration..."
          />
          <div className="-mt-1 text-right text-[11px] text-text-soft-400">
            0/200
          </div>
          <Hint>
            <RiInformationFill className="size-4" />
            We may not be able to fulfill every integration request.
          </Hint>
        </div>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button tone="neutral" style="stroke">
          Discard
        </Button>
        <Button>Submit</Button>
      </div>
    </SectionCard>
  )
}

function IntegrationsPreview({ tab }: { tab: string }) {
  return (
    <SettingsPagePreview active="integrations">
      <SectionTabRail tabs={INTEGRATION_TABS} current={tab} />
      {tab === "Integrations" ? <IntegrationsPanel /> : null}
      {tab === "Upcoming" ? <UpcomingPanel /> : null}
      {tab === "Make a Suggestion" ? <SuggestionPanel /> : null}
    </SettingsPagePreview>
  )
}

export default function HrSettingsDeepIntegrationsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Settings"
        title="Integrations"
        description="Connected tools and platforms. Three panels: Integrations (4 active brand toggles), Upcoming (4 brand cards with SOON badge + magic alert), Make a Suggestion (form to recommend a new integration)."
      />

      <DocsSection title="Integrations panel">
        <IntegrationsPreview tab="Integrations" />
      </DocsSection>

      <DocsSection title="Upcoming panel">
        <IntegrationsPreview tab="Upcoming" />
      </DocsSection>

      <DocsSection title="Make a Suggestion panel">
        <IntegrationsPreview tab="Make a Suggestion" />
      </DocsSection>

      <DocsSection title="Brand logo treatment">
        <p className="text-sm text-text-sub-600">
          Each integration card uses a 40px circular brand frame. Inside,
          dash-ds substitutes the source SVG with a 24px colored chip showing
          the first letter of the brand name (Slack, Zoom, Microsoft, etc.).
          This matches the conventions already used in the
          <code> hr-integrations-settings</code> registry block.
        </p>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
          <li>
            <strong>Card</strong> — rounded-xl, soft-200 ring, p-4 pr-16. Switch
            is absolutely positioned top-right (right-5 top-5).
          </li>
          <li>
            <strong>Upcoming variant</strong> — Switch is disabled, brand name
            row appends a gray <code>SOON</code> Badge (sm, lighter, neutral).
          </li>
          <li>
            <strong>Suggestion form</strong> — same Discard / Submit footer
            grid. Reason textarea reuses the 200-character counter pattern from
            Profile.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
