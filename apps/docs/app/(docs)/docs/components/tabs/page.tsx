"use client"

import * as React from "react"
import {
  RiSettings3Line as Settings,
  RiUser3Line as User,
  RiBuildingLine as Building,
  RiNotification3Line as Bell,
  RiLockLine as Lock,
  RiContactsLine as Contacts,
  RiShareLine as Share,
  RiDownloadCloud2Line as Download,
  RiArrowRightSLine as ChevronRight,
  RiArrowDropDownLine as Arrow,
  RiInboxLine as Inbox,
  RiCheckLine as CheckMark,
} from "@remixicon/react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { Field, FieldDescription } from "@/registry/dash/ui/field"
import { Label } from "@/registry/dash/ui/label"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Textarea } from "@/registry/dash/ui/textarea"
import { ImageUpload } from "@/registry/dash/ui/file-upload"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Tabs — Figma 1:1 (7 nodes verified 2026-05-18).
 *
 *   3511:9958      Master spec — horizontal line + vertical pill variants
 *   3511:9832      Item states (default / hover / active / disabled)
 *   3516:10411     Tab w/ icon + label
 *   3515:10326     Tab w/ badge / counter
 *   3525:4598      Settings page use case — horizontal underline + side nav LIGHT
 *   3525:4279      same DARK
 *   3516:12344     Tabs inside Card surface
 */

export default function TabsDocsPage() {
  const [settingsTab, setSettingsTab] = React.useState("profile")
  const [sideMenu, setSideMenu] = React.useState("profile")

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Navigation"
        title="Tabs"
        description="Switch between sibling panels under a single surface. Two variants — line (underline, page-level header) + pill (rounded segment, list/sidebar). Tabs primitives mirror Radix Tabs."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add tabs`} />
      </DocsSection>

      <DocsSection title="Line variant">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default. Underline appears below the active trigger with primary-base color. Hover lifts text to strong-950.
        </p>
        <DocsExample
          title="3 tabs"
          preview={
            <Tabs defaultValue="overview" className="max-w-xl">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="py-4 text-sm text-text-sub-600">Overview content.</TabsContent>
              <TabsContent value="activity" className="py-4 text-sm text-text-sub-600">Activity content.</TabsContent>
              <TabsContent value="settings" className="py-4 text-sm text-text-sub-600">Settings content.</TabsContent>
            </Tabs>
          }
          code={`<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
</Tabs>`}
        />
      </DocsSection>

      <DocsSection title="Pill variant">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact rounded segments. Active uses bg-weak-50 fill. Use inside cards / popovers when underline would clash with the surrounding chrome.
        </p>
        <DocsExample
          title="Pill tabs"
          preview={
            <Tabs defaultValue="day" className="max-w-md">
              <TabsList variant="pill">
                <TabsTrigger variant="pill" value="day">Day</TabsTrigger>
                <TabsTrigger variant="pill" value="week">Week</TabsTrigger>
                <TabsTrigger variant="pill" value="month">Month</TabsTrigger>
                <TabsTrigger variant="pill" value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          }
          code={`<TabsList variant="pill">
  <TabsTrigger variant="pill" value="day">Day</TabsTrigger>
  <TabsTrigger variant="pill" value="week">Week</TabsTrigger>
</TabsList>`}
        />
      </DocsSection>

      <DocsSection title="With icon + label">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Each TabsTrigger accepts an icon prefix. Active state swaps icon color to primary-base automatically (`[&_svg]:text-primary-base`).
        </p>
        <DocsExample
          title="Icon + label tabs"
          preview={
            <Tabs defaultValue="general" className="max-w-xl">
              <TabsList>
                <TabsTrigger value="general"><Settings /> General</TabsTrigger>
                <TabsTrigger value="profile"><User /> Profile</TabsTrigger>
                <TabsTrigger value="security"><Lock /> Security</TabsTrigger>
                <TabsTrigger value="notifications"><Bell /> Notifications</TabsTrigger>
              </TabsList>
            </Tabs>
          }
          code={`<TabsTrigger value="profile"><User /> Profile</TabsTrigger>
<TabsTrigger value="security"><Lock /> Security</TabsTrigger>`}
        />
      </DocsSection>

      <DocsSection title="With badge / counter">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Append a Badge to the trigger for unread counts or status markers.
        </p>
        <DocsExample
          title="Inbox tabs"
          preview={
            <Tabs defaultValue="inbox" className="max-w-xl">
              <TabsList>
                <TabsTrigger value="inbox"><Inbox /> Inbox <Badge status="information" appearance="lighter" size="sm">12</Badge></TabsTrigger>
                <TabsTrigger value="archive"><Download /> Archive <Badge status="faded" appearance="lighter" size="sm">3</Badge></TabsTrigger>
                <TabsTrigger value="done"><CheckMark /> Done <Badge status="success" appearance="lighter" size="sm">38</Badge></TabsTrigger>
              </TabsList>
            </Tabs>
          }
          code={`<TabsTrigger value="inbox">
  <Inbox /> Inbox
  <Badge status="information" appearance="lighter" size="sm">12</Badge>
</TabsTrigger>`}
        />
      </DocsSection>

      <DocsSection title="Settings page composition">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Real-world use case. Page header + horizontal line tabs (top-level sections) + secondary side-nav (sub-sections inside the active tab) + content body. Mirrors Figma 3525:4598 / 3525:4279.
        </p>
        <DocsExample
          title='"Profile Settings"'
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
              <header className="flex items-start gap-3 px-6 py-6 border-b border-stroke-soft-200">
                <span className="size-9 rounded-full bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400 shrink-0">
                  <Settings className="size-4" />
                </span>
                <div>
                  <div className="text-base font-semibold text-text-strong-950">Settings Page</div>
                  <div className="text-xs text-text-sub-600">Manage your preferences and configure various options.</div>
                </div>
              </header>

              <Tabs value={settingsTab} onValueChange={setSettingsTab} className="px-6">
                <TabsList className="overflow-x-auto">
                  <TabsTrigger value="general">General Settings</TabsTrigger>
                  <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                  <TabsTrigger value="company">Company Settings</TabsTrigger>
                  <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy &amp; Security</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="py-6">
                  <div className="grid grid-cols-[200px_1fr] gap-6">
                    <aside className="space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-text-soft-400 px-2 py-1">Select menu</div>
                      {[
                        { id: "profile", label: "Profile Settings", Icon: User, chevron: true },
                        { id: "contact", label: "Contact Information", Icon: Contacts },
                        { id: "social",  label: "Social Links",        Icon: Share },
                        { id: "export",  label: "Export Data",         Icon: Download },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSideMenu(m.id)}
                          className={[
                            "flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm text-left transition-colors",
                            sideMenu === m.id
                              ? "bg-bg-weak-50 text-text-strong-950"
                              : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950",
                          ].join(" ")}
                        >
                          <m.Icon className={sideMenu === m.id ? "size-4 text-primary" : "size-4 text-icon-soft-400"} />
                          <span className="flex-1">{m.label}</span>
                          {m.chevron && sideMenu === m.id ? <ChevronRight className="size-4 text-icon-soft-400" /> : null}
                        </button>
                      ))}
                    </aside>

                    <div className="space-y-5 max-w-md">
                      <div className="flex items-start gap-4 pb-4 border-b border-stroke-soft-200">
                        <ImageUpload
                          label="Upload Image"
                          description="Min 400x400px, PNG or JPEG"
                          accept="image/png,image/jpeg"
                        />
                      </div>
                      <Field>
                        <Label htmlFor="full-name">Full Name <span className="text-(--state-error-base)">*</span></Label>
                        <InputRoot>
                          <Input id="full-name" defaultValue="Sophia Williams" />
                        </InputRoot>
                      </Field>
                      <Field>
                        <Label htmlFor="title">Title <span className="text-(--state-error-base)">*</span></Label>
                        <InputRoot>
                          <Input id="title" placeholder="e.g. UI/UX Designer" />
                        </InputRoot>
                      </Field>
                      <Field>
                        <Label htmlFor="bio">Biography <span className="text-text-soft-400 font-normal">(Optional)</span></Label>
                        <Textarea id="bio" placeholder="Describe yourself..." maxLength={200} />
                        <FieldDescription>It will be displayed on your profile.</FieldDescription>
                      </Field>
                      <div className="flex items-center gap-2 justify-end">
                        <Button size="sm" tone="neutral" style="stroke">Discard</Button>
                        <Button size="sm" tone="primary">Apply Changes</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="general"       className="py-6 text-sm text-text-sub-600">General settings content here.</TabsContent>
                <TabsContent value="company"       className="py-6 text-sm text-text-sub-600">Company settings content here.</TabsContent>
                <TabsContent value="notifications" className="py-6 text-sm text-text-sub-600">Notification settings content here.</TabsContent>
                <TabsContent value="privacy"       className="py-6 text-sm text-text-sub-600">Privacy &amp; Security content here.</TabsContent>
              </Tabs>
            </div>
          }
          code={`<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="general">General Settings</TabsTrigger>
    <TabsTrigger value="profile">Profile Settings</TabsTrigger>
    ...
  </TabsList>
  <TabsContent value="profile">
    <SideNav /> + <ProfileForm />
  </TabsContent>
</Tabs>`}
        />
      </DocsSection>

      <DocsSection title="Inside a card surface">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Tabs in a card-level dashboard — line variant lives at the top of a Card, content body below.
        </p>
        <DocsExample
          title="Revenue card"
          preview={
            <div className="max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-(--shadow-custom-xs) overflow-hidden">
              <div className="px-4 pt-4">
                <div className="text-sm font-semibold text-text-strong-950 mb-1">Revenue</div>
                <div className="text-xs text-text-sub-600 mb-3">Track payouts and outstanding invoices.</div>
              </div>
              <Tabs defaultValue="paid" className="px-4">
                <TabsList>
                  <TabsTrigger value="paid">Paid <Badge status="success" appearance="lighter" size="sm">24</Badge></TabsTrigger>
                  <TabsTrigger value="pending">Pending <Badge status="warning" appearance="lighter" size="sm">3</Badge></TabsTrigger>
                  <TabsTrigger value="overdue">Overdue <Badge status="error" appearance="lighter" size="sm">1</Badge></TabsTrigger>
                </TabsList>
                <TabsContent value="paid" className="py-4">
                  <div className="text-2xl font-semibold text-text-strong-950">$12,402.50</div>
                  <div className="text-xs text-text-sub-600 mt-1">Total received this month.</div>
                </TabsContent>
                <TabsContent value="pending" className="py-4 text-sm text-text-sub-600">Pending content.</TabsContent>
                <TabsContent value="overdue" className="py-4 text-sm text-text-sub-600">Overdue content.</TabsContent>
              </Tabs>
            </div>
          }
          code={`<Card>
  <Header>Revenue</Header>
  <Tabs defaultValue="paid">
    <TabsList>
      <TabsTrigger value="paid">Paid <Badge>24</Badge></TabsTrigger>
      ...
    </TabsList>
    <TabsContent value="paid">...</TabsContent>
  </Tabs>
</Card>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "Tabs", type: "Radix Root", description: "Controlled via value + onValueChange, or uncontrolled via defaultValue." },
            { name: "TabsList.variant", type: '"line" | "pill"', defaultValue: '"line"', description: "line = underline page-level. pill = compact rounded segments." },
            { name: "TabsTrigger.variant", type: '"line" | "pill"', defaultValue: '"line"', description: "Match the parent TabsList variant." },
            { name: "TabsTrigger.value", type: "string", description: "Required identifier. Must match a TabsContent.value." },
            { name: "TabsTrigger.disabled", type: "boolean", description: "Disabled — opacity 50, no pointer events." },
            { name: "TabsContent.value", type: "string", description: "Required identifier. Renders when the active value matches." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
