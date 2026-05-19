"use client"

import * as React from "react"
import { AnnouncementBar } from "@/registry/dash/ui/announcement-bar"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
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
        status="new"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add announcement-bar`} />
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
