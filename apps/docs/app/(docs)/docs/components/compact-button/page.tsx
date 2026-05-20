"use client"

import { RiCloseLine as X, RiAddLine as Plus, RiArrowDownSLine as ChevronDown } from "@remixicon/react"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function CompactButtonDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="atom"
        category="Components / Actions"
        title="Compact Button"
        description="Mini icon button (20-24px) for close, dismiss, in-cell row action. Smaller than IconButton — use when a regular 28-44px hit area would dominate the surrounding UI. Figma node 189:3646."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add compact-button`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          A square{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<button>`}</code>{" "}
          at 20px (Medium) or 24px (Large). Four visual modes: <strong>stroke</strong>{" "}
          (white card + soft ring), <strong>ghost</strong> (transparent + faded icon),{" "}
          <strong>white</strong> (filled dark + white icon), and <strong>modifiable</strong>{" "}
          (escape hatch — bring your own bg/color). Pair with one Remix icon child; sizing
          is enforced via <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">[&_svg]</code> rules.
          An <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-label</code>{" "}
          prop is required.
        </p>
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Variants × size"
          preview={
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <CompactButton variant="stroke" size="sm" aria-label="Close"><X /></CompactButton>
                <CompactButton variant="ghost" size="sm" aria-label="Close"><X /></CompactButton>
                <CompactButton variant="white" size="sm" aria-label="Close"><X /></CompactButton>
                <span className="text-xs text-text-soft-400 ml-2">size sm (20px)</span>
              </div>
              <div className="flex items-center gap-3">
                <CompactButton variant="stroke" size="md" aria-label="Close"><X /></CompactButton>
                <CompactButton variant="ghost" size="md" aria-label="Close"><X /></CompactButton>
                <CompactButton variant="white" size="md" aria-label="Close"><X /></CompactButton>
                <span className="text-xs text-text-soft-400 ml-2">size md (24px) — default</span>
              </div>
            </div>
          }
          code={`<CompactButton variant="stroke" aria-label="Close"><X /></CompactButton>
<CompactButton variant="ghost" aria-label="Close"><X /></CompactButton>
<CompactButton variant="white" aria-label="Close"><X /></CompactButton>`}
        />

        <DocsExample
          title="Full radius (pill)"
          preview={
            <div className="flex items-center gap-3">
              <CompactButton variant="stroke" fullRadius aria-label="Close"><X /></CompactButton>
              <CompactButton variant="ghost" fullRadius aria-label="Close"><X /></CompactButton>
              <CompactButton variant="white" fullRadius aria-label="Close"><X /></CompactButton>
            </div>
          }
          code={`<CompactButton variant="stroke" fullRadius aria-label="Close"><X /></CompactButton>`}
        />

        <DocsExample
          title="Disabled"
          preview={
            <div className="flex items-center gap-3">
              <CompactButton variant="stroke" disabled aria-label="Close"><X /></CompactButton>
              <CompactButton variant="ghost" disabled aria-label="Close"><X /></CompactButton>
              <CompactButton variant="white" disabled aria-label="Close"><X /></CompactButton>
            </div>
          }
          code={`<CompactButton variant="stroke" disabled aria-label="Close"><X /></CompactButton>`}
        />

        <DocsExample
          title="In context — toast dismiss"
          preview={
            <div className="flex items-center justify-between gap-3 rounded-lg bg-bg-strong-950 text-static-white px-4 py-3 max-w-md shadow-lg">
              <span className="text-sm">Trip created successfully</span>
              <CompactButton variant="white" size="sm" aria-label="Dismiss"><X /></CompactButton>
            </div>
          }
          code={`<div className="toast">
  <span>Trip created successfully</span>
  <CompactButton variant="white" size="sm" aria-label="Dismiss"><X /></CompactButton>
</div>`}
        />

        <DocsExample
          title="In context — list row inline action"
          preview={
            <div className="flex items-center justify-between gap-3 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 max-w-md">
              <span className="text-sm text-text-strong-950">Filter: status=active</span>
              <div className="flex items-center gap-1">
                <CompactButton variant="ghost" size="sm" aria-label="Edit filter"><ChevronDown /></CompactButton>
                <CompactButton variant="ghost" size="sm" aria-label="Remove filter"><X /></CompactButton>
              </div>
            </div>
          }
          code={`<CompactButton variant="ghost" size="sm" aria-label="Remove filter"><X /></CompactButton>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          CompactButton 20-24px untuk dismiss, in-cell action, filter chip remove. Bukan untuk primary CTA. Kalau aksi penting (Suspend, Konfirmasi), pakai Button atau IconButton.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center justify-between gap-3 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 max-w-md">
                <span className="text-xs text-text-strong-950">tribe=Express · kota=Bekasi</span>
                <CompactButton variant="ghost" size="sm" aria-label="Hapus filter"><X /></CompactButton>
              </div>
            ),
            caption: "Filter chip remove pakai ghost compact button. 20px hit area cukup untuk dismiss tanpa dominasi visual.",
          }}
          dont={{
            preview: (
              <CompactButton variant="stroke" size="md" aria-label="Suspend mitra"><X /></CompactButton>
            ),
            caption: "Suspend mitra adalah destructive primary action — wajib pakai Button tone='destructive' dengan label teks, bukan compact icon yang ambigu.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-bg-strong-950 text-static-white px-4 py-2.5 max-w-xs">
                <span className="text-xs">Delivery DLV-7821 dibuat</span>
                <CompactButton variant="white" size="sm" aria-label="Tutup notifikasi"><X /></CompactButton>
              </div>
            ),
            caption: "Toast dismiss pakai variant='white' di latar gelap. Kontras tinggi, hit area kecil, tidak mengganggu pesan.",
          }}
          dont={{
            preview: (
              <div className="flex items-center justify-between gap-3 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 max-w-md">
                <span className="text-xs">Konfirmasi suspend mtr-9412?</span>
                <CompactButton variant="stroke" size="sm" aria-label="Konfirmasi"><Plus /></CompactButton>
              </div>
            ),
            caption: "Compact icon (+) untuk konfirmasi destructive = user tidak yakin button itu apa. Confirmation harus pakai Button dengan label jelas.",
          }}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-base text-text-sub-600 leading-relaxed space-y-2 list-disc pl-5 max-w-2xl">
          <li><strong>CompactButton</strong> (20-24px): toast close, popover close, sticker dismiss, data-cell inline action, filter chip dismiss.</li>
          <li><strong>IconButton</strong> (28-44px): toolbar, table row action, header utility, modal close.</li>
          <li>Never substitute one for the other — the size difference is part of the visual language.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "variant", type: '"stroke" | "ghost" | "white" | "modifiable"', defaultValue: '"ghost"', description: "Visual mode. modifiable strips all styling so the consumer can paint it." },
            { name: "size", type: '"sm" | "md"', defaultValue: '"md"', description: "sm = 20×20 (Figma Medium), md = 24×24 (Figma Large)." },
            { name: "fullRadius", type: "boolean", defaultValue: "false", description: "Pill (rounded-full) instead of 6px radius." },
            { name: "asChild", type: "boolean", defaultValue: "false", description: "Render as the child component (Radix Slot)." },
            { name: "aria-label", type: "string", defaultValue: "required", description: "Accessible label. Required since CompactButton has no visible text." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
