"use client"

import * as React from "react"
import {
  RiEyeLine,
  RiEyeOffLine,
  RiFileCopyLine,
  RiLinksLine,
  RiPencilLine,
  RiDeleteBin6Line,
  RiQuestionLine,
  RiGlobalLine,
  RiSunLine,
  RiArrowRightSLine,
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
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import { Field, FieldGroup } from "@/registry/dash/ui/field"
import { Label } from "@/registry/dash/ui/label"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Divider, ContentDivider } from "@/registry/dash/ui/divider"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/registry/dash/ui/tooltip"
import { PortalShell, PortalHeader } from "../_portal-shared"

/**
 * Portal Developer — ported from
 * next-portal-v2-web/app/[locale]/(dashboard)/developer/page.tsx +
 * H2HContent.tsx + WebhookIntegration.tsx + WebhookConfiguration.tsx.
 * Sticky header + horizontal tab strip (Host-to-Host / Webhook). H2H tab
 * shows client key + secret + base URL with copy. Webhook tab shows POST
 * URL + auth key/value with edit affordance.
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

export default function PortalDeveloperPage() {
  const [showSecret, setShowSecret] = React.useState(false)
  const [showAuthValue, setShowAuthValue] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Portal Developer"
        description="Developer settings — Host-to-Host credentials (client key + secret + base URL) and Webhook configuration (POST URL + auth header). Mirrors the production route at /developer with a sticky tab strip and read-only credential reveal pattern."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Developer tabs"
          description="Host-to-Host tab active. Clipboard copy on base URL, eye toggle on secrets, webhook tab swaps to a configurable POST endpoint."
          preview={
            <DocsTemplatePreview>
              <PortalShell active="/developer">
                <div className="sticky top-0 z-10 bg-bg-white-0 px-8 py-4">
                  <p className="text-lg font-medium text-text-strong-950">
                    Developers
                  </p>
                </div>
                <div className="px-8">
                  <Tabs defaultValue="host-to-host">
                    <div className="sticky top-[60px] z-[5] -mx-8 border-b border-stroke-soft-200 bg-bg-white-0 px-8">
                      <TabsList>
                        <TabsTrigger value="host-to-host">Host-to-Host</TabsTrigger>
                        <TabsTrigger value="webhook">Webhook</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="host-to-host" className="py-8">
                      <WidgetCard title="API access">
                        <ContentDivider>Credentials</ContentDivider>
                        <div className="flex flex-col gap-4 p-5">
                          <FieldGroup>
                            <Field>
                              <Label>Client Key</Label>
                              <InputRoot>
                                <Input
                                  value="ck_live_3f9a-c12e-44b8-9bd3-7ae5b8c4d12f"
                                  readOnly
                                />
                              </InputRoot>
                            </Field>
                            <Field>
                              <Label>Client Secret</Label>
                              <InputRoot>
                                <Input
                                  type={showSecret ? "text" : "password"}
                                  value="cs_live_super_secret_value_dont_share_xyz"
                                  readOnly
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSecret((s) => !s)}
                                  className="pr-1 text-text-soft-400 hover:text-text-sub-600"
                                  aria-label={showSecret ? "Hide secret" : "Show secret"}
                                >
                                  {showSecret ? (
                                    <RiEyeOffLine className="size-4" />
                                  ) : (
                                    <RiEyeLine className="size-4" />
                                  )}
                                </button>
                              </InputRoot>
                            </Field>
                          </FieldGroup>
                        </div>
                        <ContentDivider>API endpoint</ContentDivider>
                        <div className="flex flex-col gap-3 p-5">
                          <Field>
                            <Label>Base URL</Label>
                            <div className="flex items-stretch overflow-hidden rounded-lg border border-stroke-soft-200">
                              <div className="flex flex-1 items-center gap-2 bg-bg-white-0 px-3 text-sm">
                                <RiLinksLine className="size-4 text-text-soft-400" />
                                <span className="text-text-strong-950">
                                  https://api.dashelectric.co
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setCopied(true)
                                  setTimeout(() => setCopied(false), 1500)
                                }}
                                className="inline-flex items-center gap-2 border-l border-stroke-soft-200 bg-bg-white-0 px-3.5 text-sm text-text-sub-600 hover:bg-bg-weak-50"
                              >
                                <RiFileCopyLine className="size-4 shrink-0" />
                                {copied ? (
                                  <span className="text-xs text-(--state-success-base)">
                                    Copied
                                  </span>
                                ) : null}
                              </button>
                            </div>
                          </Field>
                        </div>
                      </WidgetCard>
                    </TabsContent>

                    <TabsContent value="webhook" className="py-8">
                      <div className="flex gap-8">
                        <aside className="sticky top-[120px] h-fit w-[258px] shrink-0 rounded-2xl bg-bg-white-0 p-2.5 shadow-xs ring-1 ring-inset ring-stroke-soft-200">
                          <h4 className="mb-2 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-text-soft-400">
                            Select
                          </h4>
                          <div className="flex flex-col gap-1">
                            <button className="flex items-center justify-between rounded-lg bg-bg-weak-50 px-3 py-2 text-sm font-medium text-text-strong-950">
                              <span className="flex items-center gap-2">
                                <RiGlobalLine className="size-4" />
                                Configuration
                              </span>
                              <RiArrowRightSLine className="size-4 text-text-soft-400" />
                            </button>
                            <button className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-text-sub-600 hover:bg-bg-weak-50">
                              <span className="flex items-center gap-2">
                                <RiSunLine className="size-4" />
                                Available events
                              </span>
                              <RiArrowRightSLine className="size-4 text-text-soft-400" />
                            </button>
                          </div>
                        </aside>

                        <div className="flex-1">
                          <WidgetCard
                            title="Webhook configuration"
                            action={
                              <Button tone="primary" style="stroke" size="sm">
                                <RiPencilLine className="size-4" />
                                Edit
                              </Button>
                            }
                          >
                            <ContentDivider>Credentials</ContentDivider>
                            <div className="flex flex-col gap-3 p-5">
                              <Field>
                                <Label>Webhook URL</Label>
                                <div className="flex items-stretch overflow-hidden rounded-lg border border-stroke-soft-200">
                                  <Select defaultValue="POST">
                                    <SelectTrigger className="w-[88px] rounded-none border-0 border-r border-stroke-soft-200 bg-bg-weak-50">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="POST">POST</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value="https://hooks.tenant.example/dash/webhook"
                                    readOnly
                                    className="border-0 bg-bg-white-0"
                                  />
                                </div>
                              </Field>
                              <div className="flex justify-end">
                                <IconButton
                                  tone="destructive"
                                  style="ghost"
                                  size="sm"
                                  aria-label="Delete webhook"
                                >
                                  <RiDeleteBin6Line />
                                </IconButton>
                              </div>
                            </div>

                            <ContentDivider>
                              <span className="inline-flex items-center gap-2">
                                Auth credentials
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      aria-label="What is this?"
                                      className="inline-flex size-5 items-center justify-center rounded-full bg-stroke-soft-200 text-text-soft-400 hover:bg-stroke-soft-300"
                                    >
                                      <RiQuestionLine className="size-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Dash will send this header on every webhook
                                    POST so you can verify the request is from us.
                                  </TooltipContent>
                                </Tooltip>
                              </span>
                            </ContentDivider>

                            <div className="flex flex-col gap-3 p-5">
                              <FieldGroup>
                                <Field>
                                  <Label>Auth key</Label>
                                  <InputRoot>
                                    <Input value="X-Dash-Signature" readOnly />
                                  </InputRoot>
                                </Field>
                                <Field>
                                  <Label>Auth value</Label>
                                  <InputRoot>
                                    <Input
                                      type={showAuthValue ? "text" : "password"}
                                      value="whsec_qf9d_keep_this_secret_xyz123"
                                      readOnly
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowAuthValue((s) => !s)}
                                      className="pr-1 text-text-soft-400 hover:text-text-sub-600"
                                      aria-label={
                                        showAuthValue ? "Hide auth value" : "Show auth value"
                                      }
                                    >
                                      {showAuthValue ? (
                                        <RiEyeOffLine className="size-4" />
                                      ) : (
                                        <RiEyeLine className="size-4" />
                                      )}
                                    </button>
                                  </InputRoot>
                                </Field>
                              </FieldGroup>
                            </div>
                          </WidgetCard>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </PortalShell>
            </DocsTemplatePreview>
          }
          code={`<PortalShell active="/developer">
  <StickyPageHeader>Developers</StickyPageHeader>
  <Tabs defaultValue="host-to-host">
    <TabsList sticky>...</TabsList>
    <TabsContent value="host-to-host"><CredentialsCard /></TabsContent>
    <TabsContent value="webhook"><WebhookCard /></TabsContent>
  </Tabs>
</PortalShell>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><b>Sticky title</b> — <code>position: sticky; top: 0</code>. Page title doesn't scroll out.</li>
          <li><b>Tab strip</b> — also sticky (top: 64px) so the active tab stays visible.</li>
          <li><b>H2H card</b> — three sections divided by ContentDivider: Credentials (Client Key + Client Secret with eye toggle) and API endpoint (base URL with clipboard copy + toast).</li>
          <li><b>Webhook card</b> — vertical tab nav (Configuration / Available events) + main card with URL row (POST select + URL input + delete) and auth credentials section. Edit button in card header flips fields to writable.</li>
          <li><b>Empty state</b> — when no webhook is set, replace the card body with an illustration + "Set up webhook" primary CTA.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><b>Use</b> for any developer surface that exposes machine credentials — keep them in read-only mode by default, gate edits behind an explicit Edit click.</li>
          <li><b>Use</b> the eye-toggle + clipboard-with-toast pair every time you render a secret string. Both affordances are user expectation now.</li>
          <li><b>Don't</b> render production credentials without the masked default + sandbox/live environment switch — always show which env the secret belongs to.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "clientKey", type: "string", description: "Read-only API key — bound to env mode." },
            { name: "clientSecret", type: "string", description: "Sensitive — always rendered masked by default." },
            { name: "baseUrl", type: "string", description: "Defaults to https://api.dashelectric.co." },
            { name: "webhook", type: "{ id, url, authKey, authValue } | null", description: "Null shows empty state CTA." },
            { name: "onSave", type: "() => Promise<void>", description: "PATCH webhook config + client auth fields." },
            { name: "onDelete", type: "(id: string) => Promise<void>", description: "DELETE webhook config." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
