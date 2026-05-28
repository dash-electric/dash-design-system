"use client"

import * as React from "react"
import {
  RiChromeLine as Chrome,
  RiFirefoxLine as Firefox,
  RiSafariLine as Safari,
  RiCloseLine as Close,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/registry/dash/ui/table"
import {
  SectionHeader,
  SubTabs,
  SectionBody,
  DashedDivider,
  PreviewFrame,
} from "../_shared"

/**
 * Marketing Settings — Privacy & Security. Ported from settings-modal/privacy-security/
 *   {index, password-2fa, active-sessions, sessions-table}.tsx.
 */

function Password2FAForm() {
  const row = (label: string, hint: string, cta: string) => (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div>
        <div className="text-sm font-medium text-text-strong-950">{label}</div>
        <div className="mt-1 text-xs text-text-sub-600">{hint}</div>
      </div>
      <Button size="xs" tone="neutral" style="stroke">
        {cta}
      </Button>
    </div>
  )
  return (
    <SectionBody>
      {row("Change Password", "Update password for enhanced account security.", "Change Password")}
      <DashedDivider />
      {row("Backup Codes", "Generate backup codes for your 2FA device.", "Generate Codes")}
      <DashedDivider />
      {row("2FA-Authentication", "Add an extra layer of protection to your account.", "Manage Authentication")}
    </SectionBody>
  )
}

const SESSIONS: Array<{ id: string; icon: React.ElementType; label: string; location: string; ip: string }> = [
  { id: "326860a3", icon: Chrome, label: "Google Chrome", location: "Québec, Canada", ip: "224.0.1.1" },
  { id: "326860b3", icon: Firefox, label: "Mozilla Firefox", location: "Vancouver, Canada", ip: "226.0.1.1" },
  { id: "326860c3", icon: Safari, label: "Safari", location: "Paris, France", ip: "227.0.1.1" },
  { id: "326860d3", icon: Chrome, label: "Google Chrome", location: "Berlin, Germany", ip: "228.0.1.1" },
  { id: "326860e3", icon: Firefox, label: "Mozilla Firefox", location: "Tokyo, Japan", ip: "229.0.1.1" },
]

function ActiveSessionsForm() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:gap-6">
        <div>
          <div className="text-sm font-medium text-text-strong-950">Active Sessions</div>
          <div className="mt-1 text-xs text-text-sub-600">
            Monitor and manage all your active sessions.
          </div>
        </div>
        <Button size="xs" tone="destructive" style="stroke">
          Log Out All Sessions
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[532px]">
          <TableHeader>
            <TableRow>
              <TableHead>Browser</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead className="w-0 px-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {SESSIONS.map((s) => {
              const Icon = s.icon
              return (
                <TableRow key={s.id}>
                  <TableCell className="h-12">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50">
                        <Icon className="size-5 text-text-sub-600" />
                      </span>
                      <div className="text-sm text-text-strong-950">{s.label}</div>
                    </div>
                  </TableCell>
                  <TableCell className="h-12 text-sm text-text-sub-600">{s.location}</TableCell>
                  <TableCell className="h-12 text-sm text-text-sub-600">{s.ip}</TableCell>
                  <TableCell className="h-12 w-0 px-6">
                    <CompactButton variant="ghost" size="md" fullRadius aria-label="Revoke session">
                      <Close />
                    </CompactButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function PrivacySecurityPreview({ tab }: { tab: "Password & 2FA" | "Active Sessions" }) {
  return (
    <PreviewFrame>
      <SectionHeader
        title="Privacy & Security"
        description="Customize your privacy and security settings"
      />
      <SubTabs current={tab} tabs={["Password & 2FA", "Active Sessions"]} />
      {tab === "Password & 2FA" ? <Password2FAForm /> : <ActiveSessionsForm />}
    </PreviewFrame>
  )
}

export default function MarketingSettingsPrivacySecurityPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Settings"
        title="Privacy & Security"
        description="Password / 2FA management and active session table with revoke per row. Two sub-tabs."
      />

      <DocsSection title="Password & 2FA">
        <DocsExample
          title="Security CTAs"
          description="Three rows — Change Password, Backup Codes (2FA), 2FA-Authentication. Each has a label + hint + stroke action button."
          preview={<PrivacySecurityPreview tab="Password & 2FA" />}
          code={`<div className="flex justify-between">
  <div>
    <div className="text-sm font-medium">Change Password</div>
    <div className="text-xs text-text-sub-600">Update password for enhanced account security.</div>
  </div>
  <Button size="xs" tone="neutral" style="stroke">Change Password</Button>
</div>
{/* Backup Codes → Generate Codes */}
{/* 2FA-Authentication → Manage Authentication */}`}
        />
      </DocsSection>

      <DocsSection title="Active Sessions">
        <DocsExample
          title="Sessions table"
          description="Header with 'Log Out All Sessions' destructive button + 5-row Table. Columns: Browser (icon + name), Location, IP Address, revoke CompactButton."
          preview={<PrivacySecurityPreview tab="Active Sessions" />}
          code={`<div className="flex justify-between">
  <div>
    <div>Active Sessions</div>
    <div className="text-xs text-text-sub-600">Monitor and manage all your active sessions.</div>
  </div>
  <Button size="xs" tone="destructive" style="stroke">Log Out All Sessions</Button>
</div>

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Browser</TableHead><TableHead>Location</TableHead><TableHead>IP Address</TableHead><TableHead />
    </TableRow>
  </TableHeader>
  <TableBody>
    {sessions.map((s) => (
      <TableRow key={s.id}>
        <TableCell><Icon /> {s.label}</TableCell>
        <TableCell>{s.location}</TableCell>
        <TableCell>{s.ip}</TableCell>
        <TableCell>
          <CompactButton variant="ghost" fullRadius aria-label="Revoke"><Close /></CompactButton>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
          <li>Sessions table: 532px min-width, 48px row height; browser cell uses 32px rounded-full faded badge holding the brand icon.</li>
          <li>Revoke action: <code>CompactButton</code> ghost / fullRadius / size=md, glyph = <code>RiCloseLine</code>.</li>
          <li>Header CTAs use xsmall stroke buttons; Log Out All uses <code>destructive</code> tone.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
