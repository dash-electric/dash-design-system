"use client"

import * as React from "react"
import { RiSunLine as Sun, RiMoonLine as Moon, RiComputerLine as Monitor } from "@remixicon/react"
import { Switch } from "@/registry/dash/ui/switch"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { cn } from "@/registry/dash/lib/utils"
import {
  MarketingSettingsShell,
  SettingsRow,
  SettingsRowDivider,
} from "@/registry/dash/templates/_internal/marketing-settings-shell"

export type MarketingAppearanceProps = {
  className?: string
}

const themeOptions = [
  { id: "light",  label: "Light",  icon: Sun },
  { id: "dark",   label: "Dark",   icon: Moon },
  { id: "system", label: "System", icon: Monitor },
]

const brandColors = [
  "#6E3FF3", "#7048E8", "#9333EA", "#DB2777", "#EF4444",
  "#F97316", "#EAB308", "#22C55E", "#14B8A6", "#0EA5E9",
]

/**
 * MarketingAppearance — Appearance settings panel.
 * Ported from AlignUI Pro Figma node `164843:36252`.
 */
export function MarketingAppearance({ className }: MarketingAppearanceProps) {
  const [theme, setTheme] = React.useState("system")
  const [color, setColor] = React.useState(brandColors[0])

  return (
    <MarketingSettingsShell
      activeId="appearance"
      title="Appearance Settings"
      description="Customize your dashboard appearance and layout settings"
      tabs={["Theme", "Preferences"]}
      activeTabIndex={0}
      className={className}
    >
      <div className="space-y-1">
        <SettingsRow
          title="Interface Theme"
          description="Select and customize your UI theme."
        >
          <div className="inline-flex rounded-md border border-stroke-soft-200 overflow-hidden">
            {themeOptions.map((t) => {
              const Icon = t.icon
              const active = t.id === theme
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm border-r border-stroke-soft-200 last:border-r-0 transition-colors",
                    active
                      ? "bg-(--dash-purple-50) text-(--dash-purple-700) font-medium"
                      : "text-text-sub-600 hover:bg-bg-weak-50",
                  )}
                  aria-pressed={active}
                >
                  <Icon className="size-3.5" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Brand Color"
          description="Select or customize your brand color."
        >
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {brandColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "size-6 rounded-full border-2 transition-all",
                  color === c ? "border-text-strong-950 scale-110" : "border-transparent",
                )}
                style={{ backgroundColor: c }}
                aria-label={`Select ${c}`}
              />
            ))}
          </div>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Sidebar Feature"
          description="What's shown in the desktop sidebar."
        >
          <InputRoot>
            <Input defaultValue="Recent Changes" />
          </InputRoot>
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Compact Mode"
          description="Reduces spacing across the interface."
        >
          <Switch />
        </SettingsRow>
        <SettingsRowDivider />

        <SettingsRow
          title="Show Quick Actions"
          description="Pin frequently used actions to the top of every page."
        >
          <Switch defaultChecked />
        </SettingsRow>
      </div>
    </MarketingSettingsShell>
  )
}
