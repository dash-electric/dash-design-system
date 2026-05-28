"use client"

import { RiArrowRightSLine, RiNotificationBadgeLine } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { Divider } from "@/registry/dash/ui/divider"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { RadioGroup, RadioItem } from "@/registry/dash/ui/radio"
import { Switch } from "@/registry/dash/ui/switch"
import {
  SettingsPagePreview,
  SettingsSectionHeader,
  FieldRow,
} from "../_shared"

/* Row helpers ------------------------------------------------------------- */

function SwitchRow({
  id,
  title,
  description,
  defaultChecked,
  withEdit,
}: {
  id: string
  title: string
  description: string
  defaultChecked?: boolean
  withEdit?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <Switch id={id} defaultChecked={defaultChecked} className="mt-0.5" />
      <div>
        <label htmlFor={id} className="block cursor-pointer">
          <div className="text-sm font-medium text-text-strong-950">
            {title}
          </div>
          <div className="mt-1 text-xs text-text-sub-600">{description}</div>
        </label>
        {withEdit ? (
          <LinkButton tone="primary" size="md" href="#" className="mt-2.5">
            Edit
            <RiArrowRightSLine className="size-4" />
          </LinkButton>
        ) : null}
      </div>
    </div>
  )
}

function CheckboxRow({
  id,
  title,
  description,
  defaultChecked,
}: {
  id: string
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <Checkbox id={id} defaultChecked={defaultChecked} className="mt-0.5" />
      <label htmlFor={id} className="cursor-pointer">
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        <div className="mt-1 text-xs text-text-sub-600">{description}</div>
      </label>
    </div>
  )
}

function RadioRow({
  id,
  value,
  title,
  titleSuffix,
  description,
}: {
  id: string
  value: string
  title: string
  titleSuffix?: string
  description: string
}) {
  return (
    <div className="flex items-start gap-2">
      <RadioItem value={value} id={id} className="mt-0.5" />
      <label htmlFor={id} className="cursor-pointer">
        <div className="text-sm font-medium text-text-strong-950">
          {title}
          {titleSuffix ? (
            <span className="text-xs font-normal text-text-sub-600">
              {" "}
              {titleSuffix}
            </span>
          ) : null}
        </div>
        <div className="mt-1 text-xs text-text-sub-600">{description}</div>
      </label>
    </div>
  )
}

/* Section body ------------------------------------------------------------ */

function NotificationsSectionBody() {
  return (
    <>
      <SettingsSectionHeader
        icon={RiNotificationBadgeLine}
        title="Notification Settings"
        description="Customize and edit notification preferences."
      />
      <div className="px-4 lg:px-8">
        <Divider />
      </div>
      <div className="flex w-full flex-col gap-6 px-4 py-6 lg:px-8">
        <FieldRow
          label="General Notifications"
          description="Notifications about transactions, balance and exclusive offers."
        >
          <div className="flex flex-col gap-6">
            <SwitchRow
              id="fs-trx-alerts"
              title="Transaction Alerts"
              description="Receive notifications for every transaction."
              defaultChecked
            />
            <SwitchRow
              id="fs-low-balance"
              title="Low Balance Alert"
              description="Receive a warning if your balance falls below $10,000.00."
              withEdit
            />
            <SwitchRow
              id="fs-exclusive-offers"
              title="Exclusive Offers"
              description="Get exclusive access to promotions, discounts, and more."
            />
          </div>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Notification Method"
          description="Choose how you prefer to receive notifications."
        >
          <div className="flex flex-col gap-6">
            <CheckboxRow
              id="fs-email-notif"
              title="Email Notifications"
              description="Receive notifications via email"
              defaultChecked
            />
            <CheckboxRow
              id="fs-push-notif"
              title="Push Notifications"
              description="Get real-time updates and alerts directly on your device"
              defaultChecked
            />
            <CheckboxRow
              id="fs-sms-notif"
              title="SMS Notifications"
              description="Receive notifications via SMS"
            />
          </div>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Theme Options"
          description="Pick theme to personalize experience."
        >
          <RadioGroup defaultValue="light" className="flex flex-col gap-6">
            <RadioRow
              id="fs-theme-light"
              value="light"
              title="Light Mode"
              titleSuffix="(Default)"
              description="Pick a clean and classic light theme."
            />
            <RadioRow
              id="fs-theme-dark"
              value="dark"
              title="Dark Mode"
              description="Select a sleek and modern dark theme."
            />
            <RadioRow
              id="fs-theme-system"
              value="system"
              title="System Mode"
              description="Adapts to your device's theme."
            />
          </RadioGroup>
        </FieldRow>
      </div>
    </>
  )
}

export default function FinanceSettingsDeepNotificationsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance / Settings"
        title="Notifications"
        description="Three field rows: General Notifications (3 Switch rows — Transaction Alerts default ON + Low Balance Alert with secondary Edit link + Exclusive Offers), Notification Method (3 Checkboxes — Email + Push default ON, SMS OFF), Theme Options (3 RadioItems — Light default, Dark, System). Ported from app/settings/notification-settings/page.tsx."
      />

      <DocsSection title="Notifications section preview">
        <SettingsPagePreview active="notifications">
          <NotificationsSectionBody />
        </SettingsPagePreview>
      </DocsSection>

      <DocsSection title="Row inventory">
        <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">
              Transaction Alerts
            </strong>{" "}
            — Switch (default ON). "Receive notifications for every
            transaction."
          </li>
          <li>
            <strong className="text-text-strong-950">
              Low Balance Alert
            </strong>{" "}
            — Switch (default OFF) + a follow-up <em>Edit</em> LinkButton
            inset under the description. "Receive a warning if your balance
            falls below $10,000.00."
          </li>
          <li>
            <strong className="text-text-strong-950">Exclusive Offers</strong>{" "}
            — Switch (default OFF).
          </li>
          <li>
            <strong className="text-text-strong-950">
              Email / Push / SMS
            </strong>{" "}
            — three Checkbox rows; Email + Push default checked, SMS unchecked.
          </li>
          <li>
            <strong className="text-text-strong-950">Theme Options</strong> —
            RadioGroup default <code>light</code> with Light Mode (Default) /
            Dark Mode / System Mode.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
