"use client"

import { SettingsNotifications } from "@/registry/dash/blocks/settings-notifications"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SettingsNotificationsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Settings"
        title="Settings Notifications"
        description="Notification preference matrix — dispatch alerts, payout updates, escalations. Per-channel toggles (in-app, email, SMS) for each event class. Tuned for Dash dispatch ops."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add settings-notifications`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Dispatch alerts + payout events"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <SettingsNotifications />
            </div>
          }
          code={`<SettingsNotifications />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Per-event rows: title + <code>FieldDescription</code> + per-channel <code>Switch</code>.</li>
          <li>Channel columns: in-app, email, SMS, push.</li>
          <li>Section groupings — Dispatch / Payout / Mitra / Escalation.</li>
          <li>Dash-domain copy: "Dispatch terlewat", "Lebaran rate freeze", "Mitra suspended".</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> on Settings → Notifications tab.</li>
          <li><strong>Use</strong> as a starting point for any preferences matrix.</li>
          <li><strong>Don't</strong> use for in-app notification feed display — different primitive (use Sheet or Popover).</li>
          <li><strong>Don't</strong> use for marketing email opt-out — those belong to a separate consent flow.</li>
        </ul>
      </DocsSection>
      <DocsSection title="Channel × event matrix">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Notification settings work as a matrix: each event row × each channel column (email, push, in-app, SMS). Don't list 30 individual switches.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-1 text-xs">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center pb-1 border-b border-stroke-soft-200"><span className="text-[10px] text-text-sub-600">Event</span><span className="text-[10px] text-text-sub-600">Email</span><span className="text-[10px] text-text-sub-600">Push</span><span className="text-[10px] text-text-sub-600">SMS</span></div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center"><span>Payout selesai</span><div className="size-4 rounded bg-primary-base" /><div className="size-4 rounded bg-primary-base" /><div className="size-4 rounded border border-stroke-soft-200" /></div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center"><span>Mitra di-suspend</span><div className="size-4 rounded bg-primary-base" /><div className="size-4 rounded border border-stroke-soft-200" /><div className="size-4 rounded bg-primary-base" /></div>
              </div>
            ),
            caption: "Matrix layout: one row per event, one column per channel. Scannable, comparable, fits 30 events on one page.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm space-y-2 text-xs">
                <div className="flex items-center justify-between"><span>Email · Payout selesai</span><div className="w-8 h-4 rounded-full bg-primary-base" /></div>
                <div className="flex items-center justify-between"><span>Push · Payout selesai</span><div className="w-8 h-4 rounded-full bg-primary-base" /></div>
                <div className="flex items-center justify-between"><span>SMS · Payout selesai</span><div className="w-8 h-4 rounded-full bg-bg-soft-200" /></div>
                <div className="flex items-center justify-between"><span>Email · Mitra suspended</span><div className="w-8 h-4 rounded-full bg-primary-base" /></div>
              </div>
            ),
            caption: "Don't flatten the matrix into 30 individual toggles. User has to scroll a mile to compare 'email on for everything' vs 'sms on for emergencies only'.",
          }}
        />
      </DocsSection>

      <DocsSection title="Quiet hours scope">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Surface quiet-hours / DND controls at the top of the page — they affect every notification below. Don't bury DND in 'advanced settings'.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-3">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-2"><p className="text-xs font-medium">Jam tenang</p><p className="text-[10px] text-text-sub-600">Notifikasi push + SMS akan ditahan</p><div className="flex gap-2 items-center text-xs"><div className="h-8 rounded-md border border-stroke-soft-200 flex-1 flex items-center px-2">22:00</div><span>—</span><div className="h-8 rounded-md border border-stroke-soft-200 flex-1 flex items-center px-2">06:00</div></div></div>
              </div>
            ),
            caption: "Quiet hours sit at the top, framing every per-channel preference below.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm space-y-1 text-xs">
                <div>Email · Payout · ON</div>
                <div>Push · Payout · ON</div>
                <div>... 28 more rows ...</div>
                <div className="text-text-soft-400">Advanced ›</div>
              </div>
            ),
            caption: "Don't bury quiet-hours behind 'Advanced'. Users who get 3 AM SMS will rage-tap unsubscribe instead of finding the toggle.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
