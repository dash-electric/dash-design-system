"use client"

import { Field, FieldRow, FieldGroup, FieldDescription } from "@/registry/dash/ui/field"
import { Label } from "@/registry/dash/ui/label"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Switch } from "@/registry/dash/ui/switch"
import { Hint } from "@/registry/dash/ui/hint"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function FieldDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Form"
        title="Field"
        description="Lightweight form-row primitive without react-hook-form coupling. Use when wiring forms manually. For RHF integration use Form*."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add field`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Lightweight label / control / help wrapper for single inputs that don&apos;t live inside a full <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<Form>`}</code>. Compose <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">Field</code> (root) with <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">FieldLabel</code>, your control (Input, Select, Textarea, etc.), an optional <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">FieldDescription</code> for hint copy, and <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">FieldError</code> for validation messages. Field wires <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">htmlFor</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-describedby</code>, and <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-invalid</code> automatically.
        </p>
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Stacked field"
          preview={
            <Field className="max-w-sm">
              <Label htmlFor="phone">No HP mitra</Label>
              <InputRoot><Input id="phone" placeholder="0812-…" /></InputRoot>
              <FieldDescription>Akan dipakai untuk verifikasi OTP.</FieldDescription>
            </Field>
          }
          code={`<Field>
  <Label htmlFor="phone">No HP mitra</Label>
  <InputRoot><Input id="phone" /></InputRoot>
  <FieldDescription>…</FieldDescription>
</Field>`}
        />

        <DocsExample
          title="Inline row (switch)"
          preview={
            <FieldRow className="max-w-md">
              <div>
                <div className="text-sm font-medium text-text-strong-950">Auto-suspend</div>
                <FieldDescription>Mitra yang lewat 3 dispatch otomatis di-suspend 7 hari.</FieldDescription>
              </div>
              <Switch defaultChecked />
            </FieldRow>
          }
          code={`<FieldRow>
  <div>
    <div>Auto-suspend</div>
    <FieldDescription>…</FieldDescription>
  </div>
  <Switch defaultChecked />
</FieldRow>`}
        />

        <DocsExample
          title="Field group"
          preview={
            <FieldGroup className="max-w-md">
              <Field>
                <Label>Nama lengkap</Label>
                <InputRoot><Input defaultValue="Sigit Permana" /></InputRoot>
              </Field>
              <Field>
                <Label>Email</Label>
                <InputRoot><Input type="email" defaultValue="sigit@dash.id" /></InputRoot>
                <Hint tone="success">Email sudah terverifikasi.</Hint>
              </Field>
            </FieldGroup>
          }
          code={`<FieldGroup>
  <Field>…</Field>
  <Field>…</Field>
</FieldGroup>`}
        />

        <DocsExample
          title="Disabled field"
          preview={
            <Field className="max-w-sm">
              <Label htmlFor="locked">Mitra ID (locked)</Label>
              <InputRoot disabled><Input id="locked" defaultValue="mtr-9412" disabled /></InputRoot>
              <FieldDescription>Mitra ID tidak dapat diubah setelah KYC selesai.</FieldDescription>
            </Field>
          }
          code={`<Field>
  <Label htmlFor="locked">Mitra ID (locked)</Label>
  <InputRoot disabled><Input disabled /></InputRoot>
  <FieldDescription>Tidak dapat diubah.</FieldDescription>
</Field>`}
        />

        <DocsExample
          title="Invalid field with Hint"
          preview={
            <Field className="max-w-sm">
              <Label htmlFor="bad-phone">No HP mitra</Label>
              <InputRoot invalid><Input id="bad-phone" defaultValue="0812-abc" /></InputRoot>
              <Hint tone="error">Hanya angka. Format Indonesia 10-13 digit.</Hint>
            </Field>
          }
          code={`<Field>
  <Label htmlFor="phone">No HP mitra</Label>
  <InputRoot invalid><Input id="phone" /></InputRoot>
  <Hint tone="error">Hanya angka. Format Indonesia 10-13 digit.</Hint>
</Field>`}
        />

        <DocsExample
          title="Two-column FieldGroup"
          preview={
            <FieldGroup className="grid grid-cols-2 gap-3 max-w-lg">
              <Field>
                <Label>Nama depan</Label>
                <InputRoot><Input defaultValue="Sigit" /></InputRoot>
              </Field>
              <Field>
                <Label>Nama belakang</Label>
                <InputRoot><Input defaultValue="Permana" /></InputRoot>
              </Field>
              <Field className="col-span-2">
                <Label>Email</Label>
                <InputRoot><Input type="email" defaultValue="sigit@dash.id" /></InputRoot>
              </Field>
            </FieldGroup>
          }
          code={`<FieldGroup className="grid grid-cols-2 gap-3">
  <Field><Label>Nama depan</Label><InputRoot><Input /></InputRoot></Field>
  <Field><Label>Nama belakang</Label><InputRoot><Input /></InputRoot></Field>
  <Field className="col-span-2"><Label>Email</Label><InputRoot><Input /></InputRoot></Field>
</FieldGroup>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Label setiap field dengan kata yang dispatcher pakai sehari-hari, bukan dengan key kolom database.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs text-xs space-y-1">
                <div className="font-medium">Nomor handphone mitra</div>
                <div className="rounded border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5">+62 812-3456-7890</div>
                <div className="text-text-soft-400 text-[10px]">Format Indonesia, 10-13 digit</div>
              </div>
            ),
            caption: "Label natural Indonesia, format hint di bawah. Mitra paham langsung apa yang harus diisi.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs space-y-1">
                <div className="font-medium">phone</div>
                <div className="rounded border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5">123</div>
              </div>
            ),
            caption: "Hindari label generic (\"phone\") atau bahasa Inggris di mitra-facing form. Tidak relatable.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Field description di bawah label untuk context (\"Akan dipakai untuk OTP login\"). Mitra paham why.",
          }}
          dont={{
            caption: "Jangan stuff helper text + error + hint di tooltip. Mitra harus klik untuk paham — tampilkan visible.",
          }}
        />
      </DocsSection>

      <DocsSection title="When to use vs Form">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Field</strong> — light wiring only, no validation library. Best for prototypes + simple settings.</li>
          <li>• <strong>Form</strong> — react-hook-form + zod. Best for real submission with validation errors.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950">Field</h3>
        <p className="text-sm text-text-sub-600">Vertical stack — label, control, description.</p>
        <DocsPropsTable
          rows={[
            { name: "className", type: "string", description: "Compose gap, padding overrides." },
          ]}
        />
        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">FieldRow</h3>
        <p className="text-sm text-text-sub-600">Horizontal layout — label/copy on the left, control (Switch/Checkbox) on the right.</p>

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">FieldGroup</h3>
        <p className="text-sm text-text-sub-600">Wraps multiple Fields with consistent vertical spacing. Override <code className="text-xs">className</code> for grid layouts.</p>

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">FieldDescription</h3>
        <p className="text-sm text-text-sub-600">Helper paragraph. Renders <code className="text-xs">text-xs text-text-sub-600</code>.</p>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Wiring</strong> — Field doesn&apos;t auto-wire IDs. YOU pass <code className="text-xs">htmlFor</code> on Label and <code className="text-xs">id</code> on the input. For automatic wiring use Form (RHF).</li>
          <li>• <strong>Description linking</strong> — link FieldDescription to the input via <code className="text-xs">aria-describedby</code> so SR announces the helper text when the input gains focus.</li>
          <li>• <strong>Invalid state</strong> — when <code className="text-xs">InputRoot invalid</code> is set, the inner input gets <code className="text-xs">aria-invalid=&quot;true&quot;</code>. Pair with <code className="text-xs">Hint tone=&quot;error&quot;</code> and link via <code className="text-xs">aria-describedby</code>.</li>
          <li>• <strong>FieldRow</strong> — when the inner Switch/Checkbox is the actual control, ensure the label-side text wraps a <code className="text-xs">Label htmlFor</code> targeting the control. Otherwise SR users won&apos;t know what they&apos;re toggling.</li>
          <li>• <strong>Reduced motion</strong> — no inherent motion.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
