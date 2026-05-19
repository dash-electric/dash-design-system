"use client"

import { RiArrowRightUpLine as ArrowUpRight, RiArrowLeftLine as ArrowLeft } from "@remixicon/react"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function LinkButtonDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Actions"
        title="Link Button"
        description="Inline anchor styled as a button-like link. For primary page actions use Button; LinkButton is for inline call-outs, breadcrumbs back, footer secondary nav, and table-row drill-ins."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add link-button`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Single component. Renders an <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<a>`}</code> by default, or any element via <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">asChild</code> (compose with Next.js <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">Link</code> for client routing). Inline children are treated as the label — leading or trailing lucide icons auto-size via the same icon rule as Button.
        </p>
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import Link from "next/link"
import { LinkButton } from "@/registry/dash/ui/link-button"

<LinkButton href="/mitra/9412">Lihat detail mitra</LinkButton>

// Compose with Next/Link for client routing
<LinkButton asChild>
  <Link href="/mitra/9412">Lihat detail mitra</Link>
</LinkButton>`}
        />
      </DocsSection>

      <DocsSection title="Examples" description="Tones, sizes, icon pairings, and Dash domain copy.">
        <DocsExample
          title="Tones"
          preview={
            <div className="flex flex-wrap items-center gap-4">
              <LinkButton href="#">Lihat detail mitra</LinkButton>
              <LinkButton href="#" tone="neutral">Edit dispatch</LinkButton>
              <LinkButton href="#" tone="muted">Pelajari lebih lanjut</LinkButton>
              <LinkButton href="#" tone="destructive">Suspend permanen</LinkButton>
            </div>
          }
          code={`<LinkButton href="/mitra/9412">Lihat detail mitra</LinkButton>
<LinkButton href="#" tone="neutral">Edit dispatch</LinkButton>
<LinkButton href="#" tone="muted">Pelajari lebih lanjut</LinkButton>
<LinkButton href="#" tone="destructive">Suspend permanen</LinkButton>`}
        />

        <DocsExample
          title="Sizes"
          preview={
            <div className="flex items-baseline gap-4">
              <LinkButton href="#" size="sm">Small</LinkButton>
              <LinkButton href="#" size="md">Medium</LinkButton>
              <LinkButton href="#" size="lg">Large</LinkButton>
            </div>
          }
          code={`<LinkButton size="sm">Small</LinkButton>
<LinkButton size="md">Medium</LinkButton>
<LinkButton size="lg">Large</LinkButton>`}
        />

        <DocsExample
          title="Underline behaviour"
          preview={
            <div className="flex flex-wrap items-center gap-4">
              <LinkButton href="#" underline="always">Always underlined</LinkButton>
              <LinkButton href="#" underline="hover">Underline on hover</LinkButton>
              <LinkButton href="#" underline="none">No underline</LinkButton>
            </div>
          }
          code={`<LinkButton underline="always">Always underlined</LinkButton>
<LinkButton underline="hover">Underline on hover</LinkButton>
<LinkButton underline="none">No underline</LinkButton>`}
        />

        <DocsExample
          title="With trailing icon"
          description="External / drill-in icon. Use ArrowUpRight for outbound, ArrowRight for in-app nav."
          preview={
            <div className="flex flex-wrap items-center gap-4">
              <LinkButton href="#" underline="none">
                Open dashboard
                <ArrowUpRight className="size-3.5" strokeWidth={2} />
              </LinkButton>
              <LinkButton href="#" tone="muted" underline="none">
                <ArrowLeft className="size-3.5" strokeWidth={2} />
                Kembali ke daftar mitra
              </LinkButton>
            </div>
          }
          code={`<LinkButton href="#" underline="none">
  Open dashboard
  <ArrowUpRight className="size-3.5" />
</LinkButton>

<LinkButton href="#" tone="muted" underline="none">
  <ArrowLeft className="size-3.5" />
  Kembali ke daftar mitra
</LinkButton>`}
        />

        <DocsExample
          title="Inline in a paragraph"
          preview={
            <p className="text-sm text-text-sub-600 max-w-md leading-relaxed">
              Mitra ini sudah lewat 3 dispatch hari ini. Lihat <LinkButton href="#">riwayat dispatch lengkap</LinkButton> atau <LinkButton href="#" tone="destructive">suspend sekarang</LinkButton>.
            </p>
          }
          code={`<p>
  Mitra ini sudah lewat 3 dispatch hari ini.{" "}
  <LinkButton href="#">riwayat dispatch lengkap</LinkButton> atau{" "}
  <LinkButton href="#" tone="destructive">suspend sekarang</LinkButton>.
</p>`}
        />

        <DocsExample
          title="Disabled"
          preview={
            <LinkButton href="#" aria-disabled tabIndex={-1} className="opacity-50 pointer-events-none">
              Surge controls (locked)
            </LinkButton>
          }
          code={`<LinkButton aria-disabled tabIndex={-1} className="opacity-50 pointer-events-none">
  Surge controls (locked)
</LinkButton>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "tone", type: '"primary" | "neutral" | "muted" | "destructive"', defaultValue: '"primary"', description: "Foreground color." },
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Font size preset." },
            { name: "underline", type: '"always" | "hover" | "none"', defaultValue: '"hover"', description: "Underline behaviour." },
            { name: "asChild", type: "boolean", defaultValue: "false", description: "Wrap Next/Link or another anchor via Radix Slot — child receives the styles." },
            { name: "href", type: "string", description: "Standard anchor href when not using asChild." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Renders a real <code className="text-xs">&lt;a&gt;</code> element — gets browser link semantics (visited state, right-click, keyboard activation).</li>
          <li>• Underline-on-hover is the default; do not remove underlines for inline-paragraph use (WCAG 1.4.1 colour-alone fails).</li>
          <li>• When destructive, pair with a confirmation Modal — link clicks should not be silently irreversible.</li>
          <li>• Visible focus ring on <code className="text-xs">Tab</code> — do not remove via <code className="text-xs">focus:outline-none</code>.</li>
          <li>• For outbound links, add <code className="text-xs">rel=&quot;noopener noreferrer&quot;</code> + <code className="text-xs">target=&quot;_blank&quot;</code> + a trailing <code className="text-xs">ArrowUpRight</code> glyph so the destination is clear.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
