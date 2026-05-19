"use client"

import Link from "next/link"
import { RiArrowRightSLine } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsVariantTable,
} from "@/components/docs/page-shell"
import {
  HrSettingsHeader,
  HrSettingsTopTabs,
  NAV,
  SECTION_ICONS,
} from "./_shared"

/**
 * HR Settings — overview page. Documents the 6-tab horizontal settings shell
 * ported 1:1 from the AlignUI HR Template (app/(main)/settings/layout.tsx).
 */

function OverviewPreview() {
  return (
    <div className="flex w-full flex-col gap-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6">
      <HrSettingsHeader />
      <HrSettingsTopTabs active="general" />
      <div className="flex h-[280px] items-center justify-center text-sm text-text-soft-400">
        Section content area — see linked sub-pages for full forms.
      </div>
    </div>
  )
}

export default function HrSettingsDeepOverviewPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Settings"
        title="HR Settings — overview"
        description="Six-tab settings shell from the AlignUI HR Template. Header with settings icon + title + description, then horizontal tab menu (mobile-collapsed to Select). Each tab renders a section page with its own vertical sub-tab rail."
      />

      <DocsSection title="Shell preview">
        <OverviewPreview />
      </DocsSection>

      <DocsSection title="Navigation tree">
        <DocsVariantTable
          nameHeader="Section"
          descHeader="Sub-tabs (vertical rail inside section page)"
          rows={[
            {
              name: "General Settings",
              description: "Regional Preferences · Theme Options",
            },
            {
              name: "Profile Settings",
              description:
                "Profile Settings · Contact Information · Social Links · Export Data",
            },
            {
              name: "Company Settings",
              description:
                "Company Settings · Contact Information · Social Links · Export Data",
            },
            {
              name: "Notification Settings",
              description: "Preferences · Method · Advanced",
            },
            {
              name: "Privacy & Security",
              description:
                "Change Password · 2FA Security · Active Sessions · Delete Account",
            },
            {
              name: "Integrations",
              description: "Integrations · Upcoming · Make a Suggestion",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Section pages">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {NAV.map((item) => {
            const Icon = SECTION_ICONS[item.id]
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
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Header</strong> — 48px
            circle icon (RiSettings2Line) on a soft-200 ring + title (label-md)
            + description (paragraph-sm).
          </li>
          <li>
            <strong className="text-text-strong-950">Tab bar</strong> —
            <code>TabMenuHorizontal</code> with 6 triggers. On <code>md-</code>{" "}
            replaced by a single <code>Select</code> control.
          </li>
          <li>
            <strong className="text-text-strong-950">Section page body</strong>{" "}
            — <code>grid-cols-[auto,1fr]</code> on <code>md+</code> (and
            <code>1fr/352px/1fr</code> on <code>xl</code>) with a 258px sticky
            sidebar card on the left and the active panel on the right.
          </li>
          <li>
            <strong className="text-text-strong-950">Sidebar rail</strong> —
            rounded-2xl card, soft-200 ring, p-2.5 inside,
            <em>SELECT MENU</em> caption (uppercase, subheading-xs).
          </li>
          <li>
            <strong className="text-text-strong-950">Panel</strong> — each tab
            renders a vertical column of form rows separated by{" "}
            <code>Divider line-spacing</code>.
          </li>
          <li>
            <strong className="text-text-strong-950">Footer actions</strong> —
            sticky bottom row with <em>Discard</em> stroke + <em>Apply Changes</em>{" "}
            primary buttons (or context-specific destructive action).
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Notes">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            Source files mapped 1:1 from{" "}
            <code>app/(main)/settings/&lt;section&gt;/*.tsx</code> in the HR
            template. No content invented — every label, placeholder, helper
            text, dropdown option, switch default matches the source.
          </li>
          <li>
            <code>phone-number-input</code>, <code>level-bar</code>, and{" "}
            <code>themed-image</code> are template-internal helpers; substituted
            with the closest dash-ds primitive (Input + Hint, simple progress
            row, plain initial-letter logo box).
          </li>
          <li>
            See the sub-pages for the full forms — Profile, Company, General,
            Integrations, Notifications, Privacy &amp; Security.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
