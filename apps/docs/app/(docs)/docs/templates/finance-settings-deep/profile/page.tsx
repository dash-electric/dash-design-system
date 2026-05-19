"use client"

import {
  RiFileCopyLine,
  RiShareLine,
  RiUserSettingsLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { Divider } from "@/registry/dash/ui/divider"
import {
  SettingsPagePreview,
  SettingsSectionHeader,
  FieldRow,
  ValueEdit,
} from "../_shared"

function ProfileSectionBody() {
  return (
    <>
      <SettingsSectionHeader
        icon={RiUserSettingsLine}
        title="Profile Settings"
        description="Customize and edit essential profile details."
      />
      <div className="px-4 lg:px-8">
        <Divider />
      </div>
      <div className="flex w-full flex-col gap-5 px-4 py-6 lg:px-8">
        <FieldRow
          label="Apex ID"
          description="A-12341234"
        >
          <div className="flex gap-3">
            <Button tone="neutral" style="stroke" size="xs">
              <RiFileCopyLine className="size-4" />
              Copy ID
            </Button>
            <Button tone="neutral" style="stroke" size="xs">
              <RiShareLine className="size-4" />
              Share ID
            </Button>
          </div>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Profile Photo"
          description="Min 400x400px, PNG or JPEG formats."
        >
          <div className="flex items-center gap-5">
            <Avatar size="2xl">
              <AvatarFallback>AT</AvatarFallback>
            </Avatar>
            <Button tone="neutral" style="stroke" size="xs">
              Upload
            </Button>
          </div>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Full Name"
          description="Your name will be visible to your contacts."
        >
          <ValueEdit>Arthur Taylor</ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Email Address"
          description="Business email address recommended."
        >
          <ValueEdit>arthur@alignui.com</ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Phone Number"
          description="Business phone number recommended."
        >
          <ValueEdit>+1 (012) 345-6789</ValueEdit>
        </FieldRow>

        <Divider />

        <FieldRow
          label="Legal Address"
          description="Legal residential address for billing details."
        >
          <ValueEdit multiline>
            12 Rue Principale
            <br />
            Ville de Québec,
            <br />
            Québec, Canada
          </ValueEdit>
        </FieldRow>
      </div>
    </>
  )
}

export default function FinanceSettingsDeepProfilePage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance / Settings"
        title="Profile"
        description="Apex ID display + Copy / Share buttons, then 6 field rows (Profile Photo, Full Name, Email Address, Phone Number, Legal Address) with right-hand value + LinkButton Edit. Ported from app/settings/profile-settings/page.tsx."
      />

      <DocsSection title="Profile section preview">
        <SettingsPagePreview active="profile">
          <ProfileSectionBody />
        </SettingsPagePreview>
      </DocsSection>

      <DocsSection title="Field inventory">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Apex ID</strong> — value
            <em> A-12341234</em>, right slot = Copy ID + Share ID xs stroke
            buttons (Remix copy / share icons).
          </li>
          <li>
            <strong className="text-text-strong-950">Profile Photo</strong> —
            56px Avatar fallback (initials), helper "Min 400x400px, PNG or
            JPEG formats." Upload xs stroke button.
          </li>
          <li>
            <strong className="text-text-strong-950">Full Name</strong> —
            <em> Arthur Taylor</em> + Edit LinkButton.
          </li>
          <li>
            <strong className="text-text-strong-950">Email Address</strong> —
            <em> arthur@alignui.com</em> + Edit.
          </li>
          <li>
            <strong className="text-text-strong-950">Phone Number</strong> —
            <em> +1 (012) 345-6789</em> + Edit.
          </li>
          <li>
            <strong className="text-text-strong-950">Legal Address</strong> —
            multiline (3 lines: 12 Rue Principale / Ville de Québec / Québec,
            Canada) + Edit.
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
