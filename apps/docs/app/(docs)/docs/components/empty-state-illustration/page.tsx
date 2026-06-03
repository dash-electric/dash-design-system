"use client"

import * as React from "react"
import { EmptyStateIllustration, type EmptyStateKind } from "@/registry/dash/ui/empty-state-illustration"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const ALL_KINDS: EmptyStateKind[] = [
  "budget-overview",
  "course-progress",
  "courses",
  "credit-score",
  "currency-list",
  "current-project",
  "daily-feedback",
  "daily-work-hours",
  "donation-profile",
  "employee-comments",
  "employee-rating",
  "employee-rewards",
  "employee-spotlight-overview",
  "exchange",
  "major-expenses",
  "my-cards",
  "my-cards-vertical",
  "my-subscriptions",
  "notes",
  "quick-transfer",
  "recent-transactions",
  "saved-actions",
  "schedule-events",
  "schedule-holiday",
  "schedule-meetings",
  "spending-summary",
  "status-tracker",
  "stock-market-tracker",
  "time-off",
  "time-tracker",
  "total-balance",
  "total-expenses",
  "training-analysis",
  "work-hour-analysis",
]

export default function EmptyStateIllustrationDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="shipped"
        kind="atom"
        category="Components / Feedback"
        title="Empty State Illustration"
        description="34 widget-specific 148×148 SVG illustrations sourced from the Dash brand asset library (2026-05-19). Used inside any empty body slot — paired with EmptyState text + recovery action. Falls back to a neutral muted disc when `kind` is not in the catalog (helps catch typos at design-time without crashing the page)."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add empty-state-illustration`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          A single <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<img>`}</code> element sourced from
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950 ml-1">{`/brand/empty-states/<kind>.svg`}</code>.
          Native Figma size is 148×148 — scale up/down via the <code className="text-xs">size</code> prop without aliasing (SVG vector).
        </p>
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-10 flex items-center justify-center gap-12">
          <div className="flex flex-col items-center gap-3">
            <EmptyStateIllustration kind="schedule-events" />
            <span className="text-[11px] uppercase tracking-widest text-text-soft-400">native (148)</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <EmptyStateIllustration kind="schedule-events" size={96} />
            <span className="text-[11px] uppercase tracking-widest text-text-soft-400">compact (96)</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <EmptyStateIllustration kind={"does-not-exist" as EmptyStateKind} />
            <span className="text-[11px] uppercase tracking-widest text-text-soft-400">fallback (typo)</span>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Inline with EmptyState"
          description="The canonical pairing — illustration above title + description + recovery action."
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-8 max-w-md text-center">
              <EmptyStateIllustration kind="quick-transfer" size={120} className="mx-auto mb-4" />
              <div className="text-base font-semibold text-text-strong-950 mb-1">Belum ada transfer cepat</div>
              <p className="text-sm text-text-sub-600 mb-4">
                Tambah penerima favorit untuk kirim uang dalam satu klik tanpa cari ulang nomor rekening.
              </p>
              <Button size="sm">Tambah penerima</Button>
            </div>
          }
          code={`<EmptyStateIllustration kind="quick-transfer" size={120} />
<h3>Belum ada transfer cepat</h3>
<p>Tambah penerima favorit...</p>
<Button>Tambah penerima</Button>`}
        />

        <DocsExample
          title="Sizes — 64 / 96 / 120 / 148"
          description="Pick by surrounding card density. 148 = hero-scale empty card; 64 = inline row/list empty."
          preview={
            <div className="flex items-end gap-6">
              {[64, 96, 120, 148].map((size) => (
                <div key={size} className="flex flex-col items-center gap-1.5">
                  <EmptyStateIllustration kind="recent-transactions" size={size} />
                  <span className="text-[10px] text-text-soft-400">{size}px</span>
                </div>
              ))}
            </div>
          }
          code={`<EmptyStateIllustration kind="recent-transactions" size={64} />
<EmptyStateIllustration kind="recent-transactions" size={148} />`}
        />

        <DocsExample
          title="Full catalog — all 34 kinds"
          description="Every illustration shipped. Scroll to find the closest match to your widget context before composing custom art."
          preview={
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {ALL_KINDS.map((kind) => (
                <div
                  key={kind}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3"
                >
                  <EmptyStateIllustration kind={kind} size={72} />
                  <code className="text-[10px] text-text-sub-600 text-center break-all">{kind}</code>
                </div>
              ))}
            </div>
          }
          code={`<EmptyStateIllustration kind="budget-overview" />
<EmptyStateIllustration kind="time-off" />
<EmptyStateIllustration kind="status-tracker" />
// ...32 more kinds`}
        />

        <DocsExample
          title="Inside a widget shell"
          description="Common pairing for finance / HR dashboard widgets with zero-data state."
          preview={
            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 max-w-sm">
              <div className="text-sm font-semibold text-text-strong-950 mb-3">My Cards</div>
              <div className="flex flex-col items-center text-center py-4">
                <EmptyStateIllustration kind="my-cards" size={108} />
                <div className="text-sm font-medium text-text-strong-950 mt-3 mb-1">Belum ada kartu terdaftar</div>
                <p className="text-xs text-text-sub-600 mb-3">Tambahkan kartu kredit/debit untuk mulai tracking pengeluaran.</p>
                <Button size="xs">Tambah kartu</Button>
              </div>
            </div>
          }
          code={`<WidgetShell title="My Cards">
  <div className="text-center py-4">
    <EmptyStateIllustration kind="my-cards" size={108} />
    <h4>Belum ada kartu terdaftar</h4>
    <p>Tambahkan kartu kredit/debit...</p>
    <Button size="xs">Tambah kartu</Button>
  </div>
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="API" id="api">
        <DocsPropsTable
          rows={[
            { name: "kind", type: "EmptyStateKind", description: "Which illustration to render. 34 supported values — see Full catalog above. Unknown values render a muted disc fallback." },
            { name: "size", type: "number", defaultValue: "148", description: "Square render size in pixels (Figma native = 148)." },
            { name: "alt", type: "string", defaultValue: '""', description: "Accessible alt text. Defaults to empty string (treated as decorative). Override when the illustration carries meaning the surrounding text does not." },
            { name: "...ImgHTMLAttributes", type: "React.ImgHTMLAttributes<HTMLImageElement>", description: "All other props forward to the underlying <img>." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-3 text-base text-text-sub-600 leading-relaxed">
          <li><strong className="text-text-strong-950">Decorative by default</strong> — defaults to <code className="text-xs">{`alt=""`}</code>. Screen readers skip the image because the surrounding EmptyState title + description already convey meaning.</li>
          <li><strong className="text-text-strong-950">Meaningful illustrations</strong> — when the image carries unique meaning (e.g. status indicator), pass an explicit <code className="text-xs">alt</code> describing the state.</li>
          <li><strong className="text-text-strong-950">Fallback safety</strong> — unknown <code className="text-xs">kind</code> renders an <code className="text-xs">aria-hidden</code> muted disc — no crash, no misleading alt text.</li>
          <li><strong className="text-text-strong-950">Non-draggable</strong> — <code className="text-xs">draggable={'{'}false{'}'}</code> prevents accidental drag-out of the empty state card.</li>
          <li><strong className="text-text-strong-950">Color contrast</strong> — illustrations use mid-tone palette designed to pair with surface backgrounds at WCAG AA. Avoid placing on heavily tinted backgrounds.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Asset source">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Assets vendored from the Dash brand asset library (2026-05-19).</li>
          <li>• Files live in <code className="text-xs">public/brand/empty-states/&lt;kind&gt;.svg</code>.</li>
          <li>• To add a new illustration: drop the SVG into that directory, append the slug to the <code className="text-xs">EmptyStateKind</code> union + <code className="text-xs">EMPTY_KINDS</code> set in the source.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
