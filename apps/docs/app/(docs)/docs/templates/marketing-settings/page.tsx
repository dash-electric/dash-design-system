"use client"

import * as React from "react"
import Link from "next/link"
import {
  RiUser6Line as User,
  RiShieldUserLine as Shield,
  RiEqualizerLine as Plug,
  RiPaletteLine as Palette,
  RiStore2Line as Store,
  RiShoppingBag3Line as Package,
  RiBankCardLine as Card,
  RiTruckLine as Truck,
  RiArrowRightSLine as ChevronRight,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsVariantTable,
} from "@/components/docs/page-shell"

/**
 * Marketing Settings — overview + 2-pane modal shell. Ported from AlignUI
 * Marketing Template (components/settings-modal/, 2026-05-18).
 */

type NavItem = {
  id: string
  icon: React.ElementType
  label: string
  href: string
}
type NavGroup = { group: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    group: "PERSONAL SETTINGS",
    items: [
      { id: "account", icon: User, label: "Account Settings", href: "/docs/templates/marketing-settings/account" },
      { id: "privacy-security", icon: Shield, label: "Privacy & Security", href: "/docs/templates/marketing-settings/privacy-security" },
      { id: "integrations", icon: Plug, label: "Integrations", href: "/docs/templates/marketing-settings/integrations" },
      { id: "appearance", icon: Palette, label: "Appearance", href: "/docs/templates/marketing-settings/appearance" },
    ],
  },
  {
    group: "GENERAL SETTINGS",
    items: [
      { id: "store", icon: Store, label: "Store Settings", href: "/docs/templates/marketing-settings/store" },
      { id: "product", icon: Package, label: "Products Settings", href: "/docs/templates/marketing-settings/product" },
      { id: "payment-billing", icon: Card, label: "Payment & Billing", href: "/docs/templates/marketing-settings/payment-billing" },
      { id: "shipping-delivery", icon: Truck, label: "Shipping & Delivery", href: "/docs/templates/marketing-settings/shipping-delivery" },
    ],
  },
]

function ModalShellPreview({ activeId = "account" }: { activeId?: string }) {
  return (
    <div className="relative mx-auto flex min-h-[520px] w-full max-w-[940px] overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 shadow-lg">
      {/* Sidebar */}
      <div className="hidden w-64 shrink-0 flex-col gap-4 border-r border-stroke-soft-200 p-4 lg:flex">
        {NAV.map((group, gi) => (
          <React.Fragment key={group.group}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="flex-1 border-t border-dashed border-stroke-soft-200" />
                <span className="text-[10px] font-medium tracking-[0.18em] text-text-soft-400">
                  {group.group}
                </span>
                <span className="flex-1 border-t border-dashed border-stroke-soft-200" />
              </div>
              {group.items.map((item) => {
                const Icon = item.icon
                const active = item.id === activeId
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={[
                      "group flex h-9 w-full items-center gap-2 rounded-[10px] px-2 text-left text-sm",
                      active
                        ? "bg-bg-weak-50 text-text-strong-950"
                        : "bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50",
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "size-5 shrink-0",
                        active ? "text-primary-base" : "text-text-soft-400 group-hover:text-text-sub-600",
                      ].join(" ")}
                    />
                    <span className="flex-1">{item.label}</span>
                    {active ? (
                      <ChevronRight className="size-[18px] shrink-0 text-text-sub-600" />
                    ) : null}
                  </Link>
                )
              })}
            </div>
            {gi === 0 ? <span className="block h-px w-full bg-stroke-soft-200" /> : null}
          </React.Fragment>
        ))}
      </div>

      {/* Right pane placeholder */}
      <div className="flex w-full min-w-0 flex-col">
        <div className="flex w-full items-center justify-between gap-3.5 border-b border-stroke-soft-200 px-5 py-4">
          <div>
            <div className="text-base font-medium text-text-strong-950">Account Settings</div>
            <div className="mt-1 text-sm text-text-sub-600">
              Manage and collaborate on your account settings
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-sm font-medium text-text-strong-950 hover:bg-bg-weak-50">
              Discard
            </button>
            <button className="rounded-[10px] bg-primary px-3 py-1.5 text-sm font-medium text-static-white hover:bg-primary-darker">
              Save Changes
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6 border-b border-stroke-soft-200 px-5">
          <span className="-mb-px border-b-2 border-primary-base py-3 text-sm font-medium text-text-strong-950">
            Profile
          </span>
          <span className="py-3 text-sm text-text-sub-600">Notifications</span>
          <span className="py-3 text-sm text-text-sub-600">Language &amp; Region</span>
        </div>
        <div className="flex flex-1 items-center justify-center p-10 text-sm text-text-soft-400">
          Settings content area — see linked sub-pages for full forms.
        </div>
      </div>
    </div>
  )
}

export default function MarketingSettingsOverviewPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Settings"
        title="Settings Modal"
        description="Two-pane settings modal ported from the AlignUI Marketing Template. Left sidebar groups Personal + General settings; right pane swaps between 8 sections with horizontal sub-tabs."
      />

      <DocsSection title="Modal shell">
        <DocsExample
          title="2-pane layout"
          description="980px wide centered dialog, 680px min height, 24px radius. Sidebar (256px) on lg+, falls back to a Select control on mobile. Right pane scrolls independently."
          preview={<ModalShellPreview activeId="account" />}
          code={`<DialogContent className="flex h-max min-h-[680px] w-full max-w-[980px] rounded-3xl bg-bg-white-0 shadow-custom-md">
  <Tabs orientation="vertical" defaultValue="account-settings" className="flex w-full lg:flex-row">
    <TabsList className="hidden w-64 shrink-0 flex-col gap-4 border-r border-stroke-soft-200 p-4 lg:flex">
      {settingsGroups.map(({ group, items }) => (
        <div key={group} className="flex flex-col gap-2">
          <ContentDivider variant="line">{group}</ContentDivider>
          {items.map((item) => (
            <TabsTrigger key={item.id} value={item.id} variant="pill">
              <item.icon className="size-5" />
              <span className="flex-1 text-left">{item.label}</span>
            </TabsTrigger>
          ))}
        </div>
      ))}
    </TabsList>
    <div className="w-full min-w-0">
      <TabsContent value="account-settings"><AccountSettings /></TabsContent>
      {/* ...7 more sections */}
    </div>
  </Tabs>
</DialogContent>`}
        />
      </DocsSection>

      <DocsSection title="Navigation tree">
        <DocsVariantTable
          nameHeader="Section"
          descHeader="Sub-tabs"
          rows={[
            { name: "Account Settings", description: "Profile · Notifications · Language & Region" },
            { name: "Privacy & Security", description: "Password & 2FA · Active Sessions" },
            { name: "Integrations", description: "Social Media · API Settings · Connections" },
            { name: "Appearance", description: "Theme · Preferences" },
            { name: "Store Settings (General)", description: "Store Details · Contact Information · Discount Reminder" },
            { name: "Products Settings", description: "Default · Categories · Inventory" },
            { name: "Payment & Billing", description: "Payment Method · Currency Settings · Tax Settings" },
            { name: "Shipping & Delivery", description: "Shipping Methods · Delivery Options · Shipping Zones" },
          ]}
        />
      </DocsSection>

      <DocsSection title="Section pages">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {NAV.flatMap((g) => g.items).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 text-text-sub-600">
                  <Icon className="size-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-text-strong-950">
                  {item.label}
                </span>
                <ChevronRight className="size-4 text-text-soft-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )
          })}
        </div>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-sub-600">
          <li><strong className="text-text-strong-950">Dialog overlay</strong> — fixed inset, 50% black overlay, fade in/out.</li>
          <li><strong className="text-text-strong-950">Dialog content</strong> — centered card, max-w 980px, min-h 680px, rounded-3xl, slide-in-from-top-6.</li>
          <li><strong className="text-text-strong-950">Sidebar (lg+)</strong> — 256px wide, 4px padding, two ContentDivider-grouped sections with a divider between.</li>
          <li><strong className="text-text-strong-950">Mobile nav</strong> — replaces sidebar with a single Select that lists both groups + their items.</li>
          <li><strong className="text-text-strong-950">Section header</strong> — title (label-md) + description (paragraph-sm) on the left, <em>Discard</em> stroke button + <em>Save Changes</em> filled button on the right.</li>
          <li><strong className="text-text-strong-950">Sub-tabs</strong> — horizontal tab menu with primary underline on the active tab.</li>
          <li><strong className="text-text-strong-950">Form rows</strong> — repeating <code>label / hint</code> column + control column, separated by dashed dividers.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
