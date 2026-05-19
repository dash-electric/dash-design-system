"use client"

import * as React from "react"
import { RiSunLine as Sun, RiMoonLine as Moon, RiComputerLine as Monitor } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { Switch } from "@/registry/dash/ui/switch"
import { Divider } from "@/registry/dash/ui/divider"
import { cn } from "@/registry/dash/lib/utils"
import {
  FinanceSettingsShell,
  SettingsFieldRow,
} from "@/registry/dash/templates/_finance-settings-shell"

/**
 * FinanceNotificationSettings — port of AlignUI Pro Figma frame
 * "Notification Settings [Finance & Banking]" (node 3966:58733).
 *
 * Composition:
 *  - FinanceSettingsShell with activeTab="notifications".
 *  - Section groups:
 *      General Notifications — Transactions / Balance / Promotions (toggle rows)
 *      Notification Method — Email / Push / SMS (toggle rows)
 *      Theme Options — Light / Dark / System (radio cards)
 *  - Sticky footer: Discard / Save.
 */

type ToggleRow = { id: string; label: string; description: string; defaultOn?: boolean; cta?: string }

const generalRows: ToggleRow[] = [
  { id: "tx", label: "Transactions", description: "Receive notifications for every transaction.", defaultOn: true },
  { id: "balance", label: "Balance Warning", description: "Receive a warning if your balance falls below $10,000.00.", defaultOn: true, cta: "Edit Limit" },
  { id: "promo", label: "Promotions", description: "Get exclusive access to promotions, discounts, and more.", defaultOn: false },
]

const methodRows: ToggleRow[] = [
  { id: "email", label: "Email", description: "Receive notifications via email.", defaultOn: true },
  { id: "push", label: "Push", description: "Get real-time updates and alerts directly on your device.", defaultOn: true },
  { id: "sms", label: "SMS", description: "Receive notifications via SMS.", defaultOn: false },
]

const themes = [
  { id: "light", label: "Light", description: "Pick a clean and classic light theme.", icon: Sun },
  { id: "dark", label: "Dark", description: "Select a sleek and modern dark theme.", icon: Moon },
  { id: "system", label: "System", description: "Adapts to your device's theme.", icon: Monitor },
]

export type FinanceNotificationSettingsProps = {
  className?: string
}

function ToggleStack({ rows }: { rows: ToggleRow[] }) {
  return (
    <ul className="divide-y divide-stroke-soft-200">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-strong-950">{r.label}</div>
            <p className="text-xs text-text-sub-600">{r.description}</p>
            {r.cta ? (
              <LinkButton tone="primary" size="md" className="mt-1">{r.cta}</LinkButton>
            ) : null}
          </div>
          <Switch defaultChecked={r.defaultOn} />
        </li>
      ))}
    </ul>
  )
}

export function FinanceNotificationSettings({ className }: FinanceNotificationSettingsProps) {
  const [theme, setTheme] = React.useState("system")

  return (
    <FinanceSettingsShell
      activeTab="notifications"
      title="Notification Settings"
      subtitle="Choose how and when Apex notifies you."
      className={className}
    >
      <div className="divide-y divide-stroke-soft-200">
        <SettingsFieldRow
          label="General Notifications"
          description="Notifications about transactions, balance and exclusive offers."
        >
          <ToggleStack rows={generalRows} />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Notification Method"
          description="Choose how you prefer to receive notifications."
        >
          <ToggleStack rows={methodRows} />
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Theme Options"
          description="Pick theme to personalize experience."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {themes.map((t) => {
              const Icon = t.icon
              const active = t.id === theme
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
                    active
                      ? "border-(--primary-base) ring-1 ring-(--primary-base) bg-bg-white-0"
                      : "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50",
                  )}
                  aria-pressed={active}
                >
                  <Icon className="size-5 text-text-sub-600" />
                  <div className="text-sm font-medium text-text-strong-950">{t.label}</div>
                  <p className="text-xs text-text-sub-600">{t.description}</p>
                </button>
              )
            })}
          </div>
        </SettingsFieldRow>
      </div>

      <Divider />

      <div className="flex items-center justify-end gap-2">
        <Button tone="neutral" style="stroke">Discard</Button>
        <Button tone="primary" style="filled">Save</Button>
      </div>
    </FinanceSettingsShell>
  )
}
