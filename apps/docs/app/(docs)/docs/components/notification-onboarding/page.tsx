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
        status="new"
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
