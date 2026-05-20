"use client"

import { HaloDash3Pane } from "@/registry/dash/templates/halo-dash-3pane"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HaloDash3PaneDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Custom"
        title="Halo-Dash 3-Pane Shell"
        description="Backoffice support module shell. Sidebar plus a resizable 3-pane work surface — ticket list, conversation thread, customer inspector — modeled on Front, Intercom, and Linear's triage views."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add halo-dash-3pane`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Active queue — 5 tickets"
          description="Default render with the active ticket pre-selected. All 3 panes resizable; min/max constraints kept tribal-friendly."
          preview={
            <DocsTemplatePreview>
              <HaloDash3Pane />
            </DocsTemplatePreview>
          }
          code={`<HaloDash3Pane
  tickets={[/* Ticket[] */]}
  defaultSelected="TKT-8841"
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="A full work-surface template — sidebar + 3 resizable panes glued by the @dash Resizable primitive."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>Sidebar</code> — Halo-dash brand + Queue / Resolved / My team / Settings groups.</li>
          <li><strong>Pane 1 (28%)</strong> — Ticket list with search, priority badge, SLA timer, and unread border indicator.</li>
          <li><strong>Pane 2 (45%)</strong> — Conversation header (customer + ticket meta) + message thread + composer footer with Send button.</li>
          <li><strong>Pane 3 (27%)</strong> — Customer inspector: avatar, contact, stats grid (lifetime tickets, NPS, region), ticket history list.</li>
          <li>Each pane has its own toolbar slot — easy to add bulk-action bars, AI summary cards, or filter chips.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for Halo-dash agent's primary work surface.</li>
          <li><strong>Use</strong> for any inbox-driven workflow — moderation queue, dispatch override queue, fraud review.</li>
          <li><strong>Use</strong> when context (customer / target / metadata) lives alongside the conversation.</li>
          <li><strong>Don't</strong> use for read-only analytics — reach for a vertical dashboard.</li>
          <li><strong>Don't</strong> use for 2-pane master/detail without context — reach for <code>ListDetailPage</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "tickets", type: "Ticket[]", description: "{ id, customer, subject, preview, priority, slaLeftMin, unread?, time }." },
            { name: "defaultSelected", type: "string", description: "Ticket id selected on first render." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
      <DocsSection title="Three-pane density">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Halo-dash 3-pane = list | thread | inspector. Each pane sized for its job: list ~280px, thread fluid, inspector ~320px. Don't equal-size the panes.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md h-32 rounded-lg border border-stroke-soft-200 bg-bg-white-0 overflow-hidden grid grid-cols-[80px_1fr_90px]">
                <div className="border-r border-stroke-soft-200 p-1.5 space-y-1"><div className="h-5 rounded bg-primary-alpha-16" /><div className="h-5 rounded bg-bg-weak-50" /><div className="h-5 rounded bg-bg-weak-50" /></div>
                <div className="border-r border-stroke-soft-200 p-1.5 space-y-1"><div className="h-3 rounded bg-bg-soft-200 w-24" /><div className="h-2 rounded bg-bg-weak-50" /><div className="h-12 rounded bg-bg-weak-50" /></div>
                <div className="p-1.5 space-y-1"><div className="h-3 rounded bg-bg-soft-200" /><div className="h-3 rounded bg-bg-weak-50" /></div>
              </div>
            ),
            caption: "Narrow list (scan), wide thread (read), narrow inspector (meta). Each pane gets the width its content needs.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md h-32 rounded-lg border border-stroke-soft-200 bg-bg-white-0 overflow-hidden grid grid-cols-3">
                <div className="border-r border-stroke-soft-200 p-1.5"><div className="h-5 rounded bg-bg-weak-50" /></div>
                <div className="border-r border-stroke-soft-200 p-1.5"><div className="h-5 rounded bg-bg-weak-50" /></div>
                <div className="p-1.5"><div className="h-5 rounded bg-bg-weak-50" /></div>
              </div>
            ),
            caption: "Don't equal-size the panes. Thread copy gets cramped, inspector wastes space, list overflows.",
          }}
        />
      </DocsSection>

      <DocsSection title="Inspector toggleable">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Inspector pane (metadata) should be collapsible — ops sometimes wants thread full-width. Don't lock it open.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md h-32 rounded-lg border border-stroke-soft-200 bg-bg-white-0 overflow-hidden grid grid-cols-[80px_1fr]">
                <div className="border-r border-stroke-soft-200 p-1.5 space-y-1"><div className="h-5 rounded bg-primary-alpha-16" /><div className="h-5 rounded bg-bg-weak-50" /></div>
                <div className="p-1.5 space-y-1 relative"><div className="h-3 rounded bg-bg-soft-200 w-32" /><div className="h-12 rounded bg-bg-weak-50" /><button className="absolute top-1 right-1 size-5 rounded border border-stroke-soft-200 text-[9px]">›</button></div>
              </div>
            ),
            caption: "Inspector collapses with a chevron toggle. Thread reflows to full width. State persists across sessions.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md h-32 rounded-lg border border-stroke-soft-200 bg-bg-white-0 overflow-hidden grid grid-cols-[80px_1fr_120px]">
                <div className="border-r border-stroke-soft-200 p-1.5"><div className="h-5 rounded bg-bg-weak-50" /></div>
                <div className="border-r border-stroke-soft-200 p-1.5"><div className="h-3 rounded bg-bg-soft-200 w-20" /></div>
                <div className="p-1.5 space-y-1"><div className="h-3 rounded bg-bg-weak-50" /><div className="h-3 rounded bg-bg-weak-50" /></div>
              </div>
            ),
            caption: "Don't lock the inspector open. On laptop screens it crowds out the thread content the ops is reading.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
