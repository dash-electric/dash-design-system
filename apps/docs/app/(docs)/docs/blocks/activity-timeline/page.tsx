"use client"

import { ActivityTimeline } from "@/registry/dash/blocks/activity-timeline"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
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
        <DocsCode language="bash" code={`dashkit add activity-timeline`} />
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Wrapped in <code>Card</code> with <code>CardHeader</code> + <code>CardTitle</code> + <code>CardDescription</code>.</li>
          <li>Each event row: status icon + <code>Avatar</code> initials + actor + verb + target + relative time + optional <code>Badge</code>.</li>
          <li>Icon set: <code>Truck</code> (dispatch), <code>CheckCircle2</code> (success), <code>AlertTriangle</code> (warning), <code>UserPlus</code> (mitra), <code>Receipt</code> (payout), <code>MessageSquare</code> (note).</li>
          <li>Override <code>events</code> prop to wire to live audit log feed.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
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
      <DocsSection title="Newest at top">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Activity feeds anchor at the latest event. Don't reverse-chronologically render oldest-first like a chat log.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="flex gap-2 text-xs"><span className="text-[10px] text-text-soft-400 mt-0.5">14:32</span><span><strong>Budi</strong> menyetujui payout #4021 untuk KopKen</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[10px] text-text-soft-400 mt-0.5">14:10</span><span><strong>Sari</strong> assign order #2842 ke Tono S.</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[10px] text-text-soft-400 mt-0.5">13:55</span><span><strong>System</strong> auto-suspend mitra #M-184 (3 dispatch terlewat)</span></div>
              </div>
            ),
            caption: "Newest event on top. The activity feed is for catching up — most recent first, scroll down for history.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="flex gap-2 text-xs"><span className="text-[10px] text-text-soft-400 mt-0.5">13:55</span><span>System auto-suspend mitra #M-184</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[10px] text-text-soft-400 mt-0.5">14:10</span><span>Sari assign order #2842</span></div>
                <div className="flex gap-2 text-xs"><span className="text-[10px] text-text-soft-400 mt-0.5">14:32</span><span>Budi menyetujui payout #4021</span></div>
              </div>
            ),
            caption: "Don't render activity oldest-first. The reader has to scroll to find what just happened.",
          }}
        />
      </DocsSection>

      <DocsSection title="Actor + verb + object">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Every event reads as a sentence: subject (who) + verb (action) + object (what). Don't render bare status codes.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="text-xs"><strong>Sari</strong> mengganti SLA polygon Jaksel dari <strong>45min</strong> ke <strong>30min</strong></div>
                <div className="text-xs"><strong>Budi</strong> menambahkan mitra <strong>Tono S.</strong> ke Tier-3</div>
              </div>
            ),
            caption: "Human-readable: actor, action, object — with the changing values surfaced inline.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="text-xs font-mono">SLA_UPDATE | polygon=JKS | old=45 | new=30 | by=sari@dash.id</div>
                <div className="text-xs font-mono">MITRA_ADD | tier=3 | id=M-422 | by=budi@dash.id</div>
              </div>
            ),
            caption: "Don't dump audit-log tuples into the activity feed. That's debug output, not human communication.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
