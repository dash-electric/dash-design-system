"use client"

import * as React from "react"
import { RiMoreLine as MoreHorizontal, RiGlobalLine as Globe } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import { cn } from "@/registry/dash/lib/utils"
import {
  FinanceSettingsShell,
  SettingsFieldRow,
} from "@/registry/dash/templates/_finance-settings-shell"

/**
 * FinancePrivacySecurity — port of AlignUI Pro Figma frame
 * "Privacy & Security [Finance & Banking]" (node 3969:7901).
 *
 * Composition:
 *  - FinanceSettingsShell with activeTab="privacy".
 *  - Settings rows: Change Password / Backup Codes / 2FA / Active Sessions.
 *  - Active Sessions table: Browser · Location · Last activity · IP · actions.
 */

export type ActiveSession = {
  id: string
  browser: string
  location: string
  lastActivity: string
  ip: string
  current?: boolean
}

const defaultSessions: ActiveSession[] = [
  { id: "s1", browser: "Mozilla Firefox", location: "Québec, Canada", lastActivity: "Current Session", ip: "224.0.1.1", current: true },
  { id: "s2", browser: "Google Chrome", location: "Vancouver, Canada", lastActivity: "Sep 26, 2023 at 10:00 AM", ip: "226.0.1.1" },
  { id: "s3", browser: "Google Chrome", location: "Vancouver, Canada", lastActivity: "Sep 24, 2023 at 9:00 AM", ip: "226.0.1.1" },
  { id: "s4", browser: "Mozilla Firefox", location: "Québec, Canada", lastActivity: "Sep 23, 2023 at 8:24 AM", ip: "224.0.1.1" },
]

export type FinancePrivacySecurityProps = {
  sessions?: ActiveSession[]
  className?: string
}

// Lucide doesn't ship Chrome/Firefox brand icons in the pinned version;
// using a neutral globe glyph for all browsers. See hold-list.md.
function BrowserIcon() {
  return <Globe className="size-4 text-text-sub-600" />
}

export function FinancePrivacySecurity({
  sessions = defaultSessions,
  className,
}: FinancePrivacySecurityProps) {
  return (
    <FinanceSettingsShell
      activeTab="privacy"
      title="Privacy & Security"
      subtitle="Personalize your privacy settings and enhance the security of your account."
      className={className}
    >
      <div className="divide-y divide-stroke-soft-200">
        <SettingsFieldRow
          label="Change Password"
          description="Update password for enhanced account security."
        >
          <div className="flex justify-end">
            <Button style="stroke" tone="neutral" size="md">Change Password</Button>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Backup Codes"
          description="Create and store new backup codes for use in the event of losing access to your authenticator."
        >
          <div className="flex justify-end">
            <Button style="stroke" tone="neutral" size="md">Generate Codes</Button>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Two-factor Authentication"
          description="Add an extra layer of protection to your account."
          badge={<Badge appearance="lighter" status="success" size="sm">On</Badge>}
        >
          <div className="flex justify-end">
            <Button style="stroke" tone="neutral" size="md">Manage Authentication</Button>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Active Sessions"
          description="Monitor and manage all your active sessions."
        >
          <div className="flex justify-end">
            <Button style="stroke" tone="destructive" size="md">Log Out All Sessions</Button>
          </div>
        </SettingsFieldRow>
      </div>

      {/* Sessions table */}
      <div className={cn("rounded-xl border border-stroke-soft-200 overflow-hidden")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Browser</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Most recent activity</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <BrowserIcon />
                    <span className="text-sm text-text-strong-950">{s.browser}</span>
                  </div>
                </TableCell>
                <TableCell className="text-text-sub-600">{s.location}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-text-sub-600">{s.lastActivity}</span>
                    {s.current ? (
                      <Badge appearance="lighter" status="success" size="sm">Active</Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-text-sub-600">{s.ip}</TableCell>
                <TableCell>
                  <Button style="ghost" tone="neutral" size="icon-xs" aria-label="More">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </FinanceSettingsShell>
  )
}
