"use client"

import * as React from "react"
import {
  RiPencilLine,
  RiAlertFill,
  RiArrowRightUpLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import { Field, FieldGroup } from "@/registry/dash/ui/field"
import { Label } from "@/registry/dash/ui/label"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Switch } from "@/registry/dash/ui/switch"
import { RadioGroup, RadioItem } from "@/registry/dash/ui/radio"
import { ContentDivider, Divider } from "@/registry/dash/ui/divider"
import { PortalShell, PortalHeader } from "../_portal-shared"

/**
 * Portal Setting — ported from
 * next-portal-v2-web/app/[locale]/(dashboard)/setting/page.tsx +
 * AccountDetailPage.tsx + DashSettingPage.tsx. Two top-level tabs:
 *
 *   1. Account detail — Avatar + name + email + phone. Edit toggle.
 *   2. Dash setting (super_admin only) — Delivery governance policy
 *      (optional-code vs mandatory-code) + Delivery creation configuration
 *      (package name validation: alphanumeric/alphabetical/numeric).
 *
 * Sample copy preserved verbatim from settings.account + settings.dash
 * locales (en.json).
 */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px] p-6">{children}</div>
    </div>
  )
}

function WidgetCard({
  title,
  action,
  children,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
      <div className="flex h-14 items-center justify-between px-5">
        <p className="text-base font-medium text-text-strong-950">{title}</p>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function PortalSettingPage() {
  const [policy, setPolicy] = React.useState<"optional" | "mandatory">("optional")
  const [packageRule, setPackageRule] = React.useState("alphanumeric")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Portal Setting"
        description="Account + tenant policy settings. Horizontal tabs (Account detail / Dash setting). Account form is read-only by default with an Edit toggle; Dash setting hosts the delivery governance policy (one-time delivery code) and delivery creation configuration (package name validation)."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Setting page"
          description="Super admin view — both tabs visible. Account-detail tab active, profile fields read-only until Edit is clicked."
          preview={
            <DocsTemplatePreview>
              <PortalShell active="/setting">
                <PortalHeader title="Setting" />
                <div className="px-8 py-4">
                  <Tabs defaultValue="account-detail">
                    <div className="border-b border-stroke-soft-200">
                      <TabsList>
                        <TabsTrigger value="account-detail">Account detail</TabsTrigger>
                        <TabsTrigger value="dash-setting">Dash setting</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="account-detail" className="py-6">
                      <WidgetCard
                        title="Profile"
                        action={
                          <div className="flex gap-3">
                            <Button tone="neutral" style="stroke" size="sm">
                              Reset password
                            </Button>
                            <Button tone="primary" style="stroke" size="sm">
                              <RiPencilLine className="size-4" />
                              Edit
                            </Button>
                          </div>
                        }
                      >
                        <ContentDivider>Profile info</ContentDivider>
                        <div className="flex flex-col gap-4 p-5">
                          <Avatar size="2xl">
                            <AvatarFallback>SP</AvatarFallback>
                          </Avatar>

                          <Divider />

                          <FieldGroup>
                            <Field>
                              <Label>Full name</Label>
                              <InputRoot>
                                <Input value="Sigit Permana" readOnly />
                              </InputRoot>
                            </Field>
                            <Field>
                              <Label>Email</Label>
                              <InputRoot>
                                <Input value="sigit@dash.id" disabled />
                              </InputRoot>
                            </Field>
                            <Field>
                              <Label>Phone</Label>
                              <InputRoot>
                                <div className="flex items-center gap-2 pl-1 text-sm text-text-strong-950">
                                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-(--state-error-base) text-[10px] text-static-white">
                                    ID
                                  </span>
                                  +62
                                </div>
                                <Input value="812-3456-7890" disabled />
                              </InputRoot>
                            </Field>
                          </FieldGroup>
                        </div>
                      </WidgetCard>
                    </TabsContent>

                    <TabsContent value="dash-setting" className="py-6">
                      <div className="flex flex-col gap-6">
                        {/* Delivery governance policy */}
                        <WidgetCard
                          title="Delivery governance policy"
                          action={
                            <Button tone="primary" style="ghost" size="sm">
                              Learn more
                              <RiArrowRightUpLine className="size-4" />
                            </Button>
                          }
                        >
                          <ContentDivider>Detail</ContentDivider>
                          <div className="flex flex-col gap-4 p-5">
                            <RadioGroup
                              value={policy}
                              onValueChange={(v) => setPolicy(v as "optional" | "mandatory")}
                              className="flex flex-col gap-4"
                            >
                              <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-bg-white-0 p-4 shadow-xs ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50">
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium text-text-strong-950">
                                    Optional delivery code
                                  </p>
                                  <p className="text-xs text-text-sub-600">
                                    Recipients can confirm with or without a one-time code.
                                  </p>
                                </div>
                                <RadioItem value="optional" id="optional" />
                              </label>
                              <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-bg-white-0 p-4 shadow-xs ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50">
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium text-text-strong-950">
                                    Mandatory delivery code
                                  </p>
                                  <p className="text-xs text-text-sub-600">
                                    Every delivery requires a one-time code from a generated batch.
                                  </p>
                                </div>
                                <RadioItem value="mandatory" id="mandatory" />
                              </label>
                            </RadioGroup>
                          </div>

                          {policy === "mandatory" ? (
                            <>
                              <ContentDivider>Info</ContentDivider>
                              <div className="flex flex-col gap-3 p-5">
                                <div className="flex flex-col gap-1">
                                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-soft-400">
                                    Active date
                                  </p>
                                  <p className="text-sm font-medium text-text-strong-950">
                                    May 12, 2026 · 14:22
                                  </p>
                                </div>
                                <Divider />
                                <div className="flex gap-7">
                                  <div className="flex flex-1 flex-col gap-1">
                                    <p className="text-[10px] font-medium uppercase tracking-wider text-text-soft-400">
                                      Last changed by
                                    </p>
                                    <p className="text-sm font-medium text-text-strong-950">
                                      Sigit Permana
                                    </p>
                                  </div>
                                  <div className="flex flex-1 flex-col gap-1">
                                    <p className="text-[10px] font-medium uppercase tracking-wider text-text-soft-400">
                                      Last changed at
                                    </p>
                                    <p className="text-sm font-medium text-text-strong-950">
                                      May 12, 2026 · 14:22
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between border-t border-stroke-soft-200 px-5 py-4">
                                <p className="text-sm text-text-sub-600">
                                  Code batches are managed under Policies.
                                </p>
                                <Button tone="primary" style="filled" size="sm">
                                  Go to policies
                                </Button>
                              </div>
                            </>
                          ) : null}
                        </WidgetCard>

                        {/* Delivery creation configuration */}
                        <WidgetCard title="Delivery creation configuration">
                          <ContentDivider>Package field validation</ContentDivider>
                          <div className="flex flex-col gap-4 p-5">
                            <div className="flex flex-col gap-4 rounded-xl bg-bg-white-0 p-4 shadow-xs ring-1 ring-inset ring-stroke-soft-200">
                              <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-1">
                                  <p className="text-sm font-medium text-text-strong-950">
                                    Package name
                                  </p>
                                  <p className="text-xs text-text-sub-600">
                                    Set the validation rule for the package name field on delivery creation.
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-text-sub-600">Required</span>
                                  <Switch checked disabled />
                                </div>
                              </div>

                              <RadioGroup
                                value={packageRule}
                                onValueChange={setPackageRule}
                                className="flex flex-col gap-3 lg:flex-row lg:gap-6"
                              >
                                <label className="flex cursor-pointer items-center gap-3">
                                  <RadioItem value="alphanumeric" id="alphanumeric" />
                                  <span className="text-sm text-text-strong-950">
                                    Alphanumeric
                                  </span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-3">
                                  <RadioItem value="alphabetical" id="alphabetical" />
                                  <span className="text-sm text-text-strong-950">
                                    Alphabetical
                                  </span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-3">
                                  <RadioItem value="numeric" id="numeric" />
                                  <span className="text-sm text-text-strong-950">
                                    Numeric
                                  </span>
                                </label>
                              </RadioGroup>
                            </div>
                          </div>
                        </WidgetCard>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </PortalShell>
            </DocsTemplatePreview>
          }
          code={`<PortalShell active="/setting">
  <PortalHeader title="Setting" />
  <Tabs defaultValue="account-detail">
    <TabsList>
      <TabsTrigger value="account-detail">Account detail</TabsTrigger>
      <TabsTrigger value="dash-setting">Dash setting</TabsTrigger>
    </TabsList>
    <TabsContent value="account-detail"><AccountDetail /></TabsContent>
    <TabsContent value="dash-setting"><DashSetting role={userRole} /></TabsContent>
  </Tabs>
</PortalShell>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><b>Tabs</b> — Account detail (always) + Dash setting (super_admin only). Horizontal strip, default underline style.</li>
          <li><b>Account card</b> — Profile info section with Avatar + Full name + Email (disabled) + Phone (disabled, +62 prefix). Edit + Reset password actions in card header.</li>
          <li><b>Governance policy</b> — Two cards (Optional / Mandatory) inside a RadioGroup. Selecting Mandatory opens a ConfirmationModal in production; on confirm, the Info section appears showing active date + last changed by/at + "Go to policies" footer.</li>
          <li><b>Delivery creation configuration</b> — Package name validation card: Required Switch (locked on) + RadioGroup (alphanumeric/alphabetical/numeric).</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><b>Use</b> for account + tenant settings hubs where the user toggles between personal scope and admin scope.</li>
          <li><b>Use</b> the "select first, confirm second" pattern (radio → confirmation modal) for irreversible tenant-wide policy changes.</li>
          <li><b>Use</b> the Info section pattern (Active date + Last changed by / Last changed at) whenever a policy carries audit weight.</li>
          <li><b>Don't</b> use this template for app-wide preferences (theme, language) — those belong in topbar dropdowns.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "userRole", type: 'string', description: 'When userRole === "client_super_admin", the Dash setting tab is visible.' },
            { name: "profile", type: "{ name, email, phone, profilePictureImgUrl? }", description: "Account-detail tab data." },
            { name: "policy", type: '"optional" | "mandatory"', description: "Current one-time delivery code policy." },
            { name: "packageRule", type: '"alphanumeric" | "alphabetical" | "numeric"', description: "Package name validation rule." },
            { name: "onSaveProfile", type: "(p: Profile) => Promise<void>", description: "PATCH user; uploads profile picture if set." },
            { name: "onChangePolicy", type: "(active: boolean) => Promise<void>", description: "Toggles one-time code policy after confirmation." },
            { name: "onChangePackageRule", type: "(rule: string) => Promise<void>", description: "Updates the package name validation rule." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
