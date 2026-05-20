"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import {
  RiBankCardLine as CardIcon,
  RiPaypalLine as PayPal,
  RiWalletLine as Wallet,
  RiMapPin2Line as MapPin,
  RiHome5Line as Home,
  RiBuilding2Line as Office,
} from "@remixicon/react"
import { RadioGroup, RadioItem, RadioField } from "@/registry/dash/ui/radio"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Radio — Figma 1:1 (20 nodes verified 2026-05-18).
 *
 * Three primitives:
 *   - RadioGroup (Radix root)
 *   - RadioItem (16px disc, sm/md/lg sizes, Dash extension)
 *   - RadioField (item + label + optional description composition)
 *
 * Card-style picker uses an inline `RadioCard` helper composed from primitives
 * (mirrors CheckboxCard pattern). Use RadioCard for plan tiers, payment methods,
 * address selectors, and any mutually-exclusive option list where each option
 * needs a leading visual + multi-line content.
 */

type RadioCardProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
  label: React.ReactNode
  sublabel?: React.ReactNode
  badge?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  selected?: boolean
}

const RadioCard = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioCardProps>(
  ({ id, label, sublabel, badge, description, action, leading, trailing, selected, className, ...props }, ref) => {
    const generatedId = React.useId()
    const itemId = id ?? generatedId
    const isActive = selected ?? props.checked === true
    return (
      <label
        htmlFor={itemId}
        className={cn(
          "flex items-start gap-3 rounded-xl border bg-bg-white-0 p-4 transition-colors cursor-pointer",
          isActive ? "border-primary" : "border-stroke-soft-200 hover:bg-bg-weak-50",
          className,
        )}
      >
        {leading ? <span className="shrink-0 inline-flex items-center justify-center">{leading}</span> : null}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
            <span className="text-sm font-medium text-text-strong-950">{label}</span>
            {sublabel ? <span className="text-sm text-text-sub-600">{sublabel}</span> : null}
            {badge ? <span>{badge}</span> : null}
          </div>
          {description ? <p className="text-xs text-text-sub-600 leading-relaxed mt-0.5">{description}</p> : null}
          {action ? <div className="mt-1.5">{action}</div> : null}
        </div>
        {trailing ? <div className="ml-3 shrink-0">{trailing}</div> : null}
        <RadioItem ref={ref} id={itemId} className="mt-0.5" {...props} />
      </label>
    )
  },
)
RadioCard.displayName = "RadioCard"

export default function RadioDocsPage() {
  const [pay, setPay] = React.useState("card")
  const [plan, setPlan] = React.useState("pro")
  const [addr, setAddr] = React.useState("home")
  const [size, setSize] = React.useState("md")
  const [contact, setContact] = React.useState("email")

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Forms"
        title="Radio"
        description="Mutually-exclusive single-select control. Three primitives — RadioGroup, RadioItem (16px disc with inner 8px dot), RadioField (item + label + description). Card-style selectors compose via the inline RadioCard helper."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add radio`} />
      </DocsSection>

      <DocsSection title="States">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          4 states — unchecked / checked / disabled (off) / disabled (on). The 16px disc shifts from stroke-soft-200 border to filled primary with an 8px white inner dot.
        </p>
        <DocsExample
          title="off / on / disabled-off / disabled-on"
          preview={
            <RadioGroup defaultValue="b" className="grid grid-cols-4 gap-6 max-w-md">
              <div className="flex flex-col items-center gap-1.5">
                <RadioItem value="a" />
                <span className="text-[10px] text-text-soft-400">off</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RadioItem value="b" />
                <span className="text-[10px] text-text-soft-400">on</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RadioItem value="c" disabled />
                <span className="text-[10px] text-text-soft-400">disabled</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RadioItem value="d" checked disabled />
                <span className="text-[10px] text-text-soft-400">disabled on</span>
              </div>
            </RadioGroup>
          }
          code={`<RadioGroup defaultValue="b">
  <RadioItem value="a" />
  <RadioItem value="b" />
  <RadioItem value="c" disabled />
  <RadioItem value="d" checked disabled />
</RadioGroup>`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Three sizes — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm (14px)</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">md (16px Figma default)</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">lg (20px)</code>. The inner dot scales proportionally.
        </p>
        <DocsExample
          title="3 sizes"
          preview={
            <RadioGroup value={size} onValueChange={setSize} className="flex items-end gap-6">
              {(["sm","md","lg"] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <RadioItem value={s} size={s} />
                  <span className="text-[10px] text-text-soft-400">{s}</span>
                </div>
              ))}
            </RadioGroup>
          }
          code={`<RadioGroup>
  <RadioItem value="sm" size="sm" />
  <RadioItem value="md" size="md" />
  <RadioItem value="lg" size="lg" />
</RadioGroup>`}
        />
      </DocsSection>

      <DocsSection title="Radio + label">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">RadioField</code> wraps a RadioItem with a clickable label and an optional description below.
        </p>
        <DocsExample
          title="Label + description"
          preview={
            <RadioGroup defaultValue="email" className="space-y-3 max-w-md">
              <RadioField value="email" label="Email" description="We'll send you a one-time link to confirm." />
              <RadioField value="sms"   label="SMS"   description="Standard message rates apply." />
              <RadioField value="phone" label="Phone call" description="Available 8am-6pm WIB." />
            </RadioGroup>
          }
          code={`<RadioGroup>
  <RadioField value="email" label="Email" description="We'll send you a one-time link." />
  <RadioField value="sms"   label="SMS"   description="Standard message rates apply." />
</RadioGroup>`}
        />
      </DocsSection>

      <DocsSection title="RadioGroup vertical">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default stack direction. Use controlled state to drive forms; pair with a Form Field wrapper if you need an error message slot.
        </p>
        <DocsExample
          title="Contact method picker"
          preview={
            <div className="max-w-md">
              <RadioGroup value={contact} onValueChange={setContact} className="space-y-2">
                {[
                  ["email", "Email me"],
                  ["sms",   "Text me"],
                  ["call",  "Call me"],
                ].map(([v, l]) => (
                  <RadioField key={v} value={v} label={l} />
                ))}
              </RadioGroup>
              <p className="text-xs text-text-soft-400 mt-3">Selected: <strong className="text-text-strong-950">{contact}</strong></p>
            </div>
          }
          code={`const [contact, setContact] = useState("email")

<RadioGroup value={contact} onValueChange={setContact}>
  <RadioField value="email" label="Email me" />
  <RadioField value="sms" label="Text me" />
  <RadioField value="call" label="Call me" />
</RadioGroup>`}
        />
      </DocsSection>

      <DocsSection title="Payment method cards">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Card-style picker via the local <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">RadioCard</code> helper. Leading icon + label + description + trailing brand row. Active card uses a primary border.
        </p>
        <DocsExample
          title="Card / PayPal / Wallet"
          preview={
            <RadioGroup value={pay} onValueChange={setPay} className="space-y-3 max-w-md">
              <RadioCard
                value="card"
                checked={pay === "card"}
                label="Credit / Debit Card"
                description="Visa, Mastercard, Amex"
                leading={<span className="size-9 rounded-md bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400"><CardIcon className="size-4" /></span>}
                trailing={<span className="text-xs text-text-soft-400">•••• 1234</span>}
              />
              <RadioCard
                value="paypal"
                checked={pay === "paypal"}
                label="PayPal"
                description="Redirects to paypal.com to confirm."
                leading={<span className="size-9 rounded-md bg-(--state-information-light) inline-flex items-center justify-center text-(--state-information-dark)"><PayPal className="size-4" /></span>}
              />
              <RadioCard
                value="wallet"
                checked={pay === "wallet"}
                label="Apex Wallet"
                description="Pay from your account balance."
                badge={<Badge status="success" appearance="lighter" size="sm">Instant</Badge>}
                leading={<span className="size-9 rounded-md bg-(--state-success-light) inline-flex items-center justify-center text-(--state-success-dark)"><Wallet className="size-4" /></span>}
              />
            </RadioGroup>
          }
          code={`<RadioGroup value={pay} onValueChange={setPay}>
  <RadioCard
    value="card"
    checked={pay === "card"}
    label="Credit / Debit Card"
    description="Visa, Mastercard, Amex"
    leading={<CardIcon />}
    trailing="•••• 1234"
  />
</RadioGroup>`}
        />
      </DocsSection>

      <DocsSection title="Plan tier picker">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          RadioCard with a multi-line description and a "Recommended" badge marking the suggested tier. Sublabel slot carries the price; action slot can link to plan details.
        </p>
        <DocsExample
          title="Free / Pro / Team"
          preview={
            <RadioGroup value={plan} onValueChange={setPlan} className="space-y-3 max-w-md">
              <RadioCard
                value="free"
                checked={plan === "free"}
                label="Free"
                sublabel="— $0 / mo"
                description="For solo trials and personal projects."
              />
              <RadioCard
                value="pro"
                checked={plan === "pro"}
                label="Pro"
                sublabel="— $24 / mo"
                badge={<Badge status="feature" appearance="lighter" size="sm">Recommended</Badge>}
                description="For solo founders shipping production apps."
                action={<a href="#" className="text-sm font-medium text-primary hover:underline">Compare features</a>}
              />
              <RadioCard
                value="team"
                checked={plan === "team"}
                label="Team"
                sublabel="— $96 / mo"
                description="For up to 10 users; includes priority support."
              />
            </RadioGroup>
          }
          code={`<RadioCard
  value="pro"
  checked={plan === "pro"}
  label="Pro"
  sublabel="— $24 / mo"
  badge={<Badge status="feature">Recommended</Badge>}
  description="For solo founders shipping production apps."
  action={<a href="/compare">Compare features</a>}
/>`}
        />
      </DocsSection>

      <DocsSection title="Address selector">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          RadioCard with an Avatar/Icon leading slot for saved address lists, contact pickers, profile selectors.
        </p>
        <DocsExample
          title="Home / Office / Other"
          preview={
            <RadioGroup value={addr} onValueChange={setAddr} className="space-y-3 max-w-md">
              <RadioCard
                value="home"
                checked={addr === "home"}
                label="Home"
                description="Jl. Sudirman No. 88, Jakarta Selatan"
                leading={<span className="size-9 rounded-full bg-(--state-success-light) inline-flex items-center justify-center text-(--state-success-dark)"><Home className="size-4" /></span>}
              />
              <RadioCard
                value="office"
                checked={addr === "office"}
                label="Office"
                description="Wisma 46, Kota BNI, Level 22"
                leading={<span className="size-9 rounded-full bg-(--state-information-light) inline-flex items-center justify-center text-(--state-information-dark)"><Office className="size-4" /></span>}
              />
              <RadioCard
                value="other"
                checked={addr === "other"}
                label="Other"
                description="Custom address — entered at checkout"
                leading={<span className="size-9 rounded-full bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400"><MapPin className="size-4" /></span>}
              />
            </RadioGroup>
          }
          code={`<RadioCard
  value="home"
  checked={addr === "home"}
  label="Home"
  description="Jl. Sudirman No. 88, Jakarta Selatan"
  leading={<Home />}
/>`}
        />
      </DocsSection>

      <DocsSection title="Inline picker">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Tight horizontal arrangement for short-option pickers. Set <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">orientation="horizontal"</code> on the RadioGroup.
        </p>
        <DocsExample
          title="Yes / No / Maybe"
          preview={
            <RadioGroup defaultValue="yes" orientation="horizontal" className="flex items-center gap-6">
              {[
                ["yes", "Yes"],
                ["no",  "No"],
                ["maybe", "Maybe"],
              ].map(([v, l]) => (
                <RadioField key={v} value={v} label={l} />
              ))}
            </RadioGroup>
          }
          code={`<RadioGroup orientation="horizontal">
  <RadioField value="yes" label="Yes" />
  <RadioField value="no" label="No" />
  <RadioField value="maybe" label="Maybe" />
</RadioGroup>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Frekuensi payout mitra"
          description="Mitra pilih kapan payout ditransfer. Mutually-exclusive — satu mitra hanya bisa satu jadwal aktif. Default 'Mingguan' karena paling umum dipilih."
          preview={
            <RadioGroup defaultValue="weekly" className="w-full max-w-md">
              <RadioField value="daily" label="Harian" description="Transfer setiap H+1 jam 09:00 WIB. Min payout Rp 50.000." />
              <RadioField value="weekly" label="Mingguan" description="Transfer setiap Senin jam 09:00 WIB. Min payout Rp 100.000." />
              <RadioField value="monthly" label="Bulanan" description="Transfer tanggal 1 setiap bulan. Tidak ada minimum." />
            </RadioGroup>
          }
          code={`<RadioGroup defaultValue="weekly">
  <RadioField value="daily" label="Harian" description="Transfer setiap H+1 jam 09:00 WIB. Min payout Rp 50.000." />
  <RadioField value="weekly" label="Mingguan" description="Transfer setiap Senin jam 09:00 WIB. Min payout Rp 100.000." />
  <RadioField value="monthly" label="Bulanan" description="Transfer tanggal 1 setiap bulan. Tidak ada minimum." />
</RadioGroup>`}
        />

        <DocsExample
          title="Mitra shift assignment"
          description="Dispatcher assign mitra ke salah satu shift harian. Card-style biar mitra cepat scan jam vs benefit."
          preview={
            <RadioGroup defaultValue="pagi" className="w-full max-w-md grid gap-2">
              <RadioCard
                value="pagi"
                label="Shift pagi"
                sublabel="06:00 – 14:00 WIB"
                badge={<Badge size="sm" appearance="lighter" status="success">Demand tinggi</Badge>}
                description="Slot peak hour ke kantor & sekolah. Surge multiplier 1.3×."
              />
              <RadioCard
                value="siang"
                label="Shift siang"
                sublabel="14:00 – 22:00 WIB"
                description="Slot delivery dan ride umum. Multiplier 1.0×."
              />
              <RadioCard
                value="malam"
                label="Shift malam"
                sublabel="22:00 – 06:00 WIB"
                badge={<Badge size="sm" appearance="lighter" status="feature">Insentif +25%</Badge>}
                description="Slot low-supply. Bonus insentif aktif."
              />
            </RadioGroup>
          }
          code={`<RadioGroup defaultValue="pagi">
  <RadioCard value="pagi" label="Shift pagi" sublabel="06:00 – 14:00 WIB"
    badge={<Badge status="success">Demand tinggi</Badge>}
    description="Slot peak hour ke kantor & sekolah. Surge multiplier 1.3×." />
  <RadioCard value="siang" label="Shift siang" sublabel="14:00 – 22:00 WIB"
    description="Slot delivery dan ride umum. Multiplier 1.0×." />
  <RadioCard value="malam" label="Shift malam" sublabel="22:00 – 06:00 WIB"
    badge={<Badge status="feature">Insentif +25%</Badge>}
    description="Slot low-supply. Bonus insentif aktif." />
</RadioGroup>`}
        />

        <DocsExample
          title="Suspension severity tier"
          description="Ops pilih tier suspension. Severity mutually exclusive — auto-suspend tier ringan, manual review tier berat."
          preview={
            <RadioGroup defaultValue="warning" className="w-full max-w-md">
              <RadioField value="warning" label="Warning" description="Notifikasi in-app, tidak block dispatch. Reset H+7." />
              <RadioField value="cool-down" label="Cool-down 24 jam" description="Block dispatch baru selama 24 jam. Auto-resume." />
              <RadioField value="suspend-7" label="Suspend 7 hari" description="Block total. Mitra harus konfirmasi ke ops untuk reaktivasi." />
              <RadioField value="permanent" label="Suspend permanen" description="Final — masuk blacklist, kontrak diakhiri. Wajib review CEO." />
            </RadioGroup>
          }
          code={`<RadioGroup defaultValue="warning">
  <RadioField value="warning" label="Warning"
    description="Notifikasi in-app, tidak block dispatch. Reset H+7." />
  <RadioField value="cool-down" label="Cool-down 24 jam"
    description="Block dispatch baru selama 24 jam. Auto-resume." />
  <RadioField value="suspend-7" label="Suspend 7 hari"
    description="Block total. Mitra harus konfirmasi ke ops untuk reaktivasi." />
  <RadioField value="permanent" label="Suspend permanen"
    description="Final — masuk blacklist, kontrak diakhiri. Wajib review CEO." />
</RadioGroup>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Radio = pilihan mutually-exclusive (satu pilihan saja). Selalu ada default selection — jangan biarkan group kosong. Untuk multi-select pakai Checkbox.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <RadioGroup defaultValue="express">
                <RadioField value="reservasi" label="Reservasi" description="Schedule pickup, mitra terjadwal." />
                <RadioField value="express" label="Express" description="Same-day, surge pricing." />
                <RadioField value="bulk" label="Bulk" description="Multi-package B2B." />
              </RadioGroup>
            ),
            caption: "Pilihan tribe mutually-exclusive (satu delivery = satu tribe). Default selection 'Express' supaya user tidak hit submit kosong.",
          }}
          dont={{
            preview: (
              <RadioGroup>
                <RadioField value="r" label="Active" />
                <RadioField value="s" label="Suspended" />
                <RadioField value="p" label="Pending" />
              </RadioGroup>
            ),
            caption: "Tanpa defaultValue, group kosong → user submit form lupa pilih → server error 'status required'. Selalu set default.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <RadioGroup defaultValue="weekly">
                <RadioField value="daily" label="Harian" />
                <RadioField value="weekly" label="Mingguan" />
                <RadioField value="monthly" label="Bulanan" />
              </RadioGroup>
            ),
            caption: "Frekuensi payout = mutually-exclusive. Radio dengan 3 opsi ringkas, label dalam bahasa Indonesia.",
          }}
          dont={{
            preview: (
              <RadioGroup defaultValue="r">
                <RadioField value="r" label="Suka mitra" />
                <RadioField value="e" label="Suka dispatch" />
                <RadioField value="b" label="Suka payroll" />
              </RadioGroup>
            ),
            caption: "User boleh suka >1 fitur — pakai Checkbox. Radio paksa user pilih 1 dari pilihan yang sebenarnya boleh kombinasi.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "RadioGroup.value", type: "string", description: "Controlled selected value." },
            { name: "RadioGroup.onValueChange", type: "(value: string) => void", description: "Fires per selection change." },
            { name: "RadioGroup.defaultValue", type: "string", description: "Uncontrolled initial selection." },
            { name: "RadioGroup.orientation", type: '"horizontal" | "vertical"', defaultValue: '"vertical"', description: "Stack direction." },
            { name: "RadioItem.value", type: "string", description: "Required — identifies this option in the group." },
            { name: "RadioItem.size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "14 / 16 / 20 px disc." },
            { name: "RadioItem.disabled", type: "boolean", defaultValue: "false", description: "Disable interaction." },
            { name: "RadioField.label", type: "ReactNode", description: "Clickable label rendered next to the disc." },
            { name: "RadioField.description", type: "ReactNode", description: "Smaller helper text below the label." },
            { name: "RadioCard (local helper)", type: "RadioItem + leading/label/sublabel/badge/description/action/trailing", description: "Mirrors CheckboxCard. Composed inline in this docs page — copy the snippet for your own project if needed." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-3 text-base text-text-sub-600 leading-relaxed">
          <li><strong className="text-text-strong-950">Role</strong> — RadioGroup renders <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">role=&quot;radiogroup&quot;</code>; each RadioItem renders <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">role=&quot;radio&quot;</code> (via Radix).</li>
          <li><strong className="text-text-strong-950">Keyboard</strong> — Arrow keys cycle within the group; Tab moves to the next focusable element. Space selects.</li>
          <li><strong className="text-text-strong-950">Labels</strong> — Always pair RadioItem with a clickable <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&lt;label htmlFor&gt;</code> (RadioField + RadioCard handle this).</li>
          <li><strong className="text-text-strong-950">Color contrast</strong> — Filled state on primary-base + white inner dot passes WCAG AA at both md and sm sizes.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
