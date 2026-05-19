"use client"

import { RiGlobalLine } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Divider } from "@/registry/dash/ui/divider"
import {
  SettingsPagePreview,
  SettingsSectionHeader,
  FieldRow,
  ValueEdit,
} from "../_shared"

function LocalizationSectionBody() {
  return (
    <>
      <SettingsSectionHeader
        icon={RiGlobalLine}
        title="Localization"
        description="Customize preferences for a tailored user experience."
      />
      <div className="px-4 lg:px-8">
        <Divider />
      </div>
      <div className="flex w-full flex-col gap-5 px-4 py-6 lg:px-8">
        <FieldRow
          label="Language"
          description="Display the app in your selected language."
        >
          <ValueEdit>English (ENG)</ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Currency"
          description="View balances in your selected currency."
        >
          <ValueEdit>United States Dollar (USD)</ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Timezone and Format"
          description="Choose your timezone and preferred format."
        >
          <ValueEdit>(GMT +03:00) Istanbul</ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Date Format"
          description="Choose your preferred date format."
        >
          <ValueEdit>DD / MM / YYYY</ValueEdit>
        </FieldRow>
      </div>
    </>
  )
}

export default function FinanceSettingsDeepLocalizationPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance / Settings"
        title="Localization"
        description="Four field rows: Language (English ENG), Currency (United States Dollar USD), Timezone and Format ((GMT +03:00) Istanbul), Date Format (DD / MM / YYYY). All value + LinkButton Edit pattern. Ported from app/settings/localization/page.tsx."
      />

      <DocsSection title="Localization section preview">
        <SettingsPagePreview active="localization">
          <LocalizationSectionBody />
        </SettingsPagePreview>
      </DocsSection>

      <DocsSection title="Field inventory">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Language</strong> —
            <em> English (ENG)</em>.
          </li>
          <li>
            <strong className="text-text-strong-950">Currency</strong> —
            <em> United States Dollar (USD)</em>.
          </li>
          <li>
            <strong className="text-text-strong-950">
              Timezone and Format
            </strong>{" "}
            — <em>(GMT +03:00) Istanbul</em>.
          </li>
          <li>
            <strong className="text-text-strong-950">Date Format</strong> —
            <em> DD / MM / YYYY</em>.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
