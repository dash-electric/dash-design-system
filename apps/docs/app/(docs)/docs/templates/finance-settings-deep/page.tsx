"use client"

import Link from "next/link"
import { RiArrowRightSLine, RiEqualizerLine } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsVariantTable,
} from "@/components/docs/page-shell"
import { SettingsPagePreview, SettingsSectionHeader, NAV } from "./_shared"

/**
 * Finance Settings — overview. Documents the 2-pane settings shell ported
 * 1:1 from the AlignUI Finance & Banking template (app/settings/*):
 *   - 264px left rail (Settings caption + 7 vertical tab links)
 *   - Right column = section header (48px circle icon + title + Export) →
 *     Divider → section body
 */

function OverviewPreview() {
  return (
    <SettingsPagePreview active="profile">
      <SettingsSectionHeader
        icon={RiEqualizerLine}
        title="Settings"
        description="Choose between categories to manage your Finance preferences."
      />
      <div className="px-4 lg:px-8">
        <div className="h-px w-full bg-stroke-soft-200" />
      </div>
      <div className="flex h-[260px] items-center justify-center px-4 py-6 text-sm text-text-soft-400 lg:px-8">
        Section content area — see linked sub-pages for full forms.
      </div>
    </SettingsPagePreview>
  )
}

export default function FinanceSettingsDeepOverviewPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance / Settings"
        title="Finance Settings — overview"
        description="Two-pane settings shell from the AlignUI Finance Template. Persistent left rail (264px) lists 7 sections — Profile, Company, Notifications, Team, Privacy & Security, Integrations, Localization. Right column renders the active section: header + Export action + Divider + form rows."
      />

      <DocsSection title="Shell preview">
        <OverviewPreview />
      </DocsSection>

      <DocsSection title="Navigation tree">
        <DocsVariantTable
          nameHeader="Section"
          descHeader="Content"
          rows={[
            {
              name: "Profile",
              description:
                "Apex ID · Profile Photo · Full Name · Email · Phone · Legal Address",
            },
            {
              name: "Company",
              description:
                "Upload Logo · Legal Name · Tax ID · Email · Phone · Legal Address · Web Links",
            },
            {
              name: "Notifications",
              description:
                "General Notifications (3 switches) · Notification Method (3 checkboxes) · Theme Options (3 radios)",
            },
            {
              name: "Team",
              description:
                "Filters (segmented + search + sort) + 5-row Team Members table with avatar, email, last activity, role status badge",
            },
            {
              name: "Privacy & Security",
              description:
                "Change Password · Backup Codes · Two-factor Authentication · Active Sessions + 5-row sessions table",
            },
            {
              name: "Integrations",
              description:
                "Filters (3-segment Apps/Connected/Disconnected + search) · All Apps · 6 integration rows with logo + name + connect/disconnect status + Manage button",
            },
            {
              name: "Localization",
              description:
                "Language · Currency · Timezone and Format · Date Format",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Section pages">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600">
                  <Icon className="size-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-text-strong-950">
                  {item.label}
                </span>
                <RiArrowRightSLine className="size-4 text-text-soft-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )
          })}
        </div>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Left rail</strong> — 264px
            fixed column on <code>lg+</code>, hidden below. Header: "Settings"
            (label-lg) + caption (paragraph-sm). Then a Divider, then 7
            vertical tab links with a Remix icon, label, and a right-chevron
            on the active item.
          </li>
          <li>
            <strong className="text-text-strong-950">Section header</strong> —
            48px circle icon on a <code>shadow-regular-xs</code> ring +
            <code>ring-stroke-soft-200</code>, then a label/description block,
            with an <em>Export</em> stroke button right-aligned (full-width on
            mobile).
          </li>
          <li>
            <strong className="text-text-strong-950">Field rows</strong> —
            2-column grid <code>md:grid-cols-[minmax(0,26fr),minmax(0,37fr)]</code>:
            left = label + helper text, right = static value + LinkButton
            "Edit" (or custom controls — Switch/Checkbox/Radio rows in
            Notifications, Button rows in Privacy, table-only rows in Team
            and Integrations).
          </li>
          <li>
            <strong className="text-text-strong-950">Mobile</strong> — left
            rail collapses to a horizontal TabMenu (replaced here with a
            single Select in the prod template).
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Notes">
        <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
          <li>
            Source mapped 1:1 from{" "}
            <code>app/settings/&lt;section&gt;/*.tsx</code> in the Finance
            template (layout + settings-menu + 7 section folders). Labels,
            placeholders, helper text, default switch/radio/checkbox values
            all match verbatim.
          </li>
          <li>
            <code>ThemedImage</code> (Zendesk integration row) is replaced
            with a plain <code>img</code> tag — same logo for both themes.
            Major brand SVGs in the source resolve to colored boxes with a
            single initial letter here (no asset shipping).
          </li>
          <li>
            <code>@tanstack/react-table</code> is used by the source Active
            Sessions + Team Members tables; these are rendered statically
            here using the Dash <code>Table</code> primitives (the sort
            interactions are documented but not implemented in the preview).
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
