"use client"

import * as React from "react"
import {
  RiAddLine as Plus,
  RiMore2Line as More,
  RiFacebookCircleFill as Facebook,
  RiInstagramLine as Instagram,
  RiTwitterXLine as X,
  RiTiktokFill as TikTok,
  RiWhatsappLine as WhatsApp,
  RiShoppingBagLine as Shopify,
  RiBankCardLine as Stripe,
  RiPaypalLine as PayPal,
  RiMailLine as Mail,
  RiAmazonLine as Amazon,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { Button } from "@/registry/dash/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/registry/dash/ui/table"
import {
  SectionHeader,
  SubTabs,
  SectionBody,
  DashedDivider,
  PreviewFrame,
} from "../_shared"

/**
 * Marketing Settings — Integrations. Ported from settings-modal/integrations/
 *   {index, social-media, api-settings, api-settings-table, connections}.tsx.
 *
 * Logos use Remix Icons since the source pulls bitmap brand SVGs from /public.
 */

type ConnectionRow = {
  name: string
  description: string
  icon: React.ElementType
  connected: boolean
}

const SOCIALS: ConnectionRow[] = [
  { name: "Facebook", description: "Connect your Facebook account to share products and manage ads", icon: Facebook, connected: true },
  { name: "Instagram", description: "Share your products and stories directly to Instagram Shopping", icon: Instagram, connected: true },
  { name: "X (Twitter)", description: "Share updates and engage with customers on X (Twitter)", icon: X, connected: false },
  { name: "Tiktok", description: "Create and manage TikTok shop listings and ad campaigns", icon: TikTok, connected: false },
  { name: "WhatsApp", description: "Enable customer messaging and order updates via WhatsApp", icon: WhatsApp, connected: false },
]

const CONNECTIONS: Array<{ name: string; description: string; icon: React.ElementType }> = [
  { name: "Shopify", description: "Manage your online store and sync your product inventory", icon: Shopify },
  { name: "Stripe", description: "Process payments securely and manage your transactions", icon: Stripe },
  { name: "Paypal", description: "Enable secure payment options and handle transactions", icon: PayPal },
  { name: "Mailchimp", description: "Create email campaigns and manage customer communications", icon: Mail },
  { name: "Amazon", description: "List and sell products on Amazon marketplace", icon: Amazon },
]

function ConnectionRowItem({
  row,
  action,
}: {
  row: { name: string; description: string; icon: React.ElementType }
  action: React.ReactNode
}) {
  const Icon = row.icon
  return (
    <div className="flex flex-col items-start justify-between gap-3.5 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-stroke-soft-200">
        <Icon className="size-6" />
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium text-text-strong-950">{row.name}</div>
        <div className="mt-1 text-xs text-text-sub-600">{row.description}</div>
      </div>
      {action}
    </div>
  )
}

function SocialMediaForm() {
  return (
    <SectionBody>
      {SOCIALS.map((s, i) => (
        <React.Fragment key={s.name}>
          <ConnectionRowItem
            row={s}
            action={
              s.connected ? (
                <Button size="xs" tone="destructive" style="stroke">
                  Disconnect
                </Button>
              ) : (
                <Button size="xs" tone="neutral" style="stroke">
                  Connect
                </Button>
              )
            }
          />
          {i < SOCIALS.length - 1 ? <DashedDivider /> : null}
        </React.Fragment>
      ))}
    </SectionBody>
  )
}

const API_KEYS = [
  { id: "1", name: "Apps Integration", created: "Nov 15, 2024", last: "2 days ago", key: "sk_live_987654321abcdefghijklmnopqrstuvw" },
  { id: "2", name: "Sales Dashboard", created: "Nov 1, 2024", last: "12 hours ago", key: "sk_live_45678923xyzabcdefghijklmnopqrs" },
  { id: "3", name: "Marketing Analytics", created: "Oct 28, 2024", last: "1 week ago", key: "sk_live_741852963poiuytrewqlkjhgfdsazx" },
  { id: "4", name: "Analytics Dashboard", created: "Oct 20, 2024", last: "3 days ago", key: "sk_live_369258147mnbvcxzlkjhgfdsapoiuy" },
  { id: "5", name: "Orders Panel", created: "Oct 12, 2024", last: "4 days ago", key: "sk_live_159753468qwertyuiopasdfghjklzx" },
]

function ApiSettingsForm() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:gap-6">
        <div>
          <div className="text-sm font-medium text-text-strong-950">Production Key</div>
          <div className="mt-1 text-xs text-text-sub-600">
            Use this key for live applications and keep it secure.
          </div>
        </div>
        <Button size="xs" tone="primary" style="lighter" className="rounded-[10px]" leftIcon={<Plus />}>
          Generate API key
        </Button>
      </div>
      <div className="-mx-1 overflow-x-auto">
        <Table className="min-w-[532px]">
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Key</TableHead>
              <TableHead className="w-0 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {API_KEYS.map((k) => (
              <TableRow key={k.id}>
                <TableCell className="h-16">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-sm font-medium text-text-strong-950">{k.name}</div>
                    <div className="text-xs text-text-sub-600">Created · {k.created}</div>
                  </div>
                </TableCell>
                <TableCell className="h-16">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-sm text-text-strong-950">{k.key}</div>
                    <div className="text-xs text-text-sub-600">Last used · {k.last}</div>
                  </div>
                </TableCell>
                <TableCell className="h-16 w-0 px-4">
                  <Button size="xs" tone="neutral" style="ghost">
                    <More />
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

function ConnectionsForm() {
  return (
    <SectionBody>
      {CONNECTIONS.map((c, i) => (
        <React.Fragment key={c.name}>
          <ConnectionRowItem
            row={c}
            action={
              <Button size="xs" tone="neutral" style="stroke">
                Manage
              </Button>
            }
          />
          {i < CONNECTIONS.length - 1 ? <DashedDivider /> : null}
        </React.Fragment>
      ))}
    </SectionBody>
  )
}

function IntegrationsPreview({ tab }: { tab: "Social Media" | "API Settings" | "Connections" }) {
  return (
    <PreviewFrame>
      <SectionHeader
        title="Integrations"
        description="Connect and sync with essential tools and platforms"
      />
      <SubTabs current={tab} tabs={["Social Media", "API Settings", "Connections"]} />
      {tab === "Social Media" ? <SocialMediaForm /> : null}
      {tab === "API Settings" ? <ApiSettingsForm /> : null}
      {tab === "Connections" ? <ConnectionsForm /> : null}
    </PreviewFrame>
  )
}

export default function MarketingSettingsIntegrationsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing / Settings"
        title="Integrations"
        description="Social media connection list, API key table, and third-party connections. Three sub-tabs."
      />

      <DocsSection title="Social Media">
        <DocsExample
          title="Social account rows"
          description="5 rows: Facebook + Instagram pre-connected (red Disconnect), X / TikTok / WhatsApp not connected (neutral Connect). Brand icon in 40px ring-inset circle."
          preview={<IntegrationsPreview tab="Social Media" />}
          code={`{socials.map((s) => (
  <ConnectionRowItem row={s} action={
    s.connected
      ? <Button size="xs" tone="destructive" style="stroke">Disconnect</Button>
      : <Button size="xs" tone="neutral" style="stroke">Connect</Button>
  } />
))}`}
        />
      </DocsSection>

      <DocsSection title="API Settings">
        <DocsExample
          title="Production keys table"
          description="Header row + 5-row Table. Columns: Description (name + Created · date), Key (sk_live_… + Last used · …), trailing kebab Action."
          preview={<IntegrationsPreview tab="API Settings" />}
          code={`<div className="flex justify-between">
  <div>
    <div className="text-sm font-medium">Production Key</div>
    <div className="text-xs text-text-sub-600">Use this key for live applications and keep it secure.</div>
  </div>
  <Button size="xs" tone="primary" style="lighter" leftIcon={<Plus />}>Generate API key</Button>
</div>

<Table>
  <TableHeader><TableRow>
    <TableHead>Description</TableHead><TableHead>Key</TableHead><TableHead />
  </TableRow></TableHeader>
  <TableBody>
    {keys.map((k) => (
      <TableRow key={k.id}>
        <TableCell><div className="font-medium">{k.name}</div><div className="text-xs text-text-sub-600">Created · {k.created}</div></TableCell>
        <TableCell><div className="text-sm">{k.key}</div><div className="text-xs text-text-sub-600">Last used · {k.last}</div></TableCell>
        <TableCell><Button size="xs" tone="neutral" style="ghost"><More /></Button></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
        />
      </DocsSection>

      <DocsSection title="Connections">
        <DocsExample
          title="Third-party connections"
          description="5 rows: Shopify, Stripe, Paypal, Mailchimp, Amazon. Each with a Manage stroke button."
          preview={<IntegrationsPreview tab="Connections" />}
          code={`{connections.map((c) => (
  <ConnectionRowItem row={c} action={
    <Button size="xs" tone="neutral" style="stroke">Manage</Button>
  } />
))}`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
          <li>Connection row: 40px circle icon (ring-inset stroke-soft-200) + name (label-sm) + description (paragraph-xs) + trailing Button.</li>
          <li>API table: 532px min table width, 64px row height, Description + Key + actions columns.</li>
          <li>Connect / Disconnect / Manage all use xsmall stroke buttons (destructive tone for Disconnect).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
