"use client"

import { useState } from "react"
import { RiArrowDownSLine as ChevronDown } from "@remixicon/react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/registry/dash/ui/collapsible"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function CollapsibleDocsPage() {
  const [open, setOpen] = useState(true)
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Layout"
        title="Collapsible"
        description="Single-section show/hide built on Radix Collapsible. For multi-section grouped expand/collapse use Accordion."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add collapsible`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Three Radix parts. <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">Collapsible</code> (root) owns open/closed state. <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">CollapsibleTrigger</code> is the toggle — typically a Button or row wrapped via <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">asChild</code>. <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">CollapsibleContent</code> is the disclosable region (animated height + opacity). For multi-section groups where only one is open at a time, reach for Accordion instead.
        </p>
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Filter advanced row"
          preview={
            <div className="w-full max-w-md">
              <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                  <Button tone="neutral" style="stroke" className="w-full justify-between">
                    Filter lanjutan (radius, jam dispatch, tribe co-occurrence)
                    <ChevronDown
                      strokeWidth={1.75}
                      className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 mt-2">
                  <div className="text-sm text-text-sub-600">Radius dispatch (km)</div>
                  <div className="text-sm text-text-sub-600">Jam aktif</div>
                  <div className="text-sm text-text-sub-600">Tribe overlap</div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          }
          code={`<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleTrigger asChild>
    <Button>Filter lanjutan</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`}
        />

        <DocsExample
          title="Audit log details (uncontrolled)"
          preview={
            <Collapsible defaultOpen={false} className="w-full max-w-md">
              <CollapsibleTrigger asChild>
                <Button tone="neutral" style="ghost" size="sm">
                  Lihat 8 perubahan terakhir
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs text-text-sub-600">
                <div>14:02 · status: active → suspended</div>
                <div>13:51 · tribe: Express → Reservasi</div>
                <div>13:44 · city: Bekasi → Tangerang</div>
                <div>13:30 · suspended_reason added</div>
                <div>12:58 · KYC re-verified</div>
              </CollapsibleContent>
            </Collapsible>
          }
          code={`<Collapsible defaultOpen={false}>
  <CollapsibleTrigger asChild>
    <Button style="ghost" size="sm">Lihat perubahan</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`}
        />

        <DocsExample
          title="Show more text (read-more pattern)"
          preview={
            <Collapsible className="w-full max-w-md text-sm text-text-strong-950/90">
              <p>
                Mitra Sigit P. (Reservasi · Bekasi) telah aktif sejak Juli 2025 dengan total 142 trip.
                Rating rata-rata 4.8/5.{" "}
                <CollapsibleTrigger className="text-(--dash-purple-600) hover:underline">
                  Selengkapnya…
                </CollapsibleTrigger>
              </p>
              <CollapsibleContent className="mt-2 text-text-sub-600">
                <p>
                  Total kompensasi YTD Rp 18.420.000. Suspension history kosong. Compliance check
                  terakhir lulus 2026-04-12. STNK + SIM B verified, KYC v3.1 (terbaru).
                </p>
              </CollapsibleContent>
            </Collapsible>
          }
          code={`<Collapsible>
  <p>
    Mitra Sigit P. aktif sejak Juli 2025 …
    <CollapsibleTrigger>Selengkapnya…</CollapsibleTrigger>
  </p>
  <CollapsibleContent>
    <p>Detail lengkap…</p>
  </CollapsibleContent>
</Collapsible>`}
        />

        <DocsExample
          title="Disabled state"
          preview={
            <Collapsible disabled className="w-full max-w-md">
              <CollapsibleTrigger asChild>
                <Button tone="neutral" style="stroke" disabled>
                  Detail terkunci — pending review
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>…</CollapsibleContent>
            </Collapsible>
          }
          code={`<Collapsible disabled>
  <CollapsibleTrigger asChild>
    <Button disabled>Detail terkunci</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`}
        />
      </DocsSection>

      <DocsSection title="When to use vs Accordion">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Collapsible</strong> — single isolated section. Used inline, no enforced single/multiple semantics.</li>
          <li>• <strong>Accordion</strong> — grouped sections where you want single-open or multi-open coordination.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "open", type: "boolean", description: "Controlled open state." },
            { name: "defaultOpen", type: "boolean", description: "Uncontrolled initial state." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Fired on state change." },
            { name: "disabled", type: "boolean", description: "Disable toggle." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <p className="text-sm text-text-sub-600">Built on <a href="https://www.radix-ui.com/primitives/docs/components/collapsible" target="_blank" rel="noreferrer" className="underline">Radix Collapsible</a>.</p>
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — Trigger renders a real <code className="text-xs">button</code> with <code className="text-xs">aria-expanded</code> + <code className="text-xs">aria-controls</code> auto-wired to content.</li>
          <li>• <strong>Keyboard</strong>
            <ul className="ml-5 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li><code className="text-xs">Tab</code> moves focus to the trigger.</li>
              <li><code className="text-xs">Space</code> / <code className="text-xs">Enter</code> toggles the content.</li>
            </ul>
          </li>
          <li>• <strong>ARIA you add</strong> — none required. If the trigger is icon-only, add <code className="text-xs">aria-label</code>.</li>
          <li>• <strong>Reduced motion</strong> — height animation is CSS-only, respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
