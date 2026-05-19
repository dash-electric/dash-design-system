"use client"

import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Hint } from "@/registry/dash/ui/hint"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function HintDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Form"
        title="Hint"
        description="Inline helper text below form fields — instructions, validation messages, success confirmations. 5 tones map to the same state colors as Alert."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hint`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Field with helper hint"
          preview={
            <div className="space-y-1.5 max-w-sm">
              <Label htmlFor="phone">No HP mitra</Label>
              <InputRoot><Input id="phone" placeholder="0812-…" /></InputRoot>
              <Hint>Format Indonesia 10-13 digit. Akan dipakai untuk verifikasi OTP.</Hint>
            </div>
          }
          code={`<Label htmlFor="phone">No HP mitra</Label>
<InputRoot><Input id="phone" /></InputRoot>
<Hint>Format Indonesia 10-13 digit.</Hint>`}
        />

        <DocsExample
          title="Validation tones"
          preview={
            <div className="space-y-3 max-w-sm">
              <Hint tone="error">No HP belum terdaftar di sistem KYC.</Hint>
              <Hint tone="warning">Mitra punya 2 dispatch terlewat hari ini.</Hint>
              <Hint tone="success">Verifikasi OTP berhasil.</Hint>
              <Hint tone="information">Tabel akan refresh otomatis setiap 30 detik.</Hint>
              <Hint tone="neutral">Anda dapat mengedit kapan saja sebelum submit.</Hint>
            </div>
          }
          code={`<Hint tone="error">No HP belum terdaftar di sistem KYC.</Hint>
<Hint tone="warning">Mitra punya 2 dispatch terlewat hari ini.</Hint>
<Hint tone="success">Verifikasi OTP berhasil.</Hint>
<Hint tone="information">Tabel akan refresh otomatis setiap 30 detik.</Hint>
<Hint tone="neutral">Anda dapat mengedit kapan saja sebelum submit.</Hint>`}
        />

        <DocsExample
          title="Without icon"
          preview={<Hint hideIcon>Helper tanpa icon untuk denser layout.</Hint>}
          code={`<Hint hideIcon>Helper tanpa icon.</Hint>`}
        />

        <DocsExample
          title="Tied to an invalid input"
          preview={
            <div className="space-y-1.5 max-w-sm">
              <Label htmlFor="bad-email">Email</Label>
              <InputRoot invalid><Input id="bad-email" defaultValue="not-an-email" aria-describedby="email-hint" /></InputRoot>
              <Hint id="email-hint" tone="error">Format email tidak valid.</Hint>
            </div>
          }
          code={`<Label htmlFor="email">Email</Label>
<InputRoot invalid>
  <Input id="email" aria-describedby="email-hint" />
</InputRoot>
<Hint id="email-hint" tone="error">Format email tidak valid.</Hint>`}
        />

        <DocsExample
          title="In a Card footer"
          description="Hint also works as a quiet inline status — pair with a control change."
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 max-w-sm">
              <div className="text-sm font-medium mb-1">Auto-suspend setting saved</div>
              <Hint tone="success">Diaktifkan 2 menit lalu untuk Reservasi tribe.</Hint>
            </div>
          }
          code={`<div className="rounded-xl border p-4">
  <div>Auto-suspend setting saved</div>
  <Hint tone="success">Diaktifkan 2 menit lalu untuk Reservasi tribe.</Hint>
</div>`}
        />

        <DocsExample
          title="Multi-line"
          preview={
            <Hint tone="warning" className="max-w-sm">
              Mitra ini punya 2 dispatch terlewat hari ini. Sekali lagi dan auto-suspend akan
              menyala otomatis untuk sisa hari ini sampai 04:00 besok.
            </Hint>
          }
          code={`<Hint tone="warning">
  Mitra ini punya 2 dispatch terlewat hari ini. Sekali lagi dan auto-suspend akan
  menyala otomatis untuk sisa hari ini sampai 04:00 besok.
</Hint>`}
        />
      </DocsSection>

      <DocsSection title="When to use vs Alert">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Hint</strong> — quiet inline helper or per-field validation. Single line preferred.</li>
          <li>• <strong>Alert</strong> — page or section-level. The user must read it before continuing.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "tone", type: '"neutral" | "success" | "warning" | "error" | "information"', defaultValue: '"neutral"', description: "State color + leading icon." },
            { name: "hideIcon", type: "boolean", description: "Hide leading icon for compact rows." },
            { name: "id", type: "string", description: "Pair with aria-describedby on the linked control." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role mapping</strong>
            <ul className="ml-5 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li><code className="text-xs">tone=&quot;error&quot;</code> renders <code className="text-xs">role=&quot;alert&quot;</code> + <code className="text-xs">aria-live=&quot;assertive&quot;</code>.</li>
              <li>Other tones render plain text — link via <code className="text-xs">aria-describedby</code> for SR announcement when the related field gains focus.</li>
            </ul>
          </li>
          <li>• <strong>Pairing with controls</strong> — pass <code className="text-xs">id</code> on Hint, <code className="text-xs">aria-describedby</code> on the input. Form auto-handles this; with bare Field/Input you must wire it manually.</li>
          <li>• <strong>Icon</strong> — leading icon is <code className="text-xs">aria-hidden</code>. Meaning lives in the text + tone color (but never tone alone — copy must clearly state the issue).</li>
          <li>• <strong>Reduced motion</strong> — no motion. Color transition is instant.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
