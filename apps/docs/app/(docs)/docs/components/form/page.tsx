"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
} from "@/registry/dash/ui/form"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const schema = z.object({
  mitraId: z.string().regex(/^mtr-\d{4,}$/, "Format: mtr-9412"),
  tribe: z.enum(["reservasi", "express", "bulk"], {
    message: "Pilih salah satu tribe",
  }),
  reason: z.string().min(20, "Minimal 20 karakter"),
})

export default function FormDocsPage() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { mitraId: "", tribe: "reservasi", reason: "" },
  })

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Form"
        title="Form"
        description="Thin react-hook-form integration. Provides accessible label/control/description/error wiring. Pair with zod schemas via @hookform/resolvers."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add form`} />
      </DocsSection>

      <DocsSection title="Example">
        <DocsExample
          title="Suspend mitra form"
          preview={
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((v) => console.log(v))}
                className="w-full max-w-md space-y-4"
              >
                <FormField
                  control={form.control}
                  name="mitraId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mitra ID</FormLabel>
                      <FormControl>
                        <InputRoot>
                          <Input placeholder="mtr-9412" {...field} />
                        </InputRoot>
                      </FormControl>
                      <FormDescription>Cari mitra dari daftar aktif Reservasi/Express.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tribe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tribe</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
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
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alasan suspend</FormLabel>
                      <FormControl>
                        <InputRoot>
                          <Input placeholder="Tulis alasan..." {...field} />
                        </InputRoot>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Submit suspend</Button>
              </form>
            </Form>
          }
          code={`const schema = z.object({
  mitraId: z.string().regex(/^mtr-\\d{4,}$/, "Format: mtr-9412"),
  tribe: z.enum(["reservasi", "express", "bulk"]),
  reason: z.string().min(20),
})

const form = useForm({ resolver: zodResolver(schema) })

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="mitraId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mitra ID</FormLabel>
          <FormControl>
            <InputRoot><Input {...field} /></InputRoot>
          </FormControl>
          <FormDescription>Cari dari daftar aktif.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    …
  </form>
</Form>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Form</strong> — RHF FormProvider, spread <code className="text-xs">useForm()</code>.</li>
          <li className="pl-4">└ <strong>FormField</strong> — RHF Controller wrapper; provides <code className="text-xs">field</code> render prop.</li>
          <li className="pl-8">└ <strong>FormItem</strong> — id-pairing scope for label, control, description, message.</li>
          <li className="pl-12">├ <strong>FormLabel</strong> — auto-wires <code className="text-xs">htmlFor</code> + flips to error tone when invalid.</li>
          <li className="pl-12">├ <strong>FormControl</strong> — Radix Slot; injects <code className="text-xs">id</code> + <code className="text-xs">aria-describedby</code> + <code className="text-xs">aria-invalid</code> into the wrapped input.</li>
          <li className="pl-12">├ <strong>FormDescription</strong> — helper paragraph, linked via aria-describedby.</li>
          <li className="pl-12">└ <strong>FormMessage</strong> — auto-renders the RHF error message (or null when valid).</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950">Form</h3>
        <p className="text-sm text-text-sub-600">Spread <code className="text-xs">useForm()</code> return value.</p>
        <DocsPropsTable
          rows={[
            { name: "...formMethods", type: "UseFormReturn", description: "Pass the return value of useForm() directly: <Form {...form}>." },
          ]}
        />

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">FormField</h3>
        <p className="text-sm text-text-sub-600">RHF Controller wrapper. Provides <code className="text-xs">field</code> + <code className="text-xs">fieldState</code> via the <code className="text-xs">render</code> prop.</p>
        <DocsPropsTable
          rows={[
            { name: "control", type: "Control<TFieldValues>", description: "Pass form.control." },
            { name: "name", type: "Path<TFieldValues>", description: "Field name in the schema." },
            { name: "render", type: "({ field, fieldState }) => ReactNode", description: "Render-prop returning the FormItem subtree." },
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
        <p className="text-sm text-text-sub-600">Renders the RHF error message via Hint(tone=error). Renders null when the field is valid.</p>
      </DocsSection>

      <DocsSection title="Accessibility">
        <p className="text-sm text-text-sub-600">All ARIA wiring is automatic when you compose FormItem → FormLabel → FormControl → FormDescription → FormMessage.</p>
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Label ↔ control</strong> — FormLabel <code className="text-xs">htmlFor</code> = FormControl <code className="text-xs">id</code>.</li>
          <li>• <strong>Description ↔ control</strong> — FormDescription is linked via <code className="text-xs">aria-describedby</code>.</li>
          <li>• <strong>Error ↔ control</strong> — when invalid, FormMessage is appended to <code className="text-xs">aria-describedby</code> and <code className="text-xs">aria-invalid=&quot;true&quot;</code> flips on the control.</li>
          <li>• <strong>Error live region</strong> — FormMessage uses Hint which has <code className="text-xs">role=&quot;alert&quot;</code> for error tone. SR announces the message when validation runs.</li>
          <li>• <strong>Submit on Enter</strong> — wrapping in <code className="text-xs">{`<form onSubmit>`}</code> enables native Enter-to-submit for single-line text inputs.</li>
          <li>• <strong>Focus first error</strong> — RHF&apos;s <code className="text-xs">shouldFocusError</code> (default <code className="text-xs">true</code>) moves focus to the first invalid field on submit. Keep it on.</li>
          <li>• <strong>Reduced motion</strong> — error tone transition respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
