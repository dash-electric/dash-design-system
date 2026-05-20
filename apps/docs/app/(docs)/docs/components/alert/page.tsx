"use client"

import * as React from "react"
import { Alert } from "@/registry/dash/ui/alert"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"

/**
 * Alert — Figma 1:1 (node 169:2399, verified 2026-05-17).
 *
 * Spec: 5 statuses × 3 appearances × 3 sizes.
 *   statuses     : error | warning | success | information | feature
 *   appearances  : filled | lighter | stroke   (stroke = white-bg surface variant)
 *   sizes        : xs (32px min, compact)
 *                  sm (36px min, single-line + inline action)
 *                  lg (multi-line title + description + dual action links)
 *
 * Old `light` (-50 bg) variant was dropped on 2026-05-17 per audit. Pass
 * `appearance="lighter"` for the Figma 1:1 soft-tint visual (state-X-light = -200 bg).
 */

const STATUSES = ["error", "warning", "success", "information", "feature"] as const

export default function AlertDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Feedback"
        title="Alert"
        description="Inline status banner that lives next to the content it describes. Five statuses, three appearances, three sizes. Use for surface-level system status, not transient toast notifications. Pair with a confirmation step for destructive actions."
      />

      {/* 1. Compact xs — Figma 169:2399 row 1 */}
      <DocsSection title="xs compact">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          32px min height, inline action link + close. Smallest variant — use inside dense form/table contexts.
        </p>
        <DocsExample
          title="5 statuses × 4 appearances (xs)"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl">
              {(["filled", "lighter", "stroke"] as const).flatMap((ap) =>
                STATUSES.map((s) => (
                  <Alert
                    key={`${ap}-${s}-xs`}
                    size="xs"
                    status={s}
                    appearance={ap}
                    title="Insert your alert title here!"
                    action={<a href="#" className="font-medium underline underline-offset-2">Upgrade</a>}
                    dismissible
                    onDismiss={() => {}}
                  />
                )),
              )}
            </div>
          }
          code={`<Alert size="xs" status="error" appearance="filled" dismissible
  title="Insert your alert title here!"
  action={<a href="#">Upgrade</a>}
/>`}
        />
      </DocsSection>

      {/* 2. sm single-line — Figma 169:2399 row 2 */}
      <DocsSection title="sm single-line">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          36px min height. Identical to xs but taller — standard banner inside content panels.
        </p>
        <DocsExample
          title="5 statuses × 3 appearances (sm)"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl">
              {(["filled", "lighter", "stroke"] as const).flatMap((ap) =>
                STATUSES.map((s) => (
                  <Alert
                    key={`${ap}-${s}-sm`}
                    size="sm"
                    status={s}
                    appearance={ap}
                    title="Insert your alert title here!"
                    action={<a href="#" className="font-medium underline underline-offset-2">Upgrade</a>}
                    dismissible
                    onDismiss={() => {}}
                  />
                )),
              )}
            </div>
          }
          code={`<Alert size="sm" status="warning" appearance="lighter" dismissible
  title="Insert your alert title here!"
  action={<a href="#">Upgrade</a>}
/>`}
        />
      </DocsSection>

      {/* 3. lg multi-line — Figma 169:2399 row 3+ */}
      <DocsSection title="lg multi-line">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Title + 2-line description + dual action links (Upgrade + Learn More). Use for primary system messages that warrant detail.
        </p>
        <DocsExample
          title="5 statuses × 3 appearances (lg)"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl">
              {(["filled", "lighter", "stroke"] as const).flatMap((ap) =>
                STATUSES.map((s) => (
                  <Alert
                    key={`${ap}-${s}-lg`}
                    size="lg"
                    status={s}
                    appearance={ap}
                    title="Insert your alert title here!"
                    action={
                      <div className="flex items-center gap-3">
                        <a href="#" className="font-medium underline underline-offset-2">Upgrade</a>
                        <a href="#" className="font-medium">Learn More</a>
                      </div>
                    }
                    dismissible
                    onDismiss={() => {}}
                  >
                    Insert the alert description here. It would look better as two lines of text.
                  </Alert>
                )),
              )}
            </div>
          }
          code={`<Alert size="lg" status="error" appearance="lighter" dismissible
  title="Insert your alert title here!"
  action={
    <>
      <a href="#">Upgrade</a>
      <a href="#">Learn More</a>
    </>
  }
>
  Insert the alert description here. It would look better as two lines of text.
</Alert>`}
        />
      </DocsSection>

      {/* 4. Inline destructive — used inside Modals (2902:11310) */}
      <DocsSection title="Inline destructive">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Use `appearance="lighter"` Alert inside Modal bodies to reinforce irreversible actions. Pair with a typed confirmation field below (e.g. password input).
        </p>
        <DocsExample
          title="Delete Account confirmation"
          preview={
            <div className="max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-(--shadow-custom-md)">
              <header className="flex items-start gap-3 p-4 border-b border-stroke-soft-200">
                <span className="size-9 rounded-full bg-(--state-error-light) text-(--state-error-base) inline-flex items-center justify-center shrink-0">!</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text-strong-950">Delete Account</div>
                  <div className="text-xs text-text-sub-600 mt-0.5">Confirm the deletion of your account.</div>
                </div>
                <button aria-label="Close" className="size-5 text-icon-soft-400 hover:text-text-strong-950">✕</button>
              </header>
              <div className="p-4 space-y-3">
                <div className="text-sm font-medium text-text-strong-950">Delete user account james@dash.com?</div>
                <Alert size="sm" status="error" appearance="lighter" title="This action can not be undone, proceed with caution." />
                <p className="text-sm text-text-sub-600 leading-relaxed">
                  This action is irreversible and will permanently delete your account. All of your data, including your profile, posts, and personal information, will be <strong className="text-text-strong-950">permanently removed.</strong>
                </p>
                <p className="text-sm text-text-sub-600 leading-relaxed">
                  By entering your password, you confirm that you understand and accept the consequences of deleting your account.
                </p>
              </div>
              <div className="px-4 py-3 border-t border-stroke-soft-200 flex justify-end gap-2">
                <Button tone="neutral" style="stroke">Cancel</Button>
                <Button tone="destructive">Delete Account</Button>
              </div>
            </div>
          }
          code={`<Modal>
  <ModalHeader status="destructive" title="Delete Account" description="Confirm the deletion of your account." />
  <ModalBody>
    <p>Delete user account james@dash.com?</p>
    <Alert size="sm" status="error" appearance="lighter" title="This action can not be undone, proceed with caution." />
    <p>This action is irreversible...</p>
  </ModalBody>
  <ModalFooter>
    <Button tone="neutral" style="stroke">Cancel</Button>
    <Button tone="destructive">Delete Account</Button>
  </ModalFooter>
</Modal>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Alert = page-level message. One alert at a time, top of content area. Status color must match severity — don't escalate every notification to error red.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <Alert status="information" size="sm" title="Polygon shift Bekasi sudah live · 8 mitra reassigned" dismissible className="w-full max-w-sm" />
            ),
            caption: "Satu alert info di atas konten, dismissable X. Status = informational karena event sukses + bisa di-tutup.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm space-y-2">
                <Alert status="error" size="xs" title="Polygon shift live" />
                <Alert status="error" size="xs" title="Mitra reassigned" />
                <Alert status="error" size="xs" title="Routes optimized" />
                <Alert status="error" size="xs" title="Update successful" />
              </div>
            ),
            caption: "Empat alert error untuk event sukses = noise. Dispatcher abaikan semua karena merah jadi background.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <Alert status="warning" appearance="lighter" size="lg" title="Service area Tangerang Selatan kena banjir" className="w-full max-w-sm">
                12 mitra Express di-pause sementara. Estimasi recovery 2 jam.
              </Alert>
            ),
            caption: "Warning lg untuk situasi yang butuh konteks tambahan (waktu recovery, jumlah affected). Title + body kasih dispatcher cukup data.",
          }}
          dont={{
            preview: (
              <Alert status="warning" size="xs" title="Warning!" className="w-full max-w-sm" />
            ),
            caption: "Title generic 'Warning!' tanpa subject + tanpa action plan. Dispatcher panik tapi tidak tahu harus apa.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "status", type: '"error" | "warning" | "success" | "information" | "feature"', defaultValue: '"information"', description: "Semantic intent — drives icon glyph + color." },
            { name: "appearance", type: '"filled" | "lighter" | "stroke"', defaultValue: '"lighter"', description: "Surface treatment. lighter = -200 tint (Figma soft). stroke = white-bg surface variant." },
            { name: "size", type: '"xs" | "sm" | "lg"', defaultValue: '"sm"', description: "xs / sm = single-line compact. lg = title + multi-line description + dual action links." },
            { name: "title", type: "ReactNode", description: "Primary label." },
            { name: "children", type: "ReactNode", description: "Description body. Only renders in size='lg'." },
            { name: "action", type: "ReactNode", description: "Inline action slot — anchor or button. sm/xs renders inline after title; lg renders below body." },
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
