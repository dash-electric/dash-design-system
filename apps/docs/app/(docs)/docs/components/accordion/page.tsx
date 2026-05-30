"use client"

import * as React from "react"
import {
  RiUser3Line as User,
  RiBankCardLine as Card,
  RiQuestionLine as Help,
  RiMapPinLine as Pin,
  RiLockLine as Lock,
  RiSparkling2Line as Sparkle,
  RiCheckboxCircleFill as CheckCircle,
} from "@remixicon/react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/registry/dash/ui/accordion"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Accordion — Figma 1:1 (11 nodes verified 2026-05-17).
 *
 *   210:4022       Base spec: 6 variants (chevron L/R, plus-minus L/R, on white-bg + weak-50)
 *   166568:4221    E-commerce wizard pattern (step icons + status badge + rich content)
 *   166568:4276    FAQ with leading icon (user/card/help/pin/lock glyphs)
 *   166568:4306    Nested accordion + ordered list inside
 *   166568:4349    Group header pattern ("Account (2)") with inline table inside
 *   2880:1386      FAQ with leading icon — light theme
 *   2880:2387      Changelog list — light theme
 *   2880:2392      Changelog list — dark theme (flips automatically via .dark)
 *   2880:2564      FAQ title-only — light theme
 *   2880:2570      FAQ title-only — dark theme
 *   2880:1586      FAQ with leading icon — dark theme
 */

export default function AccordionDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Disclosure"
        title="Accordion"
        description="Progressively-disclosed content panels. Card-style by default (each item a bordered box) with chevron or plus-minus toggle, optional leading icon, optional trailing meta slot for status badges. Built on Radix Accordion — supports single or multiple-open behavior."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add accordion`} />
      </DocsSection>

      <DocsSection title="Base">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default Dash variant: card-style item (white bg, 1px stroke-soft-200, 10px radius, 14px padding). Title 14px medium, optional description 14px regular text-sub-600 inside Content.
        </p>
        <DocsExample
          title="Card variant with chevron"
          preview={
            <Accordion type="single" collapsible defaultValue="item-3" className="max-w-md">
              <AccordionItem value="item-1">
                <AccordionTrigger leadingIcon={<Help />}>Insert your accordion title here</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger leadingIcon={<Help />}>Insert your accordion title here</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger leadingIcon={<Help />} iconVariant="plus-minus">Insert your accordion title here</AccordionTrigger>
                <AccordionContent>Insert the accordion description here. It would look better as two lines of text.</AccordionContent>
              </AccordionItem>
            </Accordion>
          }
          code={`<Accordion type="single" collapsible defaultValue="item-3">
  <AccordionItem value="item-1">
    <AccordionTrigger leadingIcon={<Help />}>Title</AccordionTrigger>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger leadingIcon={<Help />} iconVariant="plus-minus">Title</AccordionTrigger>
    <AccordionContent>Description</AccordionContent>
  </AccordionItem>
</Accordion>`}
        />

        <DocsExample
          title="Icon left position (plus-minus)"
          preview={
            <Accordion type="single" collapsible defaultValue="item-3" className="max-w-md">
              <AccordionItem value="item-1">
                <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Insert your accordion title here</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Insert your accordion title here</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Insert your accordion title here</AccordionTrigger>
                <AccordionContent className="pl-8">Insert the accordion description here. It would look better as two lines of text.</AccordionContent>
              </AccordionItem>
            </Accordion>
          }
          code={`<AccordionTrigger iconVariant="plus-minus" iconPosition="left">
  Title
</AccordionTrigger>`}
        />
      </DocsSection>

      <DocsSection title="FAQ with leading icons">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Customer-facing FAQ. Glyph hints at topic (user → account, card → payment, pin → tracking, lock → security). Light + dark theme flip automatically via root `.dark` class — Figma 2880:1386 / 2880:1586 are the same component in each mode.
        </p>
        <DocsExample
          title="FAQ list with topic glyphs"
          preview={
            <Accordion type="single" collapsible defaultValue="item-2" className="max-w-lg">
              <AccordionItem value="item-1">
                <AccordionTrigger leadingIcon={<User />} iconVariant="plus-minus">How do I update my account information?</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger leadingIcon={<Card />} iconVariant="plus-minus">What payment methods are accepted?</AccordionTrigger>
                <AccordionContent>
                  Major credit and debit cards like Visa, MasterCard, and American Express, as well as digital payment options like PayPal and Apple Pay.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger leadingIcon={<Help />} iconVariant="plus-minus">How do I get a refund?</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger leadingIcon={<Pin />} iconVariant="plus-minus">How can I track my order?</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger leadingIcon={<Lock />} iconVariant="plus-minus">How do I reset my password?</AccordionTrigger>
              </AccordionItem>
            </Accordion>
          }
          code={`<AccordionTrigger leadingIcon={<User />} iconVariant="plus-minus">
  How do I update my account information?
</AccordionTrigger>`}
        />
      </DocsSection>

      <DocsSection title="Title only">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Strip the leading icon for cleaner marketing pages. Plus-minus toggle. Hover lifts the row tonally.
        </p>
        <DocsExample
          title="Marketing FAQ (no icon)"
          preview={
            <Accordion type="single" collapsible defaultValue="item-3" className="max-w-lg">
              <AccordionItem value="item-1">
                <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Security Features</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Mobile App Benefits</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Payment Options</AccordionTrigger>
                <AccordionContent className="pl-8">Find the payment method that suits you best. Credit card, PayPal, and more payment options explained.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Customer Support</AccordionTrigger>
              </AccordionItem>
            </Accordion>
          }
          code={`<AccordionTrigger iconVariant="plus-minus" iconPosition="left">
  Payment Options
</AccordionTrigger>`}
        />
      </DocsSection>

      <DocsSection title="Changelog">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Release notes pattern. Dated titles, plus-minus right toggle, multi-line bullet content. Dark theme version (2880:2392) is identical — flips via `.dark` automatically.
        </p>
        <DocsExample
          title="Versioned changelog"
          preview={
            <Accordion type="single" collapsible defaultValue="changelog-2" className="max-w-lg">
              <AccordionItem value="changelog-1">
                <AccordionTrigger iconVariant="plus-minus">Changelog – 2023-08-15</AccordionTrigger>
              </AccordionItem>
              <AccordionItem value="changelog-2">
                <AccordionTrigger iconVariant="plus-minus">Changelog – 2023-07-15</AccordionTrigger>
                <AccordionContent>
                  Added new customization options.<br />
                  Streamlined the onboarding process.<br />
                  Resolved compatibility issues with certain browsers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="changelog-3">
                <AccordionTrigger iconVariant="plus-minus">Changelog – 2023-06-15</AccordionTrigger>
              </AccordionItem>
            </Accordion>
          }
          code={`<AccordionItem value="changelog-2">
  <AccordionTrigger iconVariant="plus-minus">Changelog – 2023-07-15</AccordionTrigger>
  <AccordionContent>
    Added new customization options.<br />
    Streamlined the onboarding process.
  </AccordionContent>
</AccordionItem>`}
        />
      </DocsSection>

      <DocsSection title="Setup wizard">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Onboarding checklist. Leading status icon (success check, sparkle for in-progress) + meta Badge (Ready, Draft). Content can host any composition — input + button, QR, rich media.
        </p>
        <DocsExample
          title="E-commerce setup steps"
          preview={
            <div className="space-y-4 max-w-lg">
              <div>
                <div className="text-sm font-medium text-text-strong-950 mb-2 flex items-center gap-1.5">
                  Set-up your online store <Help className="size-3.5 text-icon-soft-400" />
                </div>
                <Accordion type="single" collapsible defaultValue="step-2">
                  <AccordionItem value="step-1">
                    <AccordionTrigger
                      leadingIcon={<CheckCircle className="text-(--state-success-base)" />}
                      meta={<Badge status="success" appearance="lighter" size="sm">Ready</Badge>}
                    >
                      Add products
                    </AccordionTrigger>
                  </AccordionItem>
                  <AccordionItem value="step-2">
                    <AccordionTrigger leadingIcon={<Sparkle className="text-(--state-warning-base)" />}>
                      Get the point of sale application
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <p>Scan the QR code or send yourself the link to get the app. The mobile app is where you&apos;ll manage orders, track inventory, and view analytics on the go.</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="email"
                              defaultValue="james@dash.com"
                              className="flex-1 h-9 px-3 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-sm text-text-strong-950 focus:outline-none focus:border-primary"
                            />
                            <Button size="sm" tone="neutral" style="stroke">Send link</Button>
                          </div>
                        </div>
                        <div className="size-20 rounded bg-bg-weak-50 flex items-center justify-center text-[10px] text-text-soft-400 shrink-0">QR</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="step-3">
                    <AccordionTrigger leadingIcon={<Sparkle className="text-icon-soft-400" />}>
                      Product price & stock
                    </AccordionTrigger>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
                <div className="text-sm font-medium text-text-strong-950 flex items-center gap-1.5">
                  Boost your online presence{" "}
                  <Badge status="feature" appearance="lighter" size="sm">PRO</Badge>
                </div>
                <p className="text-xs text-text-sub-600 mt-2 mb-3 leading-relaxed">
                  Take your e-commerce business to the next level with advanced features designed to increase sales and improve customer experience.
                </p>
                <Button size="sm" tone="neutral">Upgrade</Button>
              </div>
            </div>
          }
          code={`<AccordionTrigger
  leadingIcon={<CheckCircle className="text-success" />}
  meta={<Badge status="success" appearance="lighter" size="sm">Ready</Badge>}
>
  Add products
</AccordionTrigger>`}
        />
      </DocsSection>

      <DocsSection title="Nested + ordered list">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Tutorial pattern. Outer accordion picks the device, inner content is a numbered step list. Works because Radix supports arbitrary content inside `AccordionContent`.
        </p>
        <DocsExample
          title="How-to with numbered steps"
          preview={
            <div className="max-w-lg space-y-2">
              <div>
                <div className="text-sm font-medium text-text-strong-950">How to sign up for the app?</div>
                <p className="text-sm text-text-sub-600 mt-1">Follow the steps for your preferred device below.</p>
              </div>
              <Accordion type="single" collapsible defaultValue="device-2" variant="ghost">
                <AccordionItem value="device-1">
                  <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Web Browser</AccordionTrigger>
                </AccordionItem>
                <AccordionItem value="device-2">
                  <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Mobile App</AccordionTrigger>
                  <AccordionContent className="pl-8">
                    <ol className="space-y-2">
                      {[
                        "Download the app from the App Store or Google Play.",
                        "Open the app and tap Sign up.",
                        "Choose your target language and current proficiency level.",
                        "Select a subscription plan.",
                        "Sign in with your Apple or Google account.",
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-text-strong-950">
                          <span className="inline-flex items-center justify-center size-5 rounded bg-bg-weak-50 text-xs text-text-sub-600 font-medium shrink-0">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="device-3">
                  <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Tablet Devices</AccordionTrigger>
                </AccordionItem>
                <AccordionItem value="device-4">
                  <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Smart TV</AccordionTrigger>
                </AccordionItem>
              </Accordion>
            </div>
          }
          code={`<Accordion type="single" collapsible variant="ghost">
  <AccordionItem value="device-2">
    <AccordionTrigger iconVariant="plus-minus" iconPosition="left">Mobile App</AccordionTrigger>
    <AccordionContent>
      <ol>{steps.map(...)}</ol>
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
        />
      </DocsSection>

      <DocsSection title="Group with inline data">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Dashboard pattern. Group label with count (Account (2)) above a card-style accordion. Open item reveals key/value summary plus an embedded compact table. Pair with the Draft meta badge for in-progress records.
        </p>
        <DocsExample
          title="Account drill-down"
          preview={
            <div className="space-y-4 max-w-2xl">
              <div>
                <div className="text-sm font-medium text-text-strong-950 mb-2">
                  Account <span className="text-text-soft-400">(2)</span>
                </div>
                <Accordion type="single" collapsible defaultValue="acc-2">
                  <AccordionItem value="acc-1">
                    <AccordionTrigger iconVariant="plus-minus" iconPosition="left">
                      Corporate Accounts <span className="text-text-soft-400 font-normal">(156 Customers)</span>
                    </AccordionTrigger>
                  </AccordionItem>
                  <AccordionItem value="acc-2">
                    <AccordionTrigger
                      iconVariant="plus-minus"
                      iconPosition="left"
                      meta={<Badge status="faded" appearance="lighter" size="sm">Draft</Badge>}
                    >
                      Individual Accounts <span className="text-text-soft-400 font-normal">(1,243 Accounts)</span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8">
                      <div className="grid grid-cols-4 gap-4 pb-4 border-b border-stroke-soft-200">
                        {[
                          ["Account Manager", "James Brown"],
                          ["Contract Value", "$250,000"],
                          ["Start Date", "2024-01-15"],
                          ["Member", "45"],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <div className="text-xs text-text-soft-400">{k}</div>
                            <div className="text-sm text-text-strong-950 mt-0.5">{v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <div className="text-sm font-medium text-text-strong-950 mb-2">Recent services</div>
                        <div className="rounded-md border border-stroke-soft-200 overflow-hidden">
                          <div className="grid grid-cols-3 bg-bg-weak-50 px-3 py-2 text-[11px] uppercase tracking-wider text-text-soft-400 font-medium">
                            <span>Date</span><span>Type</span><span>Cost</span>
                          </div>
                          {[
                            ["2024-01-15", "Fleet Maintenance", "$12,000"],
                            ["2024-02-28", "Emergency Repair",  "$3,500"],
                            ["2024-01-15", "Fleet Maintenance", "$12,000"],
                          ].map(([d, t, c], i) => (
                            <div key={i} className="grid grid-cols-3 px-3 py-2 text-sm text-text-strong-950 border-t border-stroke-soft-200">
                              <span>{d}</span><span>{t}</span><span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div>
                <div className="text-sm font-medium text-text-strong-950 mb-2">
                  Recruitment Processes <span className="text-text-soft-400">(2)</span>
                </div>
                <Accordion type="single" collapsible>
                  <AccordionItem value="r-1">
                    <AccordionTrigger iconVariant="plus-minus" iconPosition="left">
                      Active Positions <span className="text-text-soft-400 font-normal">(12 Positions)</span>
                    </AccordionTrigger>
                  </AccordionItem>
                  <AccordionItem value="r-2">
                    <AccordionTrigger iconVariant="plus-minus" iconPosition="left">
                      Talent Pipeline <span className="text-text-soft-400 font-normal">(186 Candidates)</span>
                    </AccordionTrigger>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          }
          code={`<AccordionTrigger
  iconVariant="plus-minus"
  iconPosition="left"
  meta={<Badge status="faded" appearance="lighter" size="sm">Draft</Badge>}
>
  Individual Accounts <span>(1,243 Accounts)</span>
</AccordionTrigger>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Accordion untuk konten optional/secondary yang user mungkin perlu lihat. Bukan untuk hide essential info.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs text-xs rounded border border-stroke-soft-200 divide-y divide-stroke-soft-200">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span>Cara reset kode referral</span>
                  <span className="text-text-soft-400">+</span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <span>Berapa lama suspend mitra</span>
                  <span className="text-text-soft-400">+</span>
                </div>
              </div>
            ),
            caption: "FAQ Help Center — pertanyaan visible, jawaban di-expand on demand. Mengurangi cognitive load.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs rounded border border-stroke-soft-200">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span>Status delivery DLV-7821</span>
                  <span className="text-text-soft-400">+</span>
                </div>
              </div>
            ),
            caption: "Jangan sembunyikan status critical (PICKED_UP, ETA) di accordion. Dispatcher butuh lihat tanpa klik.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Single-collapse default: cuma 1 panel terbuka. Mitra fokus baca satu jawaban, tidak overwhelm.",
          }}
          dont={{
            caption: "Jangan auto-collapse panel saat user lagi baca. Itu pakai mode \"multiple\" supaya user kontrol.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "type", type: '"single" | "multiple"', defaultValue: '"single"', description: "Whether one or multiple items can be open at once (Radix prop)." },
            { name: "collapsible", type: "boolean", defaultValue: "false", description: "Allow the open item to close when type=single." },
            { name: "variant", type: '"default" | "ghost"', defaultValue: '"default"', description: "default = card-style (Figma 1:1). ghost = separated only by bottom border (shadcn-style)." },
          ]}
        />
        <p className="text-xs text-text-soft-400 mt-3">
          <strong className="text-text-sub-600">AccordionTrigger</strong> adds <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">iconPosition</code> (&quot;left&quot; | &quot;right&quot;),{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">iconVariant</code> (&quot;chevron&quot; | &quot;plus-minus&quot;),{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">leadingIcon</code> (ReactNode), and{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">meta</code> (ReactNode — rendered between title and toggle).
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
