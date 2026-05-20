"use client"

import * as React from "react"
import {
  RiInformationLine as Info,
  RiErrorWarningLine as AlertCircle,
  RiBuildingLine as Bank,
  RiArrowDownSLine as ChevronDown,
} from "@remixicon/react"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Field, FieldDescription } from "@/registry/dash/ui/field"
import { Label } from "@/registry/dash/ui/label"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Switch } from "@/registry/dash/ui/switch"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { DocsApiTable } from "@/components/docs/api-table"
import { DocsShadcnTemplate } from "@/components/docs/shadcn-template"

/**
 * Textarea — Figma 1:1 (8 nodes verified 2026-05-18).
 *
 *   435:5725 / 435:5712      Master spec — 6 states stacked (default/hover/focus/filled/disabled/error)
 *   3631:1657 / 3631:1668    Sizes + filled / character counter variants
 *   3634:12862 / 3634:12870  In-form composition (light + dark)
 *   3634:13113 / 3634:13127  Transfer dialog use case w/ description field
 *
 * Spec:
 *   radius 12 · pad t/r/b/l = 10/10/10/12 · 1px border · bg-white-0
 *   states: default / hover / focus (stroke-strong-950) / filled / disabled / error (state-error-base)
 *   resize-y enabled, min-h-20
 *   Counter "0/200" rendered bottom-right inside the textarea pad (use position absolute).
 */

const CounterTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; maxLength: number }
>(({ value, defaultValue, onChange, maxLength, className, ...props }, ref) => {
  const [inner, setInner] = React.useState(typeof value === "string" ? value : typeof defaultValue === "string" ? defaultValue : "")
  const v = typeof value === "string" ? value : inner
  return (
    <div className="relative">
      <Textarea
        ref={ref}
        value={v}
        maxLength={maxLength}
        onChange={(e) => { if (onChange) onChange(e); if (typeof value !== "string") setInner(e.target.value) }}
        className={`pb-7 ${className ?? ""}`}
        {...props}
      />
      <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-text-soft-400">
        {v.length}/{maxLength}
      </span>
    </div>
  )
})
CounterTextarea.displayName = "CounterTextarea"

export default function TextareaDocsPage() {
  const [bio, setBio] = React.useState("")
  const [errored, setErrored] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState("Tell us why so we can improve.")

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Forms"
        title="Textarea"
        description="Multi-line text input. 6 visual states (default / hover / focus / filled / disabled / error), maxLength counter pattern, resize-y handle. Pair with Field + Label + FieldDescription for full form-row composition."
      />

      <DocsShadcnTemplate
        name="textarea"
        heroPreview={
          <div className="w-full max-w-md">
            <Textarea placeholder="Catatan untuk dispatcher…" />
          </div>
        }
        heroCode={`<Textarea placeholder="Catatan untuk dispatcher…" />`}
        usageImport={`import { Textarea } from "@/registry/dash/ui/textarea"`}
        usageJsx={`<Textarea placeholder="Type a message…" />`}
        manual={{
          sourcePath: "registry/dash/ui/textarea.tsx",
        }}
      />

      <DocsSection title="State matrix">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          6 visual states stacked. Default + hover + focus + filled = stroke-soft-200 / stroke-strong-950 progressively. Disabled → bg-weak-50. Error → state-error-base border + error-tone hint.
        </p>
        <DocsExample
          title="6 states"
          preview={
            <div className="space-y-5 max-w-md">
              <Field>
                <Label className="inline-flex items-center gap-1.5">
                  Change Label <span className="text-(--state-error-base)">*</span><span className="text-text-soft-400 font-normal">(Optional)</span>
                  <Info className="size-3.5 text-icon-soft-400" />
                </Label>
                <CounterTextarea placeholder="Placeholder text…" maxLength={200} />
                <FieldDescription className="inline-flex items-center gap-1.5"><Info className="size-3.5 text-icon-soft-400" /> This is a hint text to help user.</FieldDescription>
              </Field>

              <Field>
                <Label className="inline-flex items-center gap-1.5">
                  Change Label <span className="text-(--state-error-base)">*</span><span className="text-text-soft-400 font-normal">(Optional)</span>
                  <Info className="size-3.5 text-icon-soft-400" />
                </Label>
                <CounterTextarea placeholder="Placeholder text…" maxLength={200} className="bg-bg-weak-50" />
                <FieldDescription className="inline-flex items-center gap-1.5"><Info className="size-3.5 text-icon-soft-400" /> hover — bg-weak-50</FieldDescription>
              </Field>

              <Field>
                <Label className="inline-flex items-center gap-1.5">
                  Change Label <span className="text-(--state-error-base)">*</span><span className="text-text-soft-400 font-normal">(Optional)</span>
                  <Info className="size-3.5 text-icon-soft-400" />
                </Label>
                <CounterTextarea placeholder="Placeholder text…" maxLength={200} className="border-stroke-strong-950" />
                <FieldDescription className="inline-flex items-center gap-1.5"><Info className="size-3.5 text-icon-soft-400" /> focus — stroke-strong-950</FieldDescription>
              </Field>

              <Field>
                <Label className="inline-flex items-center gap-1.5">
                  Change Label <span className="text-(--state-error-base)">*</span><span className="text-text-soft-400 font-normal">(Optional)</span>
                  <Info className="size-3.5 text-icon-soft-400" />
                </Label>
                <CounterTextarea defaultValue="Placeholder text..." maxLength={200} />
                <FieldDescription className="inline-flex items-center gap-1.5"><Info className="size-3.5 text-icon-soft-400" /> filled</FieldDescription>
              </Field>

              <Field>
                <Label className="inline-flex items-center gap-1.5 opacity-60">
                  Change Label <span className="text-(--state-error-base)">*</span><span className="text-text-soft-400 font-normal">(Optional)</span>
                  <Info className="size-3.5 text-icon-soft-400" />
                </Label>
                <CounterTextarea placeholder="Placeholder text…" maxLength={200} disabled />
                <FieldDescription className="inline-flex items-center gap-1.5 opacity-60"><Info className="size-3.5 text-icon-soft-400" /> disabled</FieldDescription>
              </Field>

              <Field>
                <Label className="inline-flex items-center gap-1.5">
                  Change Label <span className="text-(--state-error-base)">*</span><span className="text-text-soft-400 font-normal">(Optional)</span>
                  <Info className="size-3.5 text-icon-soft-400" />
                </Label>
                <CounterTextarea placeholder="Placeholder text…" maxLength={200} invalid defaultValue="Placeholder text..." />
                <div className="text-xs text-(--state-error-base) inline-flex items-center gap-1.5"><AlertCircle className="size-3.5" /> This is a hint text to help user.</div>
              </Field>
            </div>
          }
          code={`<Textarea placeholder="Placeholder…" />
<Textarea placeholder="Placeholder…" disabled />
<Textarea placeholder="Placeholder…" invalid />`}
        />
      </DocsSection>

      <DocsSection title="With character counter">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compose Textarea + position-absolute counter at bottom-right. Apply <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">pb-7</code> to the textarea so user text doesn&apos;t overlap the counter.
        </p>
        <DocsExample
          title='"Tell us about yourself" 0/200'
          preview={
            <Field className="max-w-md">
              <Label htmlFor="bio">Biography <span className="text-text-soft-400 font-normal">(Optional)</span></Label>
              <CounterTextarea id="bio" placeholder="Describe yourself…" maxLength={200} value={bio} onChange={(e) => setBio(e.target.value)} />
              <FieldDescription>It will be displayed on your profile.</FieldDescription>
            </Field>
          }
          code={`function CounterTextarea({ value, onChange, maxLength }) {
  return (
    <div className="relative">
      <Textarea value={value} onChange={onChange} maxLength={maxLength} className="pb-7" />
      <span className="absolute bottom-2 right-3 text-xs text-text-soft-400">
        {value.length}/{maxLength}
      </span>
    </div>
  )
}`}
        />
      </DocsSection>

      <DocsSection title="Invalid state w/ error message">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Pass <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">invalid</code> for red border + red focus ring. Pair with FieldDescription in error tone.
        </p>
        <DocsExample
          title="Toggle invalid"
          preview={
            <Field className="max-w-md">
              <Label htmlFor="reason">Reason <span className="text-(--state-error-base)">*</span></Label>
              <CounterTextarea
                id="reason"
                placeholder="Tell us why…"
                maxLength={200}
                invalid={errored}
                defaultValue=""
              />
              {errored ? (
                <div className="text-xs text-(--state-error-base) inline-flex items-center gap-1.5"><AlertCircle className="size-3.5" /> {errorMsg}</div>
              ) : (
                <FieldDescription>Optional but appreciated.</FieldDescription>
              )}
              <Button size="sm" tone="neutral" style="stroke" className="self-start mt-1" onClick={() => setErrored((v) => !v)}>
                Toggle invalid
              </Button>
            </Field>
          }
          code={`<Textarea invalid placeholder="Tell us why…" />
{invalid ? <div className="text-error-base">Error message.</div> : null}`}
        />
      </DocsSection>

      <DocsSection title="Transfer dialog use case">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Mounted inside a money-transfer modal — paired with Amount input + Recurring payment switch + footer buttons. Counter sits inside the textarea bottom-right.
        </p>
        <DocsExample
          title='"Recipient Receives" panel'
          preview={
            <div className="max-w-sm rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-(--shadow-custom-md)">
              <header className="flex items-center gap-3 px-4 py-3 border-b border-stroke-soft-200">
                <span className="size-9 rounded-full bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400">
                  <Bank className="size-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-strong-950">Checking ••0123</div>
                  <div className="text-xs text-text-sub-600">Available: $15,000.00</div>
                </div>
                <ChevronDown className="size-4 text-icon-soft-400" />
              </header>
              <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-text-soft-400 bg-bg-weak-50 border-b border-stroke-soft-200">
                Recipient Receives
              </div>
              <div className="p-4 space-y-4">
                <Field>
                  <Label htmlFor="amt" className="inline-flex items-center gap-1.5">Enter Amount <Info className="size-3.5 text-icon-soft-400" /></Label>
                  <InputRoot>
                    <span className="text-text-soft-400 text-sm">$</span>
                    <Input id="amt" defaultValue="0.00" />
                  </InputRoot>
                </Field>
                <Field>
                  <Label htmlFor="desc" className="inline-flex items-center gap-1.5">
                    Description <span className="text-(--state-error-base)">*</span>
                    <span className="text-text-soft-400 font-normal">(Optional)</span>
                  </Label>
                  <CounterTextarea id="desc" placeholder="The message you wish to send to the recipient…" maxLength={200} />
                </Field>
                <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-stroke-soft-200 mt-1 pt-3">
                  <Switch />
                  <span className="text-sm text-text-strong-950">Recurring payment</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-stroke-soft-200">
                <Button size="sm" tone="neutral" style="stroke">Back</Button>
                <Button size="sm" tone="primary">Next</Button>
              </div>
            </div>
          }
          code={`<Field>
  <Label>Description (Optional)</Label>
  <CounterTextarea placeholder="The message you wish to send…" maxLength={200} />
</Field>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Suspension reason — ops audit log"
          description="Ops menulis alasan suspend mitra. Wajib karena masuk audit trail. Min-length 20 char untuk filter alasan satu kata."
          preview={
            <Field className="w-full max-w-md">
              <Label>Alasan suspend</Label>
              <Textarea
                placeholder="Jelaskan kenapa mitra ini di-suspend (min 20 karakter). Contoh: Mitra menolak 3 dispatch berturut-turut dalam shift Bekasi Timur 14 Mei."
                minLength={20}
                rows={4}
              />
              <FieldDescription>Tersimpan di audit trail · tidak bisa diubah setelah submit.</FieldDescription>
            </Field>
          }
          code={`<Field>
  <Label>Alasan suspend</Label>
  <Textarea
    placeholder="Jelaskan kenapa mitra ini di-suspend (min 20 karakter)..."
    minLength={20}
    rows={4}
  />
  <FieldDescription>Tersimpan di audit trail · tidak bisa diubah setelah submit.</FieldDescription>
</Field>`}
        />

        <DocsExample
          title="Mitra trip note"
          description="Mitra Reservasi tulis catatan untuk customer setelah trip selesai — kondisi paket, akses lokasi, dll. Counter cegah over-writing."
          preview={
            <Field className="w-full max-w-md">
              <Label>Catatan trip (Opsional)</Label>
              <CounterTextarea
                placeholder="Contoh: Paket diterima security cluster. Gate B tertutup, akses via Gate A."
                maxLength={140}
              />
            </Field>
          }
          code={`<Field>
  <Label>Catatan trip (Opsional)</Label>
  <CounterTextarea
    placeholder="Contoh: Paket diterima security cluster..."
    maxLength={140}
  />
</Field>`}
        />

        <DocsExample
          title="Maintenance ticket — fleet ops"
          description="Mekanik input gejala kerusakan motor sebelum service. Multi-line untuk symptom + replication steps + part curiga."
          preview={
            <Field className="w-full max-w-md">
              <Label>Keluhan kendaraan</Label>
              <Textarea
                rows={5}
                placeholder={"Gejala:\nLangkah reproduksi:\nPart yang dicurigai:"}
                defaultValue={"Gejala: Battery drop dari 100% ke 60% dalam 30 menit idle.\nLangkah reproduksi: Charge full malam, pagi sudah 60%.\nPart yang dicurigai: BMS atau cell #3."}
              />
              <FieldDescription>Akan dikirim ke tim X-Dock untuk diagnosis awal.</FieldDescription>
            </Field>
          }
          code={`<Field>
  <Label>Keluhan kendaraan</Label>
  <Textarea
    rows={5}
    placeholder={"Gejala:\\nLangkah reproduksi:\\nPart yang dicurigai:"}
  />
  <FieldDescription>Akan dikirim ke tim X-Dock untuk diagnosis awal.</FieldDescription>
</Field>`}
        />
      </DocsSection>

      <DocsSection title="API" id="api">
        <DocsApiTable
          idPrefix="textarea-prop"
          rows={[
            { name: "invalid", type: "boolean", defaultValue: "false", description: "Renders red border + red focus ring. Pair with error-tone description below." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "bg-weak-50 + opacity-50 + cursor-not-allowed." },
            { name: "maxLength", type: "number", description: "Native HTML maxLength. Counter UI is composed separately (see Use Case above)." },
            { name: "className", type: "string", description: "Apply pb-7 when adding the bottom-right counter to leave space for it." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
