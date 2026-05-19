"use client"

import * as React from "react"
import { RiRefreshLine as Refresh } from "@remixicon/react"
import { AnimatedAlert } from "@/registry/dash/ui/animated-alert"
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
 * AnimatedAlert — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/alert/AnimatedAlert.tsx
 *
 * A thin wrapper around Alert that adds a `fade-in / zoom-in-95 / slide-in-from-top-4`
 * entrance using Tailwind's `animate-in` utilities. Re-keying on the alert's identity
 * causes the animation to replay on every change — useful for inline form errors that
 * shouldn't feel "stale" when the message updates.
 */

type Status = "error" | "warning" | "success" | "information" | "feature"

type Err = { type: Status; title?: React.ReactNode; message?: React.ReactNode }

export default function AnimatedAlertDocsPage() {
  const [counter, setCounter] = React.useState(0)
  const errors: Err[] = [
    { type: "error", title: "Invalid OTP", message: "The code you entered is incorrect." },
    { type: "information", title: "Tip", message: "Pickups are faster between 10 AM and 2 PM." },
    { type: "success", title: "Saved", message: "Your changes were applied." },
  ]
  const current = errors[counter % errors.length]

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Feedback"
        title="Animated Alert"
        description="Alert with a soft slide-in/zoom entrance. Replays on every content change so successive validation errors feel fresh, not sticky."
        status="new"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add animated-alert`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`<AnimatedAlert
  error={{
    type: "error",
    title: "Invalid OTP",
    message: "The code you entered is incorrect.",
  }}
/>`}
        />
      </DocsSection>

      <DocsSection title="Live: replay on change">
        <DocsExample
          title="Click to swap message"
          description="Re-keying forces React to remount the wrapper, replaying the animate-in keyframes."
          preview={
            <div className="w-full max-w-md space-y-3">
              <AnimatedAlert error={current} />
              <Button
                tone="neutral"
                style="stroke"
                onClick={() => setCounter((c) => c + 1)}
                leftIcon={<Refresh className="size-4" />}
              >
                Next message
              </Button>
            </div>
          }
          code={`const [counter, setCounter] = React.useState(0)
const errors = [
  { type: "error", title: "Invalid OTP", message: "The code you entered is incorrect." },
  { type: "information", title: "Tip", message: "Pickups are faster between 10 AM and 2 PM." },
  { type: "success", title: "Saved", message: "Your changes were applied." },
]
const current = errors[counter % errors.length]

<AnimatedAlert error={current} />
<Button onClick={() => setCounter((c) => c + 1)}>Next</Button>`}
        />
      </DocsSection>

      <DocsSection title="Statuses">
        <DocsExample
          title="error · information · success"
          preview={
            <div className="w-full max-w-md space-y-3">
              {errors.map((e, i) => (
                <AnimatedAlert key={i} error={e} />
              ))}
            </div>
          }
          code={`<AnimatedAlert error={{ type: "error", title: "Invalid OTP", message: "..." }} />
<AnimatedAlert error={{ type: "information", title: "Tip", message: "..." }} />
<AnimatedAlert error={{ type: "success", title: "Saved", message: "..." }} />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "error.type",
              type: '"error" | "warning" | "success" | "information" | "feature"',
              defaultValue: "—",
              description: "Maps to the underlying Alert status (icon + tint).",
            },
            {
              name: "error.title",
              type: "ReactNode",
              defaultValue: "—",
              description: "Optional bold first line.",
            },
            {
              name: "error.message",
              type: "ReactNode",
              defaultValue: "—",
              description: "Body copy.",
            },
            {
              name: "className",
              type: "string",
              defaultValue: "—",
              description: "Forwarded to the outer animating wrapper.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Outer <code>div</code> — keyed on content tuple, owns the entrance animation.</li>
          <li>Inner <code>Alert</code> primitive — owns status colour, icon, title, body.</li>
          <li>No close action by default — pair with form submit to clear via state.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
