"use client"

import { ActivityTimeline } from "@/registry/dash/blocks/activity-timeline"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ActivityTimelineDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Lists"
        title="Activity Timeline"
        description="Audit-log feed for Reservasi tribe ops — dispatch state changes, mitra actions, ticket transitions. Vertically stacked rail with status icons + relative time."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add activity-timeline`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Dispatch + payout activity"
          description="Defaults render a 6-event Reservasi audit trail."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <ActivityTimeline />
            </div>
          }
          code={`<ActivityTimeline events={[/* TimelineEvent[] */]} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Wrapped in <code>Card</code> with <code>CardHeader</code> + <code>CardTitle</code> + <code>CardDescription</code>.</li>
          <li>Each event row: status icon + <code>Avatar</code> initials + actor + verb + target + relative time + optional <code>Badge</code>.</li>
          <li>Icon set: <code>Truck</code> (dispatch), <code>CheckCircle2</code> (success), <code>AlertTriangle</code> (warning), <code>UserPlus</code> (mitra), <code>Receipt</code> (payout), <code>MessageSquare</code> (note).</li>
          <li>Override <code>events</code> prop to wire to live audit log feed.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for tribe-scoped activity feeds (dispatch, mitra, payout).</li>
          <li><strong>Use</strong> in side panel of <code>ListDetailPage</code> showing "Aktivitas terakhir" for a mitra.</li>
          <li><strong>Use</strong> for Halo-dash agent audit log.</li>
          <li><strong>Don't</strong> use for high-volume feeds (&gt; 100 events) — paginate or virtualize.</li>
          <li><strong>Don't</strong> use as the main page content for compliance audit — needs filter + export tools.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "events", type: "TimelineEvent[]", description: "{ id, actor, action, target?, time, kind: 'dispatch' | 'success' | 'warning' | 'mitra' | 'payout' | 'note' }." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
