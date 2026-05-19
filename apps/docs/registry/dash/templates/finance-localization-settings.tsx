"use client"

import * as React from "react"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { Divider } from "@/registry/dash/ui/divider"
import {
  FinanceSettingsShell,
  SettingsFieldRow,
} from "@/registry/dash/templates/_finance-settings-shell"

/**
 * FinanceLocalizationSettings — port of AlignUI Pro Figma frame
 * "Localization Settings [Finance & Banking]" (node 3969:13327).
 *
 * Composition:
 *  - FinanceSettingsShell with activeTab="localization".
 *  - Field rows: Language / Currency / Timezone / Date Format.
 *  - Sticky footer: Discard / Save.
 */

export type FinanceLocalizationSettingsProps = {
  className?: string
}

export function FinanceLocalizationSettings({ className }: FinanceLocalizationSettingsProps) {
  return (
    <FinanceSettingsShell
      activeTab="localization"
      title="Localization"
      subtitle="Customize preferences for a tailored user experience."
      className={className}
    >
      <div className="divide-y divide-stroke-soft-200">
        <SettingsFieldRow
          label="Language"
          description="Display the app in your selected language."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">English (ENG)</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Currency"
          description="View balances in your selected currency."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">United States Dollar (USD)</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Timezone and Format"
          description="Choose your timezone and preferred format."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">(GMT+03:00) Istanbul</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
          </div>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Date Format"
          description="Choose your preferred date format."
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-strong-950">DD / MM / YYYY</span>
            <LinkButton tone="primary" size="md">Edit</LinkButton>
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
