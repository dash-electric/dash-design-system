"use client"

import * as React from "react"
import { RiNotification3Line as Bell } from "@remixicon/react"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Button } from "@/registry/dash/ui/button"
import {
  NotificationOnboarding,
  DEFAULT_NOTIFICATION_ONBOARDING_KEY as LS_KEY,
} from "@/registry/dash/ui/notification-onboarding"
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
 * NotificationOnboarding — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/onboarding/NotificationOnboarding.tsx
 *
 * Popover-based feature walkthrough hint. Wraps a target element with a pulsing
 * dot when the user hasn't seen the hint, then promotes to a backdrop + arrowed
 * card after a short delay. Persists "seen" state in localStorage so the hint
 * fires once per device.
 */

export default function NotificationOnboardingDocsPage() {
  const [resetKey, setResetKey] = React.useState(0)
  React.useEffect(() => {
    // Reset the "seen" flag so docs page can replay the hint on each visit.
    if (typeof window !== "undefined") {
      localStorage.removeItem(`${LS_KEY}_docs`)
    }
  }, [resetKey])

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Onboarding"
        title="Notification Onboarding"
        description="One-shot popover walkthrough that points at a single anchor element. Shows a pulsing red dot, then promotes to a card with backdrop after 800ms. Persists 'seen' to localStorage so it fires once per device."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add notification-onboarding`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`<NotificationOnboarding>
  <IconButton tone="neutral" style="ghost"><Bell /></IconButton>
</NotificationOnboarding>`}
        />
      </DocsSection>

      <DocsSection title="Live: replayable hint">
        <DocsExample
          title="Bell anchor — hint fires 800ms after mount"
          description="Click the dismiss button or the backdrop to mark seen. Click 'Replay' below to clear localStorage and remount."
          preview={
            <div className="flex flex-col items-end gap-4">
              <div className="relative" key={resetKey}>
                <NotificationOnboarding storageKey={`${LS_KEY}_docs`}>
                  <IconButton tone="neutral" style="stroke" size="md" aria-label="Notifications">
                    <Bell />
                  </IconButton>
                </NotificationOnboarding>
              </div>
              <Button
                tone="neutral"
                style="stroke"
                size="sm"
                onClick={() => setResetKey((k) => k + 1)}
              >
                Replay
              </Button>
            </div>
          }
          code={`<NotificationOnboarding>
  <IconButton aria-label="Notifications"><Bell /></IconButton>
</NotificationOnboarding>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          NotificationOnboarding = walkthrough sekali untuk fitur baru. Persist 'seen' di localStorage supaya tidak nyangkut. Satu hint per session, bump storageKey saat copy berubah.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-end gap-3">
                <div className="relative">
                  <IconButton tone="neutral" style="stroke" size="md" aria-label="Notifications"><Bell /></IconButton>
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-error-base animate-pulse" />
                </div>
                <div className="text-xs text-text-sub-600 max-w-[140px]">Hint sekali → user dismiss → localStorage persist 'seen'.</div>
              </div>
            ),
            caption: "Satu pulsing dot pada anchor (bell icon), promote ke card setelah 800ms, dismissable. 'Seen' tersimpan supaya tidak muncul lagi.",
          }}
          dont={{
            preview: (
              <div className="flex flex-wrap gap-2 max-w-xs">
                <div className="relative">
                  <IconButton size="sm" aria-label="A"><Bell /></IconButton>
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-error-base animate-pulse" />
                </div>
                <div className="relative">
                  <Button size="sm">Action</Button>
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-error-base animate-pulse" />
                </div>
                <div className="relative">
                  <IconButton size="sm" aria-label="C"><Bell /></IconButton>
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-error-base animate-pulse" />
                </div>
              </div>
            ),
            caption: "3 hint pulsing simultan = user kewalahan tidak tahu klik mana dulu. Maks satu onboarding hint aktif per layar.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="text-xs text-text-sub-600 max-w-xs space-y-1">
                <div className="font-medium text-text-strong-950">storageKey: dash_notif_v2_2026_05_20</div>
                <div>Bump versi + tanggal saat copy/feature berubah supaya hint muncul lagi.</div>
              </div>
            ),
            caption: "storageKey versioned (v2_2026_05_20). Saat feature update, bump key → user yang sudah 'seen' versi lama dapat hint baru.",
          }}
          dont={{
            preview: (
              <div className="text-xs text-text-sub-600 max-w-xs space-y-1">
                <div className="font-medium text-text-strong-950">storageKey: seen</div>
                <div>Generic key, tabrakan dengan onboarding fitur lain di app yang sama.</div>
              </div>
            ),
            caption: "storageKey 'seen' generic = collide dengan onboarding lain. Pakai prefix unique (dash_<feature>_<version>).",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "children", type: "ReactNode", description: "The anchor element. Onboarding wraps it and positions the popover to its bottom-right." },
            { name: "storageKey", type: "string", defaultValue: "dash_notification_onboarding_seen", description: "Bump on copy changes to re-show the hint to everyone." },
            { name: "title / description / cta / hint", type: "ReactNode", description: "All copy slots overridable." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Anchor (children) — always rendered.</li>
          <li>Pulsing dot — overlaid until the hint fires or has been seen.</li>
          <li>Backdrop — fixed inset-0, dismisses on click.</li>
          <li>Card — absolute top-full right-0 mt-2 with arrow pointer.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
