"use client"

import * as React from "react"
import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiChromeLine,
  RiCloseLine,
  RiExpandUpDownFill,
  RiFirefoxLine,
  RiSafariLine,
  RiShieldUserLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Divider } from "@/registry/dash/ui/divider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/dash/ui/table"
import {
  SettingsPagePreview,
  SettingsSectionHeader,
} from "../_shared"

/* ------------------------------------------------------------------------- */
/* Stacked action rows (Change Password / Backup Codes / 2FA / Sessions)     */
/* ------------------------------------------------------------------------- */

function ActionRow({
  title,
  description,
  cta,
  destructive,
}: {
  title: string
  description: string
  cta: string
  destructive?: boolean
}) {
  return (
    <div className="grid gap-4 sm:flex sm:items-center sm:justify-between md:gap-6">
      <div>
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        <div className="mt-1 text-xs text-text-sub-600">{description}</div>
      </div>
      <Button
        tone={destructive ? "destructive" : "neutral"}
        style="stroke"
        size="md"
      >
        {cta}
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* Active Sessions table                                                     */
/* ------------------------------------------------------------------------- */

type Browser = "chrome" | "firefox" | "safari"

const BROWSER_META: Record<
  Browser,
  { icon: React.ElementType; label: string }
> = {
  chrome: { icon: RiChromeLine, label: "Google Chrome" },
  firefox: { icon: RiFirefoxLine, label: "Mozilla Firefox" },
  safari: { icon: RiSafariLine, label: "Safari" },
}

type Session = {
  id: string
  browser: Browser
  location: string
  activity: string
  ip: string
}

const sessions: Session[] = [
  {
    id: "326860a3",
    browser: "chrome",
    location: "Québec, Canada",
    activity: "Current Session",
    ip: "224.0.1.1",
  },
  {
    id: "326860b3",
    browser: "firefox",
    location: "Vancouver, Canada",
    activity: "Sep 24, 2023 at 2:10 PM",
    ip: "226.0.1.1",
  },
  {
    id: "326860c3",
    browser: "safari",
    location: "Paris, France",
    activity: "Dec 15, 2023 at 10:00 AM",
    ip: "227.0.1.1",
  },
  {
    id: "326860d3",
    browser: "chrome",
    location: "Berlin, Germany",
    activity: "Jan 5, 2024 at 9:15 AM",
    ip: "228.0.1.1",
  },
  {
    id: "326860e3",
    browser: "firefox",
    location: "Tokyo, Japan",
    activity: "Mar 20, 2024 at 1:30 PM",
    ip: "229.0.1.1",
  },
]

function SortIcon() {
  return <RiExpandUpDownFill className="size-5 text-text-sub-600" />
}

function SortHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5">
      {children}
      <button
        type="button"
        className="inline-flex items-center text-text-sub-600"
        aria-label="Sort"
      >
        <SortIcon />
      </button>
    </div>
  )
}

function SessionsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-stroke-soft-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortHeader>Browser</SortHeader>
            </TableHead>
            <TableHead>
              <SortHeader>Location</SortHeader>
            </TableHead>
            <TableHead>
              <SortHeader>Most recent activity</SortHeader>
            </TableHead>
            <TableHead>
              <SortHeader>IP Address</SortHeader>
            </TableHead>
            <TableHead className="w-[60px] px-5" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((s) => {
            const Icon = BROWSER_META[s.browser].icon
            const label = BROWSER_META[s.browser].label
            return (
              <TableRow key={s.id}>
                <TableCell className="h-12">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50">
                      <Icon className="size-5 text-text-sub-600" />
                    </div>
                    <div className="text-sm text-text-strong-950">{label}</div>
                  </div>
                </TableCell>
                <TableCell className="h-12 text-sm text-text-sub-600">
                  {s.location}
                </TableCell>
                <TableCell className="h-12 text-sm text-text-sub-600">
                  {s.activity}
                </TableCell>
                <TableCell className="h-12 text-sm text-text-sub-600">
                  {s.ip}
                </TableCell>
                <TableCell className="h-12 w-0 px-5">
                  <CompactButton
                    variant="ghost"
                    size="md"
                    fullRadius
                    aria-label={`Revoke session ${s.id}`}
                  >
                    <RiCloseLine />
                  </CompactButton>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/* Section body                                                              */
/* ------------------------------------------------------------------------- */

function PrivacySecuritySectionBody() {
  return (
    <>
      <SettingsSectionHeader
        icon={RiShieldUserLine}
        title="Privacy & Security"
        description="Personalize your privacy settings and enhance the security of your account."
      />
      <div className="px-4 lg:px-8">
        <Divider />
      </div>
      <div className="flex w-full flex-col gap-5 px-4 py-6 lg:px-8">
        <ActionRow
          title="Change Password"
          description="Update password for enhanced account security."
          cta="Change Password"
        />
        <Divider />
        <ActionRow
          title="Backup Codes"
          description="Create and store new backup codes for use in the event of losing access to your authentication app."
          cta="Generate Codes"
        />
        <Divider />
        <ActionRow
          title="Two-factor Authentication"
          description="Add an extra layer of protection to your account."
          cta="Manage Authentication"
        />
        <Divider />
        <ActionRow
          title="Active Sessions"
          description="Monitor and manage all your active sessions."
          cta="Log Out All Sessions"
          destructive
        />
        <SessionsTable />
      </div>
    </>
  )
}

export default function FinanceSettingsDeepPrivacySecurityPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance / Settings"
        title="Privacy & Security"
        description="Four action rows (Change Password, Backup Codes, Two-factor Authentication, Active Sessions — last button is destructive red-stroke) + a 5-row Active Sessions table with browser icon, location, most recent activity (Current Session for top row), IP address, and a per-row Close CompactButton. Ported from app/settings/privacy-security/{page,table}.tsx."
      />

      <DocsSection title="Privacy & Security section preview">
        <SettingsPagePreview active="privacy-security">
          <PrivacySecuritySectionBody />
        </SettingsPagePreview>
      </DocsSection>

      <DocsSection title="Row inventory">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Change Password</strong> —
            stroke neutral button. "Update password for enhanced account
            security."
          </li>
          <li>
            <strong className="text-text-strong-950">Backup Codes</strong> —
            "Generate Codes" button. Description references losing access to
            the authentication app.
          </li>
          <li>
            <strong className="text-text-strong-950">
              Two-factor Authentication
            </strong>{" "}
            — "Manage Authentication" button.
          </li>
          <li>
            <strong className="text-text-strong-950">Active Sessions</strong>{" "}
            — "Log Out All Sessions" destructive stroke button.
          </li>
          <li>
            <strong className="text-text-strong-950">Sessions table</strong>{" "}
            (5 rows): Browser (icon + name), Location, Most recent activity
            (top = "Current Session"), IP Address, and a 24px Close
            CompactButton per row. All headers sortable
            (<code>RiExpandUpDownFill</code>).
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
