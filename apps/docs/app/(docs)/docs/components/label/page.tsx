import { Label } from "@/registry/dash/ui/label"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Textarea } from "@/registry/dash/ui/textarea"
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

export default function LabelDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Form"
        title="Label"
        description="Form field label with required asterisk, optional tag, and inline hint slot. Pair with every Input, Select, Textarea, Checkbox, Radio, and Switch."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add label`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { Label } from "@/registry/dash/ui/label"

<Label htmlFor="mitra-id">Mitra ID</Label>
<Label htmlFor="bank" required>Bank account number</Label>`}
        />
      </DocsSection>

      <DocsSection title="Examples" description="Required / optional / hint variants and full field composition.">
        <DocsExample
          title="Variants"
          preview={
            <div className="w-full max-w-md space-y-3">
              <Label htmlFor="ex1">Mitra ID</Label>
              <Label htmlFor="ex2" required>Bank account number</Label>
              <Label htmlFor="ex3" optional>Notes</Label>
              <Label htmlFor="ex4" hint="(format: NNNN-NNNN)">Phone number</Label>
            </div>
          }
          code={`<Label htmlFor="mitra-id">Mitra ID</Label>
<Label htmlFor="bank" required>Bank account number</Label>
<Label htmlFor="notes" optional>Notes</Label>
<Label htmlFor="phone" hint="(format: NNNN-NNNN)">Phone number</Label>`}
        />

        <DocsExample
          title="Composed field"
          description="Label + Input + Hint — the canonical Dash form row."
          preview={
            <div className="w-full max-w-md space-y-1.5">
              <Label htmlFor="mitra" required>Mitra ID</Label>
              <InputRoot>
                <Input id="mitra" placeholder="mtr-9412" />
              </InputRoot>
              <Hint>ID 6-8 digit dari onboarding sheet</Hint>
            </div>
          }
          code={`<Label htmlFor="mitra" required>Mitra ID</Label>
<InputRoot>
  <Input id="mitra" placeholder="mtr-9412" />
</InputRoot>
<Hint>ID 6-8 digit dari onboarding sheet</Hint>`}
        />

        <DocsExample
          title="Long label with right-aligned hint"
          preview={
            <div className="w-full max-w-md space-y-1.5">
              <Label htmlFor="reason" required hint="max 240 char">
                Alasan suspend mitra (lampirkan ke audit log Halo-dash)
              </Label>
              <Textarea id="reason" rows={3} placeholder="Tulis kronologi singkat…" />
            </div>
          }
          code={`<Label htmlFor="reason" required hint="max 240 char">
  Alasan suspend mitra (lampirkan ke audit log Halo-dash)
</Label>
<Textarea id="reason" rows={3} />`}
        />

        <DocsExample
          title="Disabled peer"
          description="When the labelled input is disabled, the label fades via peer state. Wrap label + input in a flex stack with the input marked <code>peer</code>."
          preview={
            <div className="w-full max-w-md flex flex-col gap-1.5">
              <input id="locked" disabled className="peer h-9 rounded-md border border-stroke-soft-200 px-3 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Locked" />
              <Label htmlFor="locked">Pickup window (locked saat Lebaran rate freeze)</Label>
            </div>
          }
          code={`<input id="locked" disabled className="peer ..." />
<Label htmlFor="locked">Pickup window (locked)</Label>`}
        />

        <DocsExample
          title="Optional + hint together"
          preview={
            <div className="w-full max-w-md">
              <Label htmlFor="ref" optional hint="(internal use)">Reference number</Label>
            </div>
          }
          code={`<Label htmlFor="ref" optional hint="(internal use)">
  Reference number
</Label>`}
        />
      </DocsSection>

      <DocsSection title="Mark required and optional clearly">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Mitra onboarding forms have a mix of required and optional fields. Make the difference obvious before the mitra submits.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-3">
                <Label htmlFor="dn1" required>Nomor KTP mitra</Label>
                <Label htmlFor="dn2" optional>Catatan internal</Label>
              </div>
            ),
            caption: "Use required (red asterisk) for hard validations and optional for fields a dispatcher can skip — partners scan and prioritize.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm space-y-3">
                <Label htmlFor="dn3">Nomor KTP mitra</Label>
                <Label htmlFor="dn4">Catatan internal</Label>
              </div>
            ),
            caption: "Unmarked labels leave the mitra guessing which fields block submission, causing failed submits and dropoff.",
          }}
        />
      </DocsSection>

      <DocsSection title="Keep labels short, push detail to Hint">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          A label names the field. Format examples or rules belong in the Hint slot — not stuffed into the label text.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-1.5">
                <Label htmlFor="dn5" required hint="6 digit">Use-code mitra</Label>
                <InputRoot><Input id="dn5" placeholder="491-280" /></InputRoot>
              </div>
            ),
            caption: "A 2-3 word label plus a short hint keeps the form scannable and lets the format rule sit where it belongs.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm space-y-1.5">
                <Label htmlFor="dn6" required>Masukkan use-code mitra (6 digit, dapat dari SMS)</Label>
                <InputRoot><Input id="dn6" placeholder="491-280" /></InputRoot>
              </div>
            ),
            caption: "Long labels look like paragraphs, slow the eye, and bury the field name inside instructions.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "htmlFor", type: "string", description: "Links to the input's id. Click on label focuses the input." },
            { name: "required", type: "boolean", defaultValue: "false", description: "Red asterisk after label text. Pair with input's required attribute." },
            { name: "optional", type: "boolean", defaultValue: "false", description: "Muted (optional) tag after label." },
            { name: "hint", type: "ReactNode", description: "Right-aligned muted hint string." },
            { name: "className", type: "string", description: "Extend or override classes." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Native <code className="text-xs">&lt;label&gt;</code> element — clicking the label focuses the associated input, no extra wiring.</li>
          <li>• Always pair via <code className="text-xs">htmlFor</code> + matching input <code className="text-xs">id</code>. Avoid wrapping the input as a child — fails when the input is portalled (Select, Combobox).</li>
          <li>• Required asterisk is <code className="text-xs">aria-hidden</code>; pair with <code className="text-xs">aria-required</code> on the input so AT announces required state.</li>
          <li>• Do not use Label as a section heading — use a real heading (<code className="text-xs">&lt;h3&gt;</code>) and keep Label per-field.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
