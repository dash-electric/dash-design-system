"use client"

import * as React from "react"
import {
  RiLockLine,
  RiLock2Line,
  RiShieldUserLine,
  RiDeviceLine,
  RiDeleteBin2Line,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiChatSmileLine,
  RiMailLine,
  RiShieldKeyholeLine,
  RiMacbookLine,
  RiSmartphoneLine,
  RiFirefoxLine,
  RiChromeLine,
  RiCloseLine,
  RiErrorWarningFill,
  RiInformationFill,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Alert } from "@/registry/dash/ui/alert"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Hint } from "@/registry/dash/ui/hint"
import { RadioGroup, RadioItem } from "@/registry/dash/ui/radio"
import { Divider } from "@/registry/dash/ui/divider"
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
  SettingsPagePreview,
  SectionTabRail,
  SectionCard,
  SectionTitle,
} from "../_shared"

const PRIVACY_TABS = [
  { label: "Change Password", icon: RiLockLine },
  { label: "2FA Security", icon: RiShieldUserLine },
  { label: "Active Sessions", icon: RiDeviceLine },
  { label: "Delete Account", icon: RiDeleteBin2Line },
]

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} required>
        {label}
      </Label>
      <InputRoot size="md">
        <InputIcon>
          <RiLock2Line className="size-5" />
        </InputIcon>
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder="• • • • • • • • • • "
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-text-soft-400"
        >
          {show ? (
            <RiEyeOffLine className="size-5" />
          ) : (
            <RiEyeLine className="size-5" />
          )}
        </button>
      </InputRoot>
    </div>
  )
}

function ChangePasswordPanel() {
  const [current, setCurrent] = React.useState("")
  const [next, setNext] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const criteria = {
    length: next.length >= 8,
    uppercase: /[A-Z]/.test(next),
    number: /[0-9]/.test(next),
  }
  const trueCount = Object.values(criteria).filter(Boolean).length
  return (
    <SectionCard>
      <SectionTitle
        title="Change Password"
        description="Update password for enhanced account security."
      />
      <Divider />
      <div className="flex flex-col gap-3">
        <PasswordField
          id="pw-current"
          label="Current Password"
          value={current}
          onChange={setCurrent}
        />
        <PasswordField
          id="pw-new"
          label="New Password"
          value={next}
          onChange={setNext}
        />
        <PasswordField
          id="pw-confirm"
          label="Confirm New Password"
          value={confirm}
          onChange={setConfirm}
        />

        <div className="-mt-0.5 space-y-2">
          {/* Simple 3-segment level bar (substitutes template LevelBar) */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i < trueCount ? "bg-success-base" : "bg-bg-weak-50",
                )}
              />
            ))}
          </div>
          <div className="text-xs text-text-sub-600">Must contain at least;</div>

          <Criterion ok={criteria.uppercase} text="At least 1 uppercase" />
          <Criterion ok={criteria.number} text="At least 1 number" />
          <Criterion ok={criteria.length} text="At least 8 characters" />
        </div>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button tone="neutral" style="stroke">
          Discard
        </Button>
        <Button>Apply Changes</Button>
      </div>
    </SectionCard>
  )
}

function Criterion({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-sub-600">
      {ok ? (
        <RiCheckboxCircleFill className="size-4 shrink-0 text-success-base" />
      ) : (
        <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
      )}
      {text}
    </div>
  )
}

function TwoFactorCard({
  id,
  icon: Icon,
  title,
  desc,
  checked,
  onSelect,
}: {
  id: string
  icon: React.ElementType
  title: string
  desc: string
  checked: boolean
  onSelect: () => void
}) {
  return (
    <label
      htmlFor={`tfa-${id}`}
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-start gap-3.5 rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 transition hover:bg-bg-weak-50 hover:ring-transparent",
        checked && "shadow-none ring-primary-base",
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
        <Icon className="size-5 text-text-sub-600" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        <div className="text-xs text-text-sub-600">{desc}</div>
      </div>
      <RadioItem id={`tfa-${id}`} value={id} />
    </label>
  )
}

function TwoFactorPanel() {
  const [value, setValue] = React.useState("")
  return (
    <SectionCard>
      <SectionTitle
        title="2FA Security"
        description="Enable two-factor authentication to your account."
      />
      <Divider />
      <RadioGroup
        value={value}
        onValueChange={setValue}
        className="flex flex-col gap-3"
      >
        <TwoFactorCard
          id="sms"
          icon={RiChatSmileLine}
          title="SMS Code"
          desc="Receive a one-time verification code via SMS to enter during login."
          checked={value === "sms"}
          onSelect={() => setValue("sms")}
        />
        <TwoFactorCard
          id="email"
          icon={RiMailLine}
          title="Email Code"
          desc="Get a temporary verification code sent to your email for added security."
          checked={value === "email"}
          onSelect={() => setValue("email")}
        />
        <TwoFactorCard
          id="authenticator"
          icon={RiShieldKeyholeLine}
          title="Authenticator App"
          desc="Use an authenticator app to generate time-based verification codes for login."
          checked={value === "authenticator"}
          onSelect={() => setValue("authenticator")}
        />
      </RadioGroup>
      <Button className="mt-1 w-full" disabled={!value}>
        Enable 2FA Security
      </Button>
    </SectionCard>
  )
}

const SESSIONS = [
  {
    icon: RiMacbookLine,
    name: "Macbook Pro",
    when: "(15 mins ago)",
    where: "London, United Kingdom",
  },
  {
    icon: RiSmartphoneLine,
    name: "iPhone X",
    when: "(30 mins ago)",
    where: "London, United Kingdom",
  },
  {
    icon: RiFirefoxLine,
    name: "Mozilla Firefox",
    when: "(45 mins ago)",
    where: "London, United Kingdom",
  },
  {
    icon: RiChromeLine,
    name: "Google Chrome",
    when: "(2 hours ago)",
    where: "London, United Kingdom",
  },
]

function ActiveSessionsCardsPanel() {
  return (
    <SectionCard>
      <SectionTitle
        title="Active Sessions"
        description="Monitor and manage all your active sessions."
      />
      <Divider />
      <div className="flex flex-col gap-3">
        {SESSIONS.map(({ icon: Icon, name, when, where }) => (
          <div
            key={name}
            className="flex items-center gap-3.5 rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-bg-weak-50">
              <Icon className="size-5 text-text-sub-600" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-sm font-medium text-text-strong-950">
                {name}
                <span className="ml-1 text-xs font-normal text-text-sub-600">
                  {when}
                </span>
              </div>
              <div className="text-xs text-text-sub-600">{where}</div>
            </div>
            <button type="button">
              <RiCloseLine className="size-5 text-text-sub-600" />
            </button>
          </div>
        ))}
      </div>
      <Button tone="destructive" style="stroke" className="mt-1 w-full">
        Select Devices to Log Out
      </Button>
    </SectionCard>
  )
}

function ActiveSessionsTablePanel() {
  return (
    <div className="flex w-full max-w-[640px] flex-col gap-4">
      <SectionTitle
        title="Active Sessions"
        description="Monitor and manage all your active sessions."
      />
      <div className="overflow-hidden rounded-xl border border-stroke-soft-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Last activity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SESSIONS.map(({ icon: Icon, name, when, where }) => (
              <TableRow key={name}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-bg-weak-50">
                      <Icon className="size-4 text-text-sub-600" />
                    </span>
                    <span className="text-sm font-medium text-text-strong-950">
                      {name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-text-sub-600">
                  {when.replace(/[()]/g, "")}
                </TableCell>
                <TableCell className="text-sm text-text-sub-600">
                  {where}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="xs" tone="neutral" style="ghost">
                    <RiCloseLine />
                    Log out
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function DeleteAccountPanel() {
  const [show, setShow] = React.useState(false)
  return (
    <SectionCard>
      <SectionTitle
        title="Delete Account"
        description="Manage the process of deleting account."
      />
      <Divider />
      <Alert
        status="error"
        appearance="lighter"
        size="xs"
        icon={<RiErrorWarningFill />}
      >
        This action cannot be undone.
      </Alert>
      <p className="text-sm text-text-sub-600">
        All of your data, including your profile, posts, and personal
        information, will be permanently removed.
        <br />
        <br />
        By entering your password, you confirm that you understand and accept
        the consequences of deleting your account.
      </p>
      <Divider />
      <div className="flex flex-col gap-1">
        <Label htmlFor="del-pw" required>
          Confirm Deletion
        </Label>
        <InputRoot size="md">
          <InputIcon>
            <RiLock2Line className="size-5" />
          </InputIcon>
          <Input
            id="del-pw"
            type={show ? "text" : "password"}
            placeholder="• • • • • • • • • • "
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-text-soft-400"
          >
            {show ? (
              <RiEyeOffLine className="size-5" />
            ) : (
              <RiEyeLine className="size-5" />
            )}
          </button>
        </InputRoot>
        <Hint>
          <RiInformationFill className="size-4" />
          Provide your password to proceed with account deletion.
        </Hint>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-3">
        <Button tone="neutral" style="stroke">
          Cancel
        </Button>
        <Button tone="destructive">Delete Account</Button>
      </div>
    </SectionCard>
  )
}

function PrivacyPreview({ tab }: { tab: string }) {
  return (
    <SettingsPagePreview active="privacy-security">
      <SectionTabRail tabs={PRIVACY_TABS} current={tab} />
      {tab === "Change Password" ? <ChangePasswordPanel /> : null}
      {tab === "2FA Security" ? <TwoFactorPanel /> : null}
      {tab === "Active Sessions" ? <ActiveSessionsCardsPanel /> : null}
      {tab === "Delete Account" ? <DeleteAccountPanel /> : null}
    </SettingsPagePreview>
  )
}

export default function HrSettingsDeepPrivacySecurityPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Settings"
        title="Privacy & Security"
        description="Account safety controls. Four panels: Change Password (with live 3-rule strength meter), 2FA Security (SMS / Email / Authenticator radio cards), Active Sessions (4-device card list + bulk log-out), Delete Account (destructive flow with confirmation password)."
      />

      <DocsSection title="Change Password panel">
        <PrivacyPreview tab="Change Password" />
      </DocsSection>

      <DocsSection title="2FA Security panel">
        <PrivacyPreview tab="2FA Security" />
      </DocsSection>

      <DocsSection title="Active Sessions panel">
        <PrivacyPreview tab="Active Sessions" />
      </DocsSection>

      <DocsSection title="Active Sessions — Table variant">
        <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6">
          <ActiveSessionsTablePanel />
        </div>
      </DocsSection>

      <DocsSection title="Delete Account panel">
        <PrivacyPreview tab="Delete Account" />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
          <li>
            <strong>Change Password</strong> — three masked Input rows with eye
            toggle. Below: 3-segment level bar (length / uppercase / number)
            and check/cross criterion list. Substitutes template{" "}
            <code>LevelBar</code> with three flex segments.
          </li>
          <li>
            <strong>2FA Security</strong> — 3 radio cards (SMS Code, Email
            Code, Authenticator App). Primary <em>Enable 2FA Security</em>{" "}
            button is disabled until a method is selected.
          </li>
          <li>
            <strong>Active Sessions</strong> — card list (Macbook Pro / iPhone
            X / Mozilla Firefox / Google Chrome, all London UK). Each row has
            close button on the right. Footer = destructive stroke{" "}
            <em>Select Devices to Log Out</em>.
          </li>
          <li>
            <strong>Active Sessions (Table)</strong> — alternative layout using
            dash-ds Table primitives with Device / Last activity / Location /
            Action columns.
          </li>
          <li>
            <strong>Delete Account</strong> — error Alert + warning copy +
            password confirm + 2-button footer (Cancel / Delete Account
            destructive).
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
