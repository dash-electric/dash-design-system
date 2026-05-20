"use client"

import { RiKey2Line as KeyRound, RiStarLine as Star, RiFireLine as Flame, RiShieldCheckLine as ShieldCheck } from "@remixicon/react"
import { BrandMark } from "@/registry/dash/ui/brand-mark"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function BrandMarkDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="specialized"
        category="Components / Visual"
        title="Brand Mark"
        description="Header element used at the top of auth blocks. Two canonical shapes: 56×56 round filled with brand colour (Aurora/Solaris/Phoenix/Apex) or 96×96 rounded-square neutral surface holding a single lucide icon (Key/Mail/ShieldCheck)."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add brand-mark`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Round, primary tone (Aurora pattern)"
          description="Default 56×56 round mark filled with the primary colour."
          preview={
            <div className="flex items-center justify-center min-h-[140px]">
              <BrandMark size="md" shape="round" tone="primary">
                <Star className="fill-static-white" />
              </BrandMark>
            </div>
          }
          code={`<BrandMark size="md" shape="round" tone="primary"><Star /></BrandMark>`}
        />
        <DocsExample
          title="Round, custom tone (Solaris / Phoenix / Apex)"
          description="Pass tone='custom' and override the bg via className."
          preview={
            <div className="flex items-center justify-center gap-6 min-h-[140px]">
              <BrandMark
                shape="round"
                tone="custom"
                className="bg-error-base text-static-white"
              >
                <Flame className="fill-static-white" />
              </BrandMark>
              <BrandMark
                shape="round"
                tone="custom"
                className="bg-warning-base text-static-white"
              >
                <Star className="fill-static-white" />
              </BrandMark>
            </div>
          }
          code={`<BrandMark tone="custom" className="bg-error-base text-static-white">
  <Flame />
</BrandMark>`}
        />
        <DocsExample
          title="Square, neutral tone (Key icon pattern)"
          description="96×96 rounded-square with neutral surface — used for Login / Register / Reset / Verify Key variants."
          preview={
            <div className="flex items-center justify-center gap-6 min-h-[160px]">
              <BrandMark size="lg" shape="square" tone="neutral">
                <KeyRound strokeWidth={1.5} />
              </BrandMark>
              <BrandMark size="lg" shape="square" tone="neutral">
                <ShieldCheck strokeWidth={1.5} />
              </BrandMark>
            </div>
          }
          code={`<BrandMark size="lg" shape="square" tone="neutral"><KeyRound /></BrandMark>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          BrandMark hidup di header auth screen. Satu icon, satu shape, contrast cukup terhadap latar. Jangan dijadikan general icon container atau tone palette acak.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <BrandMark size="lg" shape="square" tone="neutral">
                <KeyRound strokeWidth={1.5} />
              </BrandMark>
            ),
            caption: "Reset password screen pakai Key icon, neutral tile 96×96. Konsisten dengan auth flow Dash lainnya.",
          }}
          dont={{
            preview: (
              <BrandMark size="lg" shape="square" tone="custom" className="bg-warning-base text-static-white">
                <Star className="fill-static-white" />
              </BrandMark>
            ),
            caption: "Jangan pakai BrandMark sebagai random icon container di dashboard. BrandMark = auth-screen identity, bukan generic decoration.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <BrandMark size="md" shape="round" tone="primary">
                <ShieldCheck className="fill-static-white" />
              </BrandMark>
            ),
            caption: "Round 56×56 + primary fill untuk verification success screen. Contrast white icon di primary base passes 3:1.",
          }}
          dont={{
            preview: (
              <BrandMark shape="round" tone="custom" className="bg-bg-weak-50 text-text-soft-400">
                <ShieldCheck />
              </BrandMark>
            ),
            caption: "Tone custom dengan bg lemah + icon soft = contrast <3:1 gagal WCAG 1.4.11. Selalu verifikasi pair fg/bg saat tone='custom'.",
          }}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          A single styled element. Pass exactly one lucide icon (or short glyph) as the only child — the wrapper handles the surface (fill colour or neutral tile), border-radius shape (round vs squircle), and intrinsic size. No header text, no badge, no nested layout. If you need title + subtitle below the mark, use the Empty State or Auth header pattern instead.
        </p>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "shape",
              type: `"round" | "square"`,
              defaultValue: `"round"`,
              description: "Circular brand mark or rounded-square key tile.",
            },
            {
              name: "size",
              type: `"sm" | "md" | "lg"`,
              defaultValue: `"md"`,
              description: "40 / 56 / 96 px square.",
            },
            {
              name: "tone",
              type: `"primary" | "neutral" | "custom"`,
              defaultValue: `"primary"`,
              description:
                "Primary = brand fill, neutral = bg-weak surface + stroke, custom = consumer styles bg via className.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-3 text-base text-text-sub-600 leading-relaxed">
          <li><strong className="text-text-strong-950">Role</strong> — Brand Mark is decorative by default. The wrapping element has no implicit role; the icon child carries <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-hidden</code> so it is skipped by screen readers.</li>
          <li><strong className="text-text-strong-950">Pair with a heading</strong> — in auth flows the mark always sits above a real <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<h1>`}</code> / <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<h2>`}</code> that names the screen. The icon is reinforcement, not the only signal.</li>
          <li><strong className="text-text-strong-950">Custom tone contrast</strong> — when <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">tone=&quot;custom&quot;</code>, verify the icon colour passes 3:1 against the new background for non-text content (WCAG 1.4.11).</li>
          <li><strong className="text-text-strong-950">Standalone use</strong> — if you ever surface a Brand Mark without an accompanying label (e.g. inside a circular avatar slot), wrap it in a labelled element such as <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<span role="img" aria-label="Dash">`}</code>.</li>
          <li><strong className="text-text-strong-950">Reduced motion</strong> — no entrance animation by default. Any consumer-added animation should respect <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
