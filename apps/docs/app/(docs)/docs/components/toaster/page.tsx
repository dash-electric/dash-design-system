"use client"

import * as React from "react"
import {
  RiCheckboxCircleLine as CheckCircle,
  RiErrorWarningLine as AlertCircle,
  RiAlertLine as AlertTriangle,
  RiCloseLine as Close,
} from "@remixicon/react"
import { Toaster, toast, toastFilled } from "@/registry/dash/ui/toaster"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Toaster — Figma 1:1 (3 nodes, verified 2026-05-17).
 *
 *   2902:10807  Compact filled success toast (light)  — bg success-base + label + link + close
 *   2902:10839  same (dark)
 *   2902:10862  Filled error toast 2-line (light)     — bg error-base + title + description + Learn More + close
 *   2902:10875  same (dark)
 *   2902:10941  Stroke warning toast (light)          — white bg + warning icon + label + close
 *   2902:10954  same (dark)
 *
 * Stroke variant ships out-of-the-box via `toast.warning(...)` (uses Sonner default + Dash classNames).
 * Filled variants ship via the new `toastFilled` helper.
 */

export default function ToasterDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Feedback"
        title="Toaster"
        description="Transient bottom-right notifications. Wraps Sonner with Dash tokens. Three Figma variants — compact filled success, multi-line filled error, single-line stroke warning. Auto-dismisses after 4.2s by default; pair with an inline action link for follow-through (See Transaction, Learn More)."
      />

      <Toaster />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add toaster`} />
        <p className="text-sm text-text-sub-600 mt-2 max-w-2xl">
          Mount &lt;Toaster /&gt; once at the app root (typically inside <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">app/layout.tsx</code>). Call <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">toast()</code> / <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">toastFilled()</code> from anywhere.
        </p>
      </DocsSection>

      {/* 1. Compact filled success — 2902:10807 */}
      <DocsSection title="Compact filled success">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Solid status-color bg. White icon + white label + white action link + white close. Use for clear positive feedback (payment, confirmation, save).
        </p>
        <DocsExample
          title="Trigger + static preview"
          preview={
            <div className="space-y-4">
              <Button
                size="sm"
                tone="neutral"
                style="stroke"
                onClick={() =>
                  toastFilled.success("Payment Received", {
                    action: { label: "See Transaction", onClick: () => {} },
                  })
                }
              >
                Trigger toast
              </Button>
              <div className="relative h-32 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 overflow-hidden">
                <div className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-[10px] bg-(--state-success-base) text-static-white pl-2.5 pr-2 py-2 shadow-(--shadow-tooltip)">
                  <CheckCircle className="size-[15px]" />
                  <span className="text-sm font-medium">Payment Received</span>
                  <a href="#" className="text-sm font-medium underline underline-offset-2 ml-2">See Transaction</a>
                  <button aria-label="Dismiss" className="size-5 inline-flex items-center justify-center rounded-sm opacity-[0.72] hover:opacity-100"><Close className="size-3.5" /></button>
                </div>
              </div>
            </div>
          }
          code={`toastFilled.success("Payment Received", {
  action: { label: "See Transaction", onClick: () => router.push("/tx/123") },
})`}
        />
      </DocsSection>

      {/* 2. Filled error 2-line — 2902:10862 */}
      <DocsSection title="Filled error 2-line">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Title + 2-line description + Learn More underline link. Use for system failures that need explanation (connection, validation, server).
        </p>
        <DocsExample
          title="Trigger + static preview"
          preview={
            <div className="space-y-4">
              <Button
                size="sm"
                tone="destructive"
                style="stroke"
                onClick={() =>
                  toastFilled.error("Database Connection Failure", {
                    description: "We're encountering issues with connecting to our system's database at the moment.",
                    action: { label: "Learn More", onClick: () => {} },
                  })
                }
              >
                Trigger error toast
              </Button>
              <div className="relative h-44 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 overflow-hidden">
                <div className="absolute bottom-3 right-3 max-w-sm rounded-[10px] bg-(--state-error-base) text-static-white px-3 py-2.5 shadow-(--shadow-tooltip)">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-[15px] mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium leading-5">Database Connection Failure</div>
                      <div className="text-xs leading-4 text-static-white/80 mt-1">We&apos;re encountering issues with connecting to our system&apos;s database at the moment.</div>
                      <a href="#" className="inline-block mt-2 text-sm font-medium underline underline-offset-2">Learn More</a>
                    </div>
                    <button aria-label="Dismiss" className="size-5 inline-flex items-center justify-center rounded-sm opacity-[0.72] hover:opacity-100 shrink-0"><Close className="size-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          }
          code={`toastFilled.error("Database Connection Failure", {
  description: "We're encountering issues...",
  action: { label: "Learn More", onClick: () => {} },
})`}
        />
      </DocsSection>

      {/* 3. Stroke warning — 2902:10941 */}
      <DocsSection title="Stroke warning">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          White bg + warning icon + label + close. The default `toast.*` API renders this stroke variant. Use for low-priority status that doesn&apos;t need a status fill.
        </p>
        <DocsExample
          title="Trigger + static preview"
          preview={
            <div className="space-y-4">
              <Button
                size="sm"
                tone="neutral"
                style="stroke"
                onClick={() => toast.warning("Poor Network Connection")}
              >
                Trigger warning toast
              </Button>
              <div className="relative h-32 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 overflow-hidden">
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-[10px] bg-bg-white-0 border border-stroke-soft-200 px-2.5 py-2 shadow-(--shadow-tooltip)">
                  <AlertTriangle className="size-[15px] text-(--state-warning-base)" />
                  <span className="text-sm font-medium text-text-strong-950">Poor Network Connection</span>
                  <button aria-label="Dismiss" className="size-5 inline-flex items-center justify-center rounded-sm text-text-strong-950 opacity-[0.72] hover:opacity-100"><Close className="size-3.5" /></button>
                </div>
              </div>
            </div>
          }
          code={`toast.warning("Poor Network Connection")
toast.success("Saved")
toast.error("Failed to save")
toast.info("Synced")`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "toast(message, opts?)",  type: "function", description: "Default stroke toast — white bg + border. Pass `description`, `action`, `duration`." },
            { name: "toast.success(...)",     type: "function", description: "Stroke + success icon." },
            { name: "toast.error(...)",       type: "function", description: "Stroke + error icon." },
            { name: "toast.warning(...)",     type: "function", description: "Stroke + warning icon." },
            { name: "toast.info(...)",        type: "function", description: "Stroke + info icon." },
            { name: "toastFilled.success(message, opts?)", type: "function", description: "Filled solid-color toast — success-base bg, white icon + label." },
            { name: "toastFilled.error(...)", type: "function", description: "Filled error-base bg. Pass `description` for 2-line layout." },
            { name: "toastFilled.warning(...)", type: "function", description: "Filled warning-base bg." },
            { name: "featureToast(message)",  type: "function", description: "Stroke + sparkle icon. Dash-only — for promo / new-feature highlights." },
            { name: "<Toaster />",            type: "component", description: "Mount once at the app root. Configures position, duration, close button, and Dash classNames overrides." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
