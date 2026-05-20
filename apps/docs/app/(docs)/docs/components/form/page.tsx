"use client"

import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useDashForm,
  validateForm,
} from "@/registry/dash/ui/form"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

type SuspendValues = {
  mitraId: string
  tribe: "reservasi" | "express" | "bulk"
  reason: string
}

export default function FormDocsPage() {
  const form = useDashForm<SuspendValues>({
    mitraId: "",
    tribe: "reservasi",
    reason: "",
  })

  const handleSubmit = (values: SuspendValues) => {
    const errs = validateForm(form, {
      mitraId: (v) => (/^mtr-\d{4,}$/.test(v) ? null : "Format: mtr-9412"),
      tribe: (v) =>
        (["reservasi", "express", "bulk"] as const).includes(v)
          ? null
          : "Pilih salah satu tribe",
      reason: (v) => (v.length >= 20 ? null : "Minimal 20 karakter"),
    })
    if (Object.keys(errs).length > 0) return
    console.log(values)
  }

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Form"
        title="Form"
        description="Vanilla useState + hand-rolled validation. No external form lib. useDashForm hook + FormField render prop give you accessible label/control/description/error wiring without RHF or zod."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add form`} />
      </DocsSection>

      <DocsSection title="Example">
        <DocsExample
          title="Suspend mitra form"
          preview={
            <Form form={form} onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
              <FormField form={form} name="mitraId">
                {({ value, onChange }) => (
                  <FormItem>
                    <FormLabel>Mitra ID</FormLabel>
                    <FormControl>
                      <InputRoot>
                        <Input
                          placeholder="mtr-9412"
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                        />
                      </InputRoot>
                    </FormControl>
                    <FormDescription>Cari mitra dari daftar aktif Reservasi/Express.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              </FormField>

              <FormField form={form} name="tribe">
                {({ value, onChange }) => (
                  <FormItem>
                    <FormLabel>Tribe</FormLabel>
                    <Select value={value} onValueChange={(v) => onChange(v as SuspendValues["tribe"])}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tribe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reservasi">Reservasi</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="bulk">Bulk</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              </FormField>

              <FormField form={form} name="reason">
                {({ value, onChange }) => (
                  <FormItem>
                    <FormLabel>Alasan suspend</FormLabel>
                    <FormControl>
                      <InputRoot>
                        <Input
                          placeholder="Tulis alasan..."
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                        />
                      </InputRoot>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              </FormField>

              <Button type="submit">Submit suspend</Button>
            </Form>
          }
          code={`type SuspendValues = {
  mitraId: string
  tribe: "reservasi" | "express" | "bulk"
  reason: string
}

const form = useDashForm<SuspendValues>({
  mitraId: "",
  tribe: "reservasi",
  reason: "",
})

const handleSubmit = (values: SuspendValues) => {
  const errs = validateForm(form, {
    mitraId: (v) => /^mtr-\\d{4,}$/.test(v) ? null : "Format: mtr-9412",
    reason:  (v) => v.length >= 20 ? null : "Minimal 20 karakter",
  })
  if (Object.keys(errs).length > 0) return
  // POST /api/mitra/suspend
}

<Form form={form} onSubmit={handleSubmit}>
  <FormField form={form} name="mitraId">
    {({ value, onChange }) => (
      <FormItem>
        <FormLabel>Mitra ID</FormLabel>
        <FormControl>
          <InputRoot>
            <Input value={value} onChange={(e) => onChange(e.target.value)} />
          </InputRoot>
        </FormControl>
        <FormDescription>Cari dari daftar aktif.</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  </FormField>
  …
</Form>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Inline error per field di tempat kesalahan terjadi. Mitra langsung tahu mana yang salah, bukan harus scroll cari di summary.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs text-xs space-y-2">
                <div>
                  <div className="mb-1 font-medium">Mitra ID</div>
                  <div className="rounded border border-error-base bg-bg-white-0 px-2 py-1.5">mtr-94</div>
                  <div className="text-error-dark text-[10px] mt-0.5">Format: mtr-9412 (4+ digit)</div>
                </div>
                <div>
                  <div className="mb-1 font-medium">Alasan suspend</div>
                  <div className="rounded border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5">3× no-show</div>
                </div>
              </div>
            ),
            caption: "Error muncul di bawah field (label + value + helper). Format hint memandu mitra ke value yang valid.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs space-y-2">
                <div className="rounded border border-error-base bg-error-lighter px-2 py-1.5 text-error-dark">
                  3 error ditemukan
                </div>
                <div>
                  <div className="mb-1 font-medium">Mitra ID</div>
                  <div className="rounded border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5">mtr-94</div>
                </div>
              </div>
            ),
            caption: "Hindari error summary di top tanpa indikasi field. Dispatcher harus tebak mana yang salah.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Label + helper text + inline error per field. Pakai validator function dengan pesan bahasa Indonesia natural (\"Minimal 20 karakter\").",
          }}
          dont={{
            caption: "Jangan import zod / react-hook-form / @hookform/resolvers — Dash bans them across all 5 FE repos. useDashForm + validateForm cukup.",
          }}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>useDashForm</strong> — useState-backed hook returning <code className="text-xs">{`{ values, errors, setValue, setError, setErrors, reset }`}</code>.</li>
          <li>• <strong>Form</strong> — native <code className="text-xs">{`<form>`}</code> wrapper that calls <code className="text-xs">onSubmit(form.values)</code> and preventDefaults.</li>
          <li className="pl-4">└ <strong>FormField</strong> — render-prop bridge: <code className="text-xs">{`({ value, onChange, error }) => ReactNode`}</code>.</li>
          <li className="pl-8">└ <strong>FormItem</strong> — id-pairing scope for label, control, description, message.</li>
          <li className="pl-12">├ <strong>FormLabel</strong> — auto-wires <code className="text-xs">htmlFor</code> + flips to error tone when invalid.</li>
          <li className="pl-12">├ <strong>FormControl</strong> — Radix Slot; injects <code className="text-xs">id</code> + <code className="text-xs">aria-describedby</code> + <code className="text-xs">aria-invalid</code> into the wrapped input.</li>
          <li className="pl-12">├ <strong>FormDescription</strong> — helper paragraph, linked via aria-describedby.</li>
          <li className="pl-12">└ <strong>FormMessage</strong> — auto-renders the current field error (or null when valid).</li>
          <li>• <strong>validateForm</strong> — one-shot submit-time validator. Pass a map of <code className="text-xs">name → (value, values) =&gt; string | null</code>; returns the error map and sets it on the form.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950">useDashForm</h3>
        <p className="text-sm text-text-sub-600">Hook. Returns the form state object passed to <code className="text-xs">Form</code> + <code className="text-xs">FormField</code>.</p>
        <DocsPropsTable
          rows={[
            { name: "initialValues", type: "T", description: "Initial values object. Type T is inferred from this argument." },
          ]}
        />

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">Form</h3>
        <DocsPropsTable
          rows={[
            { name: "form", type: "FormState<T>", description: "Return value of useDashForm()." },
            { name: "onSubmit", type: "(values: T) => void | Promise<void>", description: "Called with current values. preventDefault is automatic." },
          ]}
        />

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">FormField</h3>
        <p className="text-sm text-text-sub-600">Render-prop bridge between form state and the FormItem subtree.</p>
        <DocsPropsTable
          rows={[
            { name: "form", type: "FormState<T>", description: "Same form object passed to Form." },
            { name: "name", type: "keyof T", description: "Key in the values object." },
            { name: "validate", type: "(value, values) => string | null", description: "Optional. Per-field validator. Runs on submit by default." },
            { name: "validateOn", type: "\"submit\" | \"change\"", description: "Defaults to \"submit\". \"change\" runs validate on every onChange." },
            { name: "children", type: "({ value, onChange, error, name }) => ReactNode", description: "Render-prop returning the FormItem subtree." },
          ]}
        />

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">validateForm</h3>
        <p className="text-sm text-text-sub-600">One-shot submit-time validator. Returns error map; empty object means valid. Sets errors on the form as a side effect.</p>
        <DocsPropsTable
          rows={[
            { name: "form", type: "FormState<T>", description: "Form to validate." },
            { name: "validators", type: "{ [K in keyof T]?: (v, values) => string | null }", description: "Per-field validators. Return a string to mark invalid; null to mark valid." },
          ]}
        />

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">FormItem</h3>
        <p className="text-sm text-text-sub-600">Creates the label / control / description / error id-pairing scope.</p>

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">FormLabel</h3>
        <p className="text-sm text-text-sub-600">Auto <code className="text-xs">htmlFor</code> + flips to error tone.</p>

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">FormControl</h3>
        <p className="text-sm text-text-sub-600">Slot — wraps the input, injects <code className="text-xs">id</code> + <code className="text-xs">aria-describedby</code> + <code className="text-xs">aria-invalid</code>.</p>

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">FormDescription</h3>
        <p className="text-sm text-text-sub-600">Helper paragraph below the control.</p>

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">FormMessage</h3>
        <p className="text-sm text-text-sub-600">Renders the current field error via Hint(tone=error). Renders null when the field is valid.</p>
      </DocsSection>

      <DocsSection title="Accessibility">
        <p className="text-sm text-text-sub-600">All ARIA wiring is automatic when you compose FormItem → FormLabel → FormControl → FormDescription → FormMessage.</p>
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Label ↔ control</strong> — FormLabel <code className="text-xs">htmlFor</code> = FormControl <code className="text-xs">id</code>.</li>
          <li>• <strong>Description ↔ control</strong> — FormDescription is linked via <code className="text-xs">aria-describedby</code>.</li>
          <li>• <strong>Error ↔ control</strong> — when invalid, FormMessage is appended to <code className="text-xs">aria-describedby</code> and <code className="text-xs">aria-invalid=&quot;true&quot;</code> flips on the control.</li>
          <li>• <strong>Error live region</strong> — FormMessage uses Hint which has <code className="text-xs">role=&quot;alert&quot;</code> for error tone. SR announces the message when validation runs.</li>
          <li>• <strong>Submit on Enter</strong> — wrapping in <code className="text-xs">{`<form onSubmit>`}</code> enables native Enter-to-submit for single-line text inputs.</li>
          <li>• <strong>Reduced motion</strong> — error tone transition respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
