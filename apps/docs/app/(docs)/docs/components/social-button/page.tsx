"use client"

import { SocialButton } from "@/registry/dash/ui/social-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SocialButtonDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="specialized"
        category="Components / Actions"
        title="Social Button"
        description="Branded sign-in / continue-with button for OAuth providers. Auto-fills label and brand icon. Override label for non-English copy."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add social-button`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="All brands"
          preview={
            <div className="flex flex-col gap-2 max-w-xs w-full">
              <SocialButton brand="google" block />
              <SocialButton brand="apple" block />
              <SocialButton brand="github" block />
              <SocialButton brand="facebook" block />
              <SocialButton brand="microsoft" block />
            </div>
          }
          code={`<SocialButton brand="google" block />
<SocialButton brand="apple" block />
<SocialButton brand="github" block />
<SocialButton brand="facebook" block />
<SocialButton brand="microsoft" block />`}
        />

        <DocsExample
          title="Sizes"
          preview={
            <div className="flex items-center gap-2">
              <SocialButton brand="google" size="sm" />
              <SocialButton brand="google" size="md" />
              <SocialButton brand="google" size="lg" />
              <SocialButton brand="google" size="xl" />
            </div>
          }
          code={`<SocialButton brand="google" size="sm" />
<SocialButton brand="google" size="md" />
<SocialButton brand="google" size="lg" />
<SocialButton brand="google" size="xl" />`}
        />

        <DocsExample
          title="Custom label"
          preview={<SocialButton brand="google" label="Masuk dengan Google" />}
          code={`<SocialButton brand="google" label="Masuk dengan Google" />`}
        />
      </DocsSection>

      <DocsSection title="Sign-in card">
        <DocsExample
          title="Combined provider list"
          description="Standard Dash auth card. Google primary; OS-specific second; fallback OAuth providers below."
          preview={
            <div className="flex flex-col gap-2 max-w-xs w-full rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <h3 className="font-semibold text-text-strong-950">Masuk ke Halo-dash</h3>
              <p className="text-xs text-text-sub-600 mb-3">Gunakan akun perusahaan.</p>
              <SocialButton brand="google" block label="Lanjut dengan Google" />
              <SocialButton brand="microsoft" block label="Lanjut dengan Microsoft" />
              <div className="my-2 flex items-center gap-2 text-xs text-text-soft-400">
                <span className="flex-1 h-px bg-stroke-soft-200" /> atau <span className="flex-1 h-px bg-stroke-soft-200" />
              </div>
              <SocialButton brand="github" block label="Lanjut dengan GitHub" />
            </div>
          }
          code={`<SocialButton brand="google" block label="Lanjut dengan Google" />
<SocialButton brand="microsoft" block label="Lanjut dengan Microsoft" />
<SocialButton brand="github" block label="Lanjut dengan GitHub" />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          SocialButton pakai brand color official + auto-label. Untuk Dash audience Indonesia, override label dengan 'Lanjut dengan X' atau 'Masuk dengan X'. Max 3 provider visible, sisanya hide di 'Show more'.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-col gap-2 max-w-xs w-full">
                <SocialButton brand="google" block label="Lanjut dengan Google" />
                <SocialButton brand="microsoft" block label="Lanjut dengan Microsoft" />
              </div>
            ),
            caption: "2 provider primary (Google + Microsoft untuk corporate audience). Label Bahasa Indonesia 'Lanjut dengan X' konsisten dengan auth flow Dash.",
          }}
          dont={{
            preview: (
              <div className="flex flex-col gap-1 max-w-xs">
                <SocialButton brand="google" block />
                <SocialButton brand="apple" block />
                <SocialButton brand="github" block />
                <SocialButton brand="facebook" block />
                <SocialButton brand="microsoft" block />
                <SocialButton brand="twitter" block />
              </div>
            ),
            caption: "6 provider tumpuk = decision paralysis. User butuh detik mana yang familiar. Max 3 primary, sisanya collapse.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <SocialButton brand="google" block size="md" label="Lanjut dengan Google" />
            ),
            caption: "Size md = default auth screen. Block (full-width) supaya parity dengan submit button utama di card.",
          }}
          dont={{
            preview: (
              <SocialButton brand="google" size="sm" label="g" />
            ),
            caption: "Label cuma 'g' atau 1 huruf = brand awareness lemah. Selalu sertakan nama provider supaya user tahu masuk via apa.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "brand", type: '"google" | "apple" | "github" | "facebook" | "twitter" | "microsoft"', defaultValue: '"google"', description: "OAuth provider — picks icon + colors." },
            { name: "size", type: '"sm" | "md" | "lg" | "xl"', defaultValue: '"md"', description: "Height preset." },
            { name: "block", type: "boolean", defaultValue: "false", description: "Stretch to container width." },
            { name: "label", type: "ReactNode", description: "Override auto label." },
            { name: "disabled", type: "boolean", description: "Disable." },
            { name: "onClick", type: "() => void", description: "Click handler — usually triggers OAuth redirect." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Native <code className="text-xs">&lt;button&gt;</code> with brand-specific colors + inline-SVG provider logo.</li>
          <li>• Auto label format: &ldquo;Continue with X&rdquo; — override with localized copy via <code className="text-xs">label</code> prop.</li>
          <li>• Apple / GitHub render dark; Google / Microsoft / Twitter render light; Facebook renders brand blue.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Renders <code className="text-xs">&lt;button type=&quot;button&quot;&gt;</code> — does not submit forms by accident.</li>
          <li>• Brand SVGs marked <code className="text-xs">aria-hidden</code>; visible label text is the accessible name.</li>
          <li>• Focus ring honors <code className="text-xs">ring-ring</code> token — do not strip <code className="text-xs">focus-visible</code>.</li>
          <li>• When used to trigger an OAuth redirect, the button should not stay focused after click — let the browser navigate naturally.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
