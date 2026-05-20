"use client"

import * as React from "react"
import { Banner } from "@/registry/dash/ui/banner"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"

/**
 * Banner — Figma 1:1 (7 nodes verified 2026-05-18).
 *
 *   224:2249       Master matrix — 6 statuses × 3 appearances (filled / lighter / stroke)
 *   2952:19532     Top-pinned filled error banner — light
 *   2952:19560     same — dark
 *   2952:19589     Top-pinned feature banner — light
 *   2952:19715     same — dark
 *   2952:19646     Bottom-pinned filled warning banner — light
 *   2952:19753     same — dark
 */

const STATUSES = ["error", "warning", "success", "information", "feature", "faded"] as const
const APPEARANCES = ["filled", "lighter", "stroke"] as const

export default function BannerDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="specialized"
        category="Components / Feedback"
        title="Banner"
        description="Full-width status banner pinned to the top or bottom of a layout. Six statuses × three appearances × two sizes. Use for app-level announcements (downtime, feature launch, payment overdue) — not inline form errors (use Alert)."
      />

      <DocsSection title="Status × appearance">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Cross-product of 6 statuses × 3 appearances. filled = solid status bg + white text (high attention). lighter = -200 tint + status-dark text (medium attention). stroke = white bg + 1px soft border + status icon (low attention).
        </p>
        <DocsExample
          title="6 × 3 matrix"
          preview={
            <div className="space-y-4 w-full">
              {APPEARANCES.map((ap) => (
                <div key={ap}>
                  <div className="text-[10px] uppercase tracking-wider text-text-soft-400 mb-2">{ap}</div>
                  <div className="space-y-1">
                    {STATUSES.map((s) => (
                      <Banner
                        key={`${ap}-${s}`}
                        status={s}
                        appearance={ap}
                        title="Insert your alert title here!"
                        action={<a href="#" className="font-medium underline underline-offset-2">Upgrade</a>}
                        dismissible
                        onDismiss={() => {}}
                      >
                        Insert your description here.
                      </Banner>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
          code={`<Banner status="error" appearance="filled" dismissible
  title="Insert your alert title here!"
  action={<a href="#">Upgrade</a>}
>
  Insert your description here.
</Banner>`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          sm — compact (used in dense panels). md — default (page-level chrome).
        </p>
        <DocsExample
          title="sm + md"
          preview={
            <div className="space-y-2">
              <Banner size="sm" status="information" title="sm" action={<a href="#" className="font-medium underline underline-offset-2">Action</a>} dismissible onDismiss={() => {}}>Description text</Banner>
              <Banner size="md" status="information" title="md" action={<a href="#" className="font-medium underline underline-offset-2">Action</a>} dismissible onDismiss={() => {}}>Description text</Banner>
            </div>
          }
          code={`<Banner size="sm" status="information" title="sm">desc</Banner>
<Banner size="md" status="information" title="md">desc</Banner>`}
        />
      </DocsSection>

      <DocsSection title="Top-pinned error">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          App-level failure announcement. Pin sticky at the top of the layout. Filled error appearance for maximum salience. Always offer recovery action (Contact Support, Retry, View Status).
        </p>
        <DocsExample
          title="System Failure pinned-top"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
              <Banner
                status="error"
                appearance="filled"
                title="System Failure"
                action={<a href="#" className="font-medium underline underline-offset-2">Contact Support</a>}
                dismissible
                onDismiss={() => {}}
              >
                Transaction failed due to a system issue.
              </Banner>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="size-9 rounded-full bg-bg-weak-50" />
                  <span className="h-3 w-40 rounded bg-bg-weak-50" />
                  <span className="ml-auto h-7 w-24 rounded-md bg-bg-weak-50" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1,2,3].map((i) => <div key={i} className="aspect-[3/2] rounded-lg bg-bg-weak-50" />)}
                </div>
                <div className="space-y-2">
                  {[1,2,3,4].map((i) => <div key={i} className="h-9 rounded bg-bg-weak-50" />)}
                </div>
              </div>
            </div>
          }
          code={`<div className="sticky top-0 z-40">
  <Banner status="error" appearance="filled" title="System Failure"
    action={<a href="/support">Contact Support</a>} dismissible>
    Transaction failed due to a system issue.
  </Banner>
</div>`}
        />
      </DocsSection>

      <DocsSection title="Top-pinned feature">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          New feature announcement. Faded/neutral background — low intrusion. Sparkle icon via feature status. Pair with Learn more link.
        </p>
        <DocsExample
          title="New Feature Unlocked"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
              <div className="p-6 pb-0">
                <div className="flex items-center gap-3">
                  <span className="size-9 rounded-full bg-bg-weak-50" />
                  <span className="h-3 w-40 rounded bg-bg-weak-50" />
                  <span className="ml-auto h-7 w-24 rounded-md bg-bg-weak-50" />
                </div>
              </div>
              <Banner
                status="faded"
                appearance="filled"
                title="New Feature Unlocked!"
                action={<a href="#" className="font-medium underline underline-offset-2">Learn more</a>}
                dismissible
                onDismiss={() => {}}
              >
                Introducing Advanced Payroll Insights!
              </Banner>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[1,2,3].map((i) => <div key={i} className="aspect-[3/2] rounded-lg bg-bg-weak-50" />)}
                </div>
                <div className="space-y-2">
                  {[1,2,3,4].map((i) => <div key={i} className="h-9 rounded bg-bg-weak-50" />)}
                </div>
              </div>
            </div>
          }
          code={`<Banner status="faded" appearance="filled" title="New Feature Unlocked!"
  action={<a href="/changelog">Learn more</a>} dismissible>
  Introducing Advanced Payroll Insights!
</Banner>`}
        />
      </DocsSection>

      <DocsSection title="Bottom-pinned warning">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Scheduled-maintenance / non-blocking advisory. Pin sticky at the bottom of the viewport. Filled warning for time-sensitive messages users should see but not act on immediately.
        </p>
        <DocsExample
          title="Server Maintenance pinned-bottom"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="size-9 rounded-full bg-bg-weak-50" />
                  <span className="h-3 w-40 rounded bg-bg-weak-50" />
                  <span className="ml-auto h-7 w-24 rounded-md bg-bg-weak-50" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1,2,3].map((i) => <div key={i} className="aspect-[3/2] rounded-lg bg-bg-weak-50" />)}
                </div>
                <div className="space-y-2">
                  {[1,2,3,4].map((i) => <div key={i} className="h-9 rounded bg-bg-weak-50" />)}
                </div>
              </div>
              <Banner
                status="warning"
                appearance="filled"
                title="Server Maintenance"
                dismissible
                onDismiss={() => {}}
              >
                Our servers will undergo maintenance on November 27, 2023 at 12:00 PM.
              </Banner>
            </div>
          }
          code={`<div className="sticky bottom-0 z-40">
  <Banner status="warning" appearance="filled" title="Server Maintenance" dismissible>
    Our servers will undergo maintenance on November 27, 2023 at 12:00 PM.
  </Banner>
</div>`}
        />
      </DocsSection>

      <DocsSection title="Banner vs Alert">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          <strong className="text-text-strong-950">Banner</strong> = full-width, page-level chrome (pinned top or bottom). Announces system-level status that affects the whole app.<br />
          <strong className="text-text-strong-950">Alert</strong> = inline, scoped to a section or form. Lives next to the content it describes.<br />
          Use Banner for: planned downtime, payment failed, new feature launch, terms update.<br />
          Use Alert for: form validation, inline warnings, confirmation reinforcement inside modals.
        </p>
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Banner = app-level chrome. Sticky di top atau bottom, satu per layout. Pair dengan action link supaya user bisa recover atau learn more, jangan biarkan dead-end.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md">
                <Banner
                  status="error"
                  appearance="filled"
                  title="Pembayaran payroll gagal"
                  action={<a href="#" className="font-medium underline underline-offset-2">Retry sekarang</a>}
                  dismissible
                  onDismiss={() => {}}
                >
                  Saldo VA Dash kurang Rp 12.4jt. Top-up sebelum 17:00 supaya mitra terima hari ini.
                </Banner>
              </div>
            ),
            caption: "Status (gagal) + konsekuensi (mitra tertunda) + recovery action (Retry) + deadline (17:00). User tahu apa, kenapa, kapan, harus apa.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md">
                <Banner status="error" appearance="filled" title="Error" />
              </div>
            ),
            caption: "'Error' tanpa konteks, tanpa action, tanpa dismiss = dispatcher panik tanpa exit. Banner blocking interface tanpa solusi.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md">
                <Banner
                  status="information"
                  appearance="lighter"
                  title="Polygon shift Bekasi pindah jam 22:00 WIB"
                  action={<a href="#" className="font-medium underline underline-offset-2">Lihat detail</a>}
                  dismissible
                  onDismiss={() => {}}
                >
                  Mitra Reservasi area Bekasi Timur perlu re-login setelah jam tersebut.
                </Banner>
              </div>
            ),
            caption: "Satu banner info di top, dismissable. Action link untuk konteks lengkap, body teks ringkas (siapa affected + apa yang berubah).",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <Banner status="information" appearance="filled" title="Info 1" />
                <Banner status="warning" appearance="filled" title="Info 2" />
                <Banner status="feature" appearance="filled" title="Info 3" />
              </div>
            ),
            caption: "Tumpuk 3 banner = chrome menjajah konten. Pilih satu yang paling urgent, sisanya pakai Alert atau Notification.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "status", type: '"error" | "warning" | "success" | "information" | "faded" | "feature" | "neutral"', defaultValue: '"information"', description: "Semantic intent — drives icon glyph + color." },
            { name: "appearance", type: '"filled" | "lighter" | "stroke"', defaultValue: '"lighter"', description: "Surface treatment. filled = solid status bg + white text. lighter = -200 tint + status-dark text. stroke = white bg + soft border." },
            { name: "size", type: '"sm" | "md"', defaultValue: '"md"', description: "Vertical padding tier." },
            { name: "title", type: "ReactNode", description: "Primary label." },
            { name: "children", type: "ReactNode", description: "Description body. Renders after title separated by · bullet." },
            { name: "action", type: "ReactNode", description: "Inline action slot — anchor or button." },
            { name: "icon", type: "ReactNode", description: "Override the auto-status icon." },
            { name: "showIcon", type: "boolean", defaultValue: "true", description: "Toggle the leading status glyph." },
            { name: "dismissible", type: "boolean", defaultValue: "false", description: "Show the trailing X close button." },
            { name: "onDismiss", type: "() => void", description: "Fires when the close button is clicked." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
