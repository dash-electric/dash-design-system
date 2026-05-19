"use client"

import * as React from "react"
import {
  RiEqualizerLine,
  RiNotificationBadgeLine,
  RiSettingsLine,
  RiInformationFill,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Alert } from "@/registry/dash/ui/alert"
import { Button } from "@/registry/dash/ui/button"
import { Switch } from "@/registry/dash/ui/switch"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { Divider } from "@/registry/dash/ui/divider"
import {
  SettingsPagePreview,
  SectionTabRail,
  SectionCard,
  SectionTitle,
} from "../_shared"

const NOTIF_TABS = [
  { label: "Preferences", icon: RiEqualizerLine },
  { label: "Method", icon: RiNotificationBadgeLine },
  { label: "Advanced", icon: RiSettingsLine },
]

function SwitchRow({
  id,
  title,
  desc,
  defaultChecked,
}: {
  id: string
  title: string
  desc: string
  defaultChecked?: boolean
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2">
      <Switch id={id} defaultChecked={defaultChecked} />
      <div className="space-y-1">
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        <div className="text-xs text-text-sub-600">{desc}</div>
      </div>
    </label>
  )
}

function CheckboxRow({
  id,
  title,
  desc,
  defaultChecked,
}: {
  id: string
  title: string
  desc: string
  defaultChecked?: boolean
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2">
      <Checkbox id={id} defaultChecked={defaultChecked} className="mt-0.5" />
      <div className="space-y-1">
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        <div className="text-xs text-text-sub-600">{desc}</div>
      </div>
    </label>
  )
}

function PreferencesPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Notification Preferences"
        description="Choose what notifications you want to receive."
      />
      <Divider />
      <div className="flex flex-col gap-3">
        <SwitchRow
          id="pref-news"
          title="News and Updates"
          desc="Stay informed about the latest news, updates, and announcements."
          defaultChecked
        />
        <SwitchRow
          id="pref-reminders"
          title="Reminders and Events"
          desc="Get reminders for upcoming events, deadlines, and appointments."
          defaultChecked
        />
        <SwitchRow
          id="pref-promotions"
          title="Promotions and Offers"
          desc="Receive notifications about special promotions, discounts, and exclusive offers."
        />
      </div>
      <Alert
        status="information"
        appearance="lighter"
        size="xs"
        icon={<RiInformationFill />}
      >
        Maximize your app usage by leaving notification settings active.
      </Alert>
      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button tone="neutral" style="stroke">
          Discard
        </Button>
        <Button>Apply Changes</Button>
      </div>
    </SectionCard>
  )
}

function MethodPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Notification Method"
        description="Choose how you prefer to receive notifications."
      />
      <Divider />
      <div className="flex flex-col gap-3">
        <CheckboxRow
          id="meth-email"
          title="Email Notifications"
          desc="Receive notifications via email"
          defaultChecked
        />
        <CheckboxRow
          id="meth-push"
          title="Push Notifications"
          desc="Get real-time updates and alerts directly on your device"
          defaultChecked
        />
        <CheckboxRow
          id="meth-sms"
          title="SMS Notifications"
          desc="Receive notifications via SMS"
        />
      </div>
      <Alert
        status="information"
        appearance="lighter"
        size="xs"
        icon={<RiInformationFill />}
      >
        Maximize your app usage by leaving notification settings active.
      </Alert>
      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button tone="neutral" style="stroke">
          Discard
        </Button>
        <Button>Apply Changes</Button>
      </div>
    </SectionCard>
  )
}

function AdvancedPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Advanced Preferences"
        description="Choose advanced notifications you want to receive."
      />
      <Divider />
      <div className="flex flex-col gap-3">
        <SwitchRow
          id="adv-leave"
          title="Leave and Attendance"
          desc="Updates on approved leaves, attendance records, and important attendance-related reminders."
          defaultChecked
        />
        <SwitchRow
          id="adv-deadline"
          title="Deadline Notification"
          desc="Receive timely reminders before approaching deadlines."
          defaultChecked
        />
      </div>
      <Alert
        status="information"
        appearance="lighter"
        size="xs"
        icon={<RiInformationFill />}
      >
        Maximize your app usage by leaving notification settings active.
      </Alert>
      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button tone="neutral" style="stroke">
          Discard
        </Button>
        <Button>Apply Changes</Button>
      </div>
    </SectionCard>
  )
}

function NotificationsPreview({ tab }: { tab: string }) {
  return (
    <SettingsPagePreview active="notifications">
      <SectionTabRail tabs={NOTIF_TABS} current={tab} />
      {tab === "Preferences" ? <PreferencesPanel /> : null}
      {tab === "Method" ? <MethodPanel /> : null}
      {tab === "Advanced" ? <AdvancedPanel /> : null}
    </SettingsPagePreview>
  )
}

export default function HrSettingsDeepNotificationsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Settings"
        title="Notification Settings"
        description="What to notify, how to deliver, and which advanced topics to subscribe to. Three panels: Preferences (Switch list), Method (Checkbox list), Advanced (Switch list). All three end with the same info Alert + Discard / Apply Changes footer."
      />

      <DocsSection title="Preferences panel">
        <NotificationsPreview tab="Preferences" />
      </DocsSection>

      <DocsSection title="Method panel">
        <NotificationsPreview tab="Method" />
      </DocsSection>

      <DocsSection title="Advanced panel">
        <NotificationsPreview tab="Advanced" />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            <strong>Row layout</strong> — control on the left (Switch or
            Checkbox aligned to the top), label + helper text on the right.
          </li>
          <li>
            <strong>Preferences</strong> — News and Updates (on), Reminders and
            Events (on), Promotions and Offers (off).
          </li>
          <li>
            <strong>Method</strong> — Email (on), Push (on), SMS (off). Source
            uses Checkbox instead of Switch.
          </li>
          <li>
            <strong>Advanced</strong> — Leave and Attendance (on), Deadline
            Notification (on).
          </li>
          <li>
            <strong>Alert</strong> — info, lighter, xs:{" "}
            <em>&quot;Maximize your app usage by leaving notification
            settings active.&quot;</em>
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
