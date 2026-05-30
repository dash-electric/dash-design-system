"use client"

import { RiRocket2Line as Rocket, RiSparkling2Line as Sparkles } from "@remixicon/react"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function FancyButtonDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="specialized"
        category="Components / Actions"
        title="Fancy Button"
        description="Gradient + lifted shadow + inner ring. Use for marketing hero CTA, paywall upgrade, &quot;launch the rocket&quot; moments. For everyday actions use Button."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add fancy-button`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Tones"
          preview={
            <div className="flex flex-wrap gap-3">
              <FancyButton tone="primary"><Sparkles /> Upgrade Pro</FancyButton>
              <FancyButton tone="neutral">Coba 14 hari gratis</FancyButton>
              <FancyButton tone="stroke">Aktifkan sekarang</FancyButton>
              <FancyButton tone="destructive">Hapus semua data</FancyButton>
            </div>
          }
          code={`<FancyButton tone="primary"><Sparkles /> Upgrade Pro</FancyButton>
<FancyButton tone="neutral">Coba 14 hari gratis</FancyButton>
<FancyButton tone="stroke">Aktifkan sekarang</FancyButton>
<FancyButton tone="destructive">Hapus semua data</FancyButton>`}
        />

        <DocsExample
          title="Sizes"
          preview={
            <div className="flex items-center gap-3">
              <FancyButton size="sm">Small</FancyButton>
              <FancyButton size="md">Medium</FancyButton>
              <FancyButton size="lg">Large</FancyButton>
              <FancyButton size="xl"><Rocket /> Extra Large</FancyButton>
            </div>
          }
          code={`<FancyButton size="sm">Small</FancyButton>
<FancyButton size="md">Medium</FancyButton>
<FancyButton size="lg">Large</FancyButton>
<FancyButton size="xl"><Rocket /> Extra Large</FancyButton>`}
        />

        <DocsExample
          title="Pricing card CTA"
          preview={
            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 max-w-xs space-y-3">
              <div className="text-xs uppercase tracking-wider text-text-soft-400">Halo-dash Pro</div>
              <div className="text-3xl font-semibold tracking-tighter">Rp 1.2jt<span className="text-base text-text-sub-600">/bln</span></div>
              <p className="text-sm text-text-sub-600">Unlimited tribes · audit log · 99.9% SLA</p>
              <FancyButton size="lg" tone="primary" className="w-full"><Sparkles /> Upgrade Pro</FancyButton>
            </div>
          }
          code={`<div className="rounded-2xl border p-5 space-y-3">
  <div>Halo-dash Pro</div>
  <div className="text-3xl">Rp 1.2jt/bln</div>
  <FancyButton size="lg" className="w-full">
    <Sparkles /> Upgrade Pro
  </FancyButton>
</div>`}
        />

        <DocsExample
          title="Empty-state hero CTA"
          preview={
            <div className="flex flex-col items-center gap-3 text-center max-w-md mx-auto">
              <div className="text-xl font-semibold tracking-tight">Belum ada dispatch hari ini</div>
              <p className="text-sm text-text-sub-600">Mulai tribe pertama untuk lihat dispatch real-time di sini.</p>
              <FancyButton tone="primary"><Rocket /> Mulai tribe pertama</FancyButton>
            </div>
          }
          code={`<EmptyState>
  <EmptyStateTitle>Belum ada dispatch hari ini</EmptyStateTitle>
  <EmptyStateActions>
    <FancyButton><Rocket /> Mulai tribe pertama</FancyButton>
  </EmptyStateActions>
</EmptyState>`}
        />

        <DocsExample
          title="Disabled state"
          preview={
            <div className="flex gap-3">
              <FancyButton disabled>Upgrade Pro</FancyButton>
              <FancyButton tone="stroke" disabled>Aktifkan</FancyButton>
            </div>
          }
          code={`<FancyButton disabled>Upgrade Pro</FancyButton>`}
        />

        <DocsExample
          title="As Next.js Link"
          preview={
            <div className="text-sm text-text-sub-600">
              Forward FancyButton styles to a Link without wrapping.
            </div>
          }
          code={`import Link from "next/link"

<FancyButton asChild>
  <Link href="/upgrade"><Sparkles /> Upgrade Pro</Link>
</FancyButton>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          FancyButton = momen hero. Satu per layar. Upgrade, launch, big yes. Bukan untuk aksi rutin (Save, Cancel) — itu Button biasa. Pakai berlebihan = fatigue, semua jadi noise.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 max-w-xs space-y-2 text-center">
                <div className="text-xs uppercase tracking-wider text-text-soft-400">Halo-dash Pro</div>
                <div className="text-xl font-semibold">Rp 1.2jt/bln</div>
                <FancyButton size="md" tone="primary" className="w-full"><Sparkles /> Upgrade sekarang</FancyButton>
              </div>
            ),
            caption: "Satu FancyButton di pricing card = jelas mana hero CTA. Upgrade adalah momen yang layak dirayakan visual.",
          }}
          dont={{
            preview: (
              <div className="flex flex-wrap gap-2 max-w-xs">
                <FancyButton size="sm">Save</FancyButton>
                <FancyButton size="sm">Cancel</FancyButton>
                <FancyButton size="sm">Delete</FancyButton>
                <FancyButton size="sm">Edit</FancyButton>
              </div>
            ),
            caption: "FancyButton untuk semua aksi rutin = hierarchy hancur. Save/Cancel/Edit pakai Button biasa, sisakan FancyButton untuk hero moment.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <FancyButton size="lg" tone="primary"><Rocket /> Launch tribe pertama</FancyButton>
            ),
            caption: "Empty state pertama kali user buka Halo-dash = momen 'mulai dari nol'. FancyButton menggiring user ke action critical.",
          }}
          dont={{
            preview: (
              <FancyButton tone="destructive">Suspend mtr-9412</FancyButton>
            ),
            caption: "Destructive action (suspend, hapus) tidak boleh dihias gradient + sparkle. Pakai Button tone='destructive' supaya weight visual match dengan beratnya consequence.",
          }}
        />
      </DocsSection>

      <DocsSection title="When to use vs Button">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>FancyButton</strong> — exactly one moment per surface where a hero gesture matters (upgrade, launch, big yes).</li>
          <li>• <strong>Button</strong> — everything else. FancyButton fatigue is real; pace it.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "tone", type: '"primary" | "info" | "success" | "destructive"', defaultValue: '"primary"', description: "Gradient palette." },
            { name: "size", type: '"sm" | "md" | "lg" | "xl"', defaultValue: '"md"', description: "Height preset." },
            { name: "asChild", type: "boolean", description: "Wrap consumer element via Radix Slot." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Drops gradient + lift, lowers opacity." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — native <code className="text-xs">button</code>. Inherits Button semantics.</li>
          <li>• <strong>Color contrast</strong> — all 4 tones pass WCAG AA with white text on the gradient surface. Tested across Dash light + dark mode.</li>
          <li>• <strong>Focus visible</strong> — inner ring is offset 2px so the focus halo never sits inside the gradient (which would reduce contrast).</li>
          <li>• <strong>Keyboard</strong> — <code className="text-xs">Tab</code> focus, <code className="text-xs">Enter</code> / <code className="text-xs">Space</code> activate.</li>
          <li>• <strong>Icon-only</strong> — REQUIRES <code className="text-xs">aria-label</code>; FancyButton without text is rare though — prefer a labelled CTA.</li>
          <li>• <strong>Reduced motion</strong> — hover lift + gradient shift respect <code className="text-xs">prefers-reduced-motion</code> (transitions still fire instantly so the click feedback survives).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
