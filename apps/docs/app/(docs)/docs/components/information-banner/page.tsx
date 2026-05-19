"use client"

import * as React from "react"
import {
  InformationBanner,
  type InformationBannerSlide as Slide,
} from "@/registry/dash/ui/information-banner"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * InformationBanner — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/banner/InformationBanner.tsx
 *
 * Multi-slide info carousel for the dashboard hero. Auto-advances every 6s, pauses on
 * hover, swappable via arrows or pill indicators. Each slide is intentionally a single
 * image — copy + CTA styling are baked into the PNG so marketing can ship without code.
 *
 * The implementation in Next Portal uses embla-carousel; this docs page ships a 60-line
 * dependency-free port good enough to demo. Production use should drop in embla.
 */

// Demo slides — coloured SVG-data-URI placeholders so the docs page is self-contained.
const placeholder = (label: string, bg: string, fg = "#ffffff") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 280" preserveAspectRatio="xMidYMid slice">
      <rect width="1200" height="280" fill="${bg}"/>
      <text x="60" y="160" font-family="Inter, sans-serif" font-size="56" font-weight="700" fill="${fg}">${label}</text>
    </svg>`,
  )}`

const SLIDES: Slide[] = [
  { id: "a", image: placeholder("Holiday rate · Free pickup", "#7C3AED"), alt: "Holiday promo" },
  { id: "b", image: placeholder("Refer 3 friends · Get Rp50k", "#0EA5E9"), alt: "Referral promo" },
  { id: "c", image: placeholder("New: Multi-stop delivery", "#F59E0B"), alt: "Feature launch" },
]

export default function InformationBannerDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Marketing"
        title="Information Banner"
        description="Multi-slide hero carousel for in-product promotions. Auto-advances every 6s, pause-on-hover, pill indicators widen to show the active slide. Each slide is a single image so marketing owns the design end-to-end."
        status="new"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add information-banner`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`<InformationBanner
  slides={[
    { id: "a", image: "/banners/holiday.png", alt: "Holiday promo", href: "/promos/holiday" },
    { id: "b", image: "/banners/referral.png", alt: "Referral promo", href: "/refer" },
  ]}
/>`}
        />
      </DocsSection>

      <DocsSection title="Live: 3 slides auto-advance">
        <DocsExample
          title="Hover to pause"
          preview={
            <div className="w-full max-w-3xl px-4">
              <InformationBanner slides={SLIDES} autoMs={4000} />
            </div>
          }
          code={`<InformationBanner slides={SLIDES} autoMs={4000} />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "slides", type: "Slide[]", description: "Array of { id, image, alt, href? }. Single-image-per-slide is the contract — marketing bakes copy into the PNG." },
            { name: "autoMs", type: "number", defaultValue: "6000", description: "Auto-advance interval. Set to 0 to disable." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Viewport (overflow-hidden, rounded-2xl) — clips the slide track.</li>
          <li>Slide track — flex row, transform: translateX based on active index.</li>
          <li>Pill indicators — active pill widens 2 → 6 via transition-all.</li>
          <li>Arrow buttons — overhang outside the viewport (-left/-right -4).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
