"use client"

import * as React from "react"
import { AnnouncementBar } from "@/registry/dash/ui/announcement-bar"
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
 * AnnouncementBar — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/banner/AnnouncementBar.tsx
 *
 * Sticky top-of-page running text (news-ticker style). NOT dismissible — meant for
 * always-on global promos like "Holiday rate · Free pickup 28-31 Dec" that re-set
 * via CMS. Marquee duplicates the text N times so the loop is seamless on any width.
 */

export default function AnnouncementBarDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Feedback"
        title="Announcement Bar"
        description="Sticky, non-dismissible top-of-page ticker for global promos and downtime notices. Marquee scrolls right-to-left at a constant 30s/cycle."
        status="beta"
        kind="specialized"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add announcement-bar`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`<AnnouncementBar text="Holiday rate active · Free pickup 28-31 Dec · See terms" />`}
        />
      </DocsSection>

      <DocsSection title="Live">
        <DocsExample
          title="Default marquee"
          preview={
            <div className="w-full overflow-hidden rounded-lg border border-stroke-soft-200">
              <AnnouncementBar text="Holiday rate active · Free pickup 28-31 Dec · See terms" />
            </div>
          }
          code={`<AnnouncementBar text="Holiday rate active · Free pickup 28-31 Dec · See terms" />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          AnnouncementBar = always-on global ticker. Pakai untuk promo / downtime yang berlaku company-wide. Bukan untuk pesan personal atau yang butuh user action.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full overflow-hidden rounded-lg border border-stroke-soft-200">
                <AnnouncementBar text="Promo Hari Kemerdekaan · Cashback 17% buat mitra Express 17-19 Aug · Lihat syarat" />
              </div>
            ),
            caption: "Promo company-wide dengan periode jelas + CTA singkat. Marquee cocok untuk pesan singkat yang berlaku semua mitra.",
          }}
          dont={{
            preview: (
              <div className="w-full overflow-hidden rounded-lg border border-stroke-soft-200">
                <AnnouncementBar text="mtr-9412 perlu update KTP" />
              </div>
            ),
            caption: "Jangan pakai untuk notifikasi user-spesifik. Marquee dilihat semua orang, info pribadi mitra leak. Gunakan Notification atau in-app banner.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full overflow-hidden rounded-lg border border-stroke-soft-200">
                <AnnouncementBar text="Maintenance dispatcher panel · Sabtu 21 Mei 02:00-04:00 WIB · Mitra app tetap normal" />
              </div>
            ),
            caption: "Downtime notice dengan window jelas + scope (apa yang affected, apa yang tidak). User bisa rencana.",
          }}
          dont={{
            preview: (
              <div className="w-full overflow-hidden rounded-lg border border-stroke-soft-200">
                <AnnouncementBar text="System update coming soon" />
              </div>
            ),
            caption: "'Coming soon' tanpa tanggal + scope = user bingung kapan dan apa yang berubah. Marquee jadi noise.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "text", type: "string", description: "The announcement copy. Single line, repeated 8× internally." },
            { name: "visible", type: "boolean", defaultValue: "true", description: "Renders nothing when false — pair with CMS flag/feature toggle." },
            { name: "className", type: "string", description: "Forwarded to the outer fixed/sticky container if you want to swap colours." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Layout integration">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Render as the first child of the root layout, above the topbar.</li>
          <li>When visible, push the main content + sidebar down by 40px (the bar height).</li>
          <li>Wire <code>onVisibilityChange</code> if you need that offset to live in state.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
