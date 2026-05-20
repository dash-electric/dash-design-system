"use client"

import * as React from "react"
import {
  RiUser3Line as UserIcon,
  RiSettings3Line as Settings,
  RiFileCopyLine as Copy,
  RiEqualizerLine as Tune,
  RiArrowDownSLine as ChevronDown,
  RiSearchLine as Search,
} from "@remixicon/react"
import { Checkbox, CheckboxField, CheckboxCard } from "@/registry/dash/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsApiTable } from "@/components/docs/api-table"
import { DocsShadcnTemplate } from "@/components/docs/shadcn-template"

/**
 * Checkbox — Figma 1:1 (19 nodes verified 2026-05-18).
 *
 *   227:2002        Base — 4 states × stroke/filled variants
 *   231:4897        Label + sublabel + NEW badge + description + Link Button
 *   261:3896        Card-style row with leading icon variants (none / icon / avatar / brand)
 *   3045:11793..    Auth Settings list / Two-Factor / Password Strength sections
 *   3045:11530      "Personalize your tour" — Suggested + Self-guided card pair
 *   3045:11158      Generate meeting link confirmation
 *   3045:11625      same context, different state
 *   166722:26657..  Inline "I have saved" confirmation checkboxes (light + dark)
 *   166722:26779    Financial transactions table with select-all (indeterminate)
 *   166722:26820..  same context, more rows
 *   3280:3234       Card-list checkboxes with leading icons (none/user/avatar/brand logos)
 */

const transactions = [
  { id: "tx-1", name: "Payroll deposit",  amount: "$3,450.00", date: "2024-03-15", checked: true  },
  { id: "tx-2", name: "Investment Return", amount: "$1,280.75", date: "2024-03-14", checked: false },
  { id: "tx-3", name: "Dividend Income",   amount: "$890.25",   date: "2024-03-13", checked: false },
  { id: "tx-4", name: "Consulting Fee",    amount: "$2,500.00", date: "5,280.50",   checked: true  },
  { id: "tx-5", name: "Rental Income",     amount: "$1,750.00", date: "2024-03-11", checked: false },
]

export default function CheckboxDocsPage() {
  const [tour, setTour] = React.useState<"guide" | "self">("guide")
  const [savedLink, setSavedLink] = React.useState(true)
  const [twoFactor, setTwoFactor] = React.useState({ sms: true, app: true })
  const [rows, setRows] = React.useState(() => transactions.map((t) => t.checked))
  const allChecked = rows.every(Boolean)
  const noneChecked = rows.every((v) => !v)
  const headerChecked: boolean | "indeterminate" = allChecked ? true : noneChecked ? false : "indeterminate"

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Forms"
        title="Checkbox"
        description="Binary toggle for opt-in or multi-select. Three primitives: Checkbox (raw input), CheckboxField (label + sublabel + badge + description + action), CheckboxCard (bordered selectable option with leading visual). Supports indeterminate state for table select-all."
      />

      <DocsShadcnTemplate
        name="checkbox"
        heroPreview={
          <div className="flex items-center gap-3">
            <Checkbox id="hero-cb-1" />
            <label htmlFor="hero-cb-1" className="text-sm text-text-strong-950 cursor-pointer">
              Saya menyetujui syarat &amp; ketentuan
            </label>
          </div>
        }
        heroCode={`<Checkbox id="terms" />
<label htmlFor="terms">Saya menyetujui syarat & ketentuan</label>`}
        usageImport={`import { Checkbox, CheckboxField, CheckboxCard } from "@/registry/dash/ui/checkbox"`}
        usageJsx={`<Checkbox checked={value} onCheckedChange={setValue} />`}
        manual={{
          sourcePath: "registry/dash/ui/checkbox.tsx",
          dependencies: ["@radix-ui/react-checkbox"],
        }}
      />

      <DocsSection title="States">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          4 states: unchecked / checked / indeterminate / disabled. Plus stroke variant (primary-bordered when off, used in card surfaces).
        </p>
        <DocsExample
          title="off / on / indeterminate / disabled"
          preview={
            <div className="grid grid-cols-3 gap-x-8 gap-y-3 max-w-xs">
              <Checkbox />
              <Checkbox checked />
              <Checkbox checked="indeterminate" />
              <Checkbox />
              <Checkbox checked />
              <Checkbox checked="indeterminate" />
              <Checkbox className="border-primary" />
              <Checkbox checked />
              <Checkbox checked="indeterminate" />
              <Checkbox disabled />
              <Checkbox disabled checked />
              <Checkbox disabled checked="indeterminate" />
            </div>
          }
          code={`<Checkbox />
<Checkbox checked />
<Checkbox checked="indeterminate" />
<Checkbox disabled />`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          sm (14px) / md (16px Figma default) / lg (20px).
        </p>
        <DocsExample
          title="3 sizes"
          preview={
            <div className="flex items-end gap-6">
              {(["sm","md","lg"] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <Checkbox size={s} checked />
                  <span className="text-[10px] text-text-soft-400">{s}</span>
                </div>
              ))}
            </div>
          }
          code={`<Checkbox size="sm" checked />
<Checkbox size="md" checked />
<Checkbox size="lg" checked />`}
        />
      </DocsSection>

      <DocsSection title="Label patterns">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          CheckboxField composes label + optional sublabel + badge + description + action.
        </p>
        <DocsExample
          title="Sublabel + NEW badge + description + Link action"
          preview={
            <div className="space-y-4 max-w-md">
              <CheckboxField
                label="Label"
                sublabel="(Sublabel)"
                badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>}
              />
              <CheckboxField
                label="Label"
                sublabel="(Sublabel)"
                badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>}
                checked
              />
              <CheckboxField
                label="Label"
                sublabel="(Sublabel)"
                badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>}
                description="Insert the checkbox description here."
                action={<a href="#" className="text-sm font-medium text-primary hover:underline">Link Button</a>}
              />
              <CheckboxField
                label="Label"
                sublabel="(Sublabel)"
                badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>}
                description="Insert the checkbox description here."
                action={<a href="#" className="text-sm font-medium text-primary hover:underline">Link Button</a>}
                checked
              />
            </div>
          }
          code={`<CheckboxField
  label="Label"
  sublabel="(Sublabel)"
  badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>}
  description="Insert the checkbox description here."
  action={<a href="#">Link Button</a>}
/>`}
        />
      </DocsSection>

      <DocsSection title="Card option list">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Bordered selectable rows with leading visual (icon, avatar, brand logo). Checked card gets a primary-color border.
        </p>
        <DocsExample
          title="Leading icon variants"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
              <div className="space-y-3">
                <CheckboxCard label="Label" sublabel="(Sublabel)" badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>} description="Insert the checkbox description here." />
                <CheckboxCard label="Label" sublabel="(Sublabel)" badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>} description="Insert the checkbox description here." checked />
              </div>
              <div className="space-y-3">
                <CheckboxCard
                  label="Label"
                  sublabel="(Sublabel)"
                  badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>}
                  description="Insert the checkbox description here."
                  leading={<span className="size-7 rounded-full bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400"><UserIcon className="size-4" /></span>}
                />
                <CheckboxCard
                  label="Label"
                  sublabel="(Sublabel)"
                  badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>}
                  description="Insert the checkbox description here."
                  checked
                  leading={<span className="size-7 rounded-full bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400"><UserIcon className="size-4" /></span>}
                />
              </div>
              <div className="space-y-3">
                <CheckboxCard
                  label="Label"
                  sublabel="(Sublabel)"
                  badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>}
                  description="Insert the checkbox description here."
                  leading={<Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/80?u=lena" /><AvatarFallback>L</AvatarFallback></Avatar>}
                />
                <CheckboxCard
                  label="Label"
                  sublabel="(Sublabel)"
                  badge={<Badge status="information" appearance="lighter" size="sm">NEW</Badge>}
                  description="Insert the checkbox description here."
                  checked
                  leading={<Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/80?u=lena" /><AvatarFallback>L</AvatarFallback></Avatar>}
                />
              </div>
            </div>
          }
          code={`<CheckboxCard
  label="Label"
  sublabel="(Sublabel)"
  badge={<Badge>NEW</Badge>}
  description="Insert the checkbox description here."
  leading={<Avatar size="sm">...</Avatar>}
/>`}
        />
      </DocsSection>

      <DocsSection title="Authentication Settings — inline list">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Plain CheckboxField list inside a settings card. No card border per item — just stacked rows under a section heading.
        </p>
        <DocsExample
          title="Two-Factor Authentication"
          preview={
            <div className="max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-(--shadow-custom-sm)">
              <header className="flex items-center gap-3 p-4">
                <span className="size-8 rounded-full bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400">
                  <Settings className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-text-strong-950">Authentication Settings</div>
                  <div className="text-xs text-text-sub-600">Edit your preferences for authentication settings.</div>
                </div>
              </header>
              <div className="px-4 pb-4">
                <div className="border-t border-stroke-soft-200 pt-4 space-y-3">
                  <div className="text-sm font-medium text-text-strong-950">Two-Factor Authentication</div>
                  <CheckboxField label="SMS Verification" checked={twoFactor.sms} onCheckedChange={(v) => setTwoFactor({ ...twoFactor, sms: v === true })} />
                  <CheckboxField label="Authenticator App" checked={twoFactor.app} onCheckedChange={(v) => setTwoFactor({ ...twoFactor, app: v === true })} />
                </div>
                <div className="border-t border-stroke-soft-200 pt-4 mt-4 space-y-1">
                  <div className="text-sm font-medium text-text-strong-950">Password Strength</div>
                  <p className="text-xs text-text-sub-600 leading-relaxed">For enhanced security measures, it is highly recommended to consistently create and utilize strong, well-generated passwords.</p>
                </div>
                <div className="border-t border-stroke-soft-200 pt-4 mt-4 space-y-1">
                  <div className="text-sm font-medium text-text-strong-950">Allowing Apex to Protect Your Data</div>
                  <p className="text-xs text-text-sub-600">To learn more about how Apex protects your data</p>
                  <a href="#" className="text-sm font-medium text-primary underline underline-offset-4">Read Privacy Policy</a>
                </div>
              </div>
            </div>
          }
          code={`<CheckboxField label="SMS Verification" checked={sms} onCheckedChange={setSms} />
<CheckboxField label="Authenticator App" checked={app} onCheckedChange={setApp} />`}
        />
      </DocsSection>

      <DocsSection title="Mutually-exclusive cards">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Treat CheckboxCard as a radio-like single-select via controlled state. Pair the selected option with a "Suggested" badge to indicate the recommended default.
        </p>
        <DocsExample
          title='"Personalize your tour" — Suggested + Self-guided'
          preview={
            <div className="max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-(--shadow-custom-sm)">
              <div className="flex items-center gap-3 mb-4">
                <span className="size-8 rounded-full bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400">
                  <Tune className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-text-strong-950">Personalize your tour experience</div>
                  <div className="text-xs text-text-sub-600">Personalize your tour with or without a guide.</div>
                </div>
              </div>
              <div className="space-y-3">
                <CheckboxCard
                  label="Yes, I want a guide"
                  badge={<Badge status="feature" appearance="lighter" size="sm">Suggested</Badge>}
                  description="Enhance your experience with the expertise and insights of a knowledgeable guide who will accompany you throughout the tour, providing valuable information and context."
                  action={<a href="#" className="text-sm font-medium text-primary hover:underline">Meet our guides</a>}
                  checked={tour === "guide"}
                  onCheckedChange={() => setTour("guide")}
                />
                <CheckboxCard
                  label="No, I prefer self-guided"
                  description="Explore at your own pace and immerse yourself in the tour experience with the freedom to navigate independently, discovering the highlights and hidden gems on your own terms."
                  checked={tour === "self"}
                  onCheckedChange={() => setTour("self")}
                />
              </div>
              <Button tone="neutral" style="stroke" className="w-full mt-4">Save Changes</Button>
            </div>
          }
          code={`<CheckboxCard
  label="Yes, I want a guide"
  badge={<Badge status="feature" appearance="lighter">Suggested</Badge>}
  description="..."
  checked={tour === "guide"}
  onCheckedChange={() => setTour("guide")}
/>`}
        />
      </DocsSection>

      <DocsSection title="Inline confirmation">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          One-shot confirmation checkbox inside a dialog or callout. Pairs with primary CTA — disable CTA until the box is checked.
        </p>
        <DocsExample
          title='"I have saved the meeting link"'
          preview={
            <div className="max-w-sm rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 space-y-3 shadow-(--shadow-custom-sm)">
              <div>
                <div className="text-sm font-semibold text-text-strong-950">Generate meeting link</div>
                <div className="text-xs text-text-sub-600">Link is one-time only, copy before closing.</div>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-stroke-soft-200 px-3 py-2">
                <span className="size-3.5 inline-flex items-center justify-center text-icon-soft-400">🔗</span>
                <span className="flex-1 text-sm text-text-strong-950 truncate font-mono">https://meet.example.com/abc-def-ghi</span>
                <button aria-label="Copy" className="size-5 text-icon-soft-400 hover:text-text-strong-950"><Copy className="size-3.5" /></button>
              </div>
              <CheckboxField label="I have saved the meeting link." checked={savedLink} onCheckedChange={(v) => setSavedLink(v === true)} />
              <div className="flex items-center gap-2 pt-2">
                <Button tone="neutral" style="stroke" className="flex-1">Create new link</Button>
                <Button tone="neutral" disabled={!savedLink} className="flex-1">Complete</Button>
              </div>
            </div>
          }
          code={`<CheckboxField label="I have saved the meeting link." checked={saved} onCheckedChange={setSaved} />
<Button disabled={!saved}>Complete</Button>`}
        />
      </DocsSection>

      <DocsSection title="Table select-all (indeterminate)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Header checkbox enters <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">indeterminate</code> state when some (not all) rows are selected. Clicking it toggles all rows.
        </p>
        <DocsExample
          title="Financial transactions"
          preview={
            <div className="max-w-lg rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-(--shadow-custom-sm)">
              <div className="mb-3">
                <div className="text-sm font-semibold text-text-strong-950">Select Financial Transactions</div>
                <div className="text-xs text-text-sub-600">View and manage your transaction history.</div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 inline-flex items-center gap-2 h-8 px-3 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-soft-400">
                  <Search className="size-3.5" /> Search...
                </div>
                <Button size="sm" tone="neutral" style="stroke" rightIcon={<ChevronDown />}>All transactions</Button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke-soft-200">
                    <th className="w-6 py-2">
                      <Checkbox
                        checked={headerChecked}
                        onCheckedChange={(v) => setRows(rows.map(() => v === true))}
                      />
                    </th>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-soft-400 font-medium px-2">Name</th>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-soft-400 font-medium px-2">Amount</th>
                    <th className="text-left text-[11px] uppercase tracking-wider text-text-soft-400 font-medium px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.id} className="border-b border-stroke-soft-200 last:border-0">
                      <td className="py-2">
                        <Checkbox
                          checked={rows[i]}
                          onCheckedChange={(v) => setRows(rows.map((r, j) => (j === i ? v === true : r)))}
                        />
                      </td>
                      <td className={`px-2 py-2 ${rows[i] ? "text-text-strong-950 font-medium" : "text-text-sub-600"}`}>{t.name}</td>
                      <td className="px-2 py-2 text-text-sub-600">{t.amount}</td>
                      <td className="px-2 py-2 text-text-sub-600">{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          code={`const headerChecked = allChecked ? true : noneChecked ? false : "indeterminate"

<Checkbox checked={headerChecked} onCheckedChange={(v) => setRows(rows.map(() => v === true))} />
{rows.map((r, i) => <Checkbox checked={r} onCheckedChange={(v) => toggle(i, v)} />)}`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Tribe permission grid — ops onboarding"
          description="Saat ops invite dispatcher baru, mereka pilih tribe mana saja yang dispatcher boleh akses. Multi-select karena satu dispatcher bisa handle lebih dari 1 tribe."
          preview={
            <div className="w-full max-w-md space-y-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
              <div className="text-sm font-semibold text-text-strong-950">Akses tribe</div>
              <div className="grid grid-cols-2 gap-2">
                <CheckboxField label="Express" sublabel="Roda 2 instant" defaultChecked />
                <CheckboxField label="Reservasi" sublabel="Delivery scheduled" defaultChecked />
                <CheckboxField label="X-Dock" sublabel="Hub-to-hub" />
                <CheckboxField label="4-Wheel" sublabel="Mobil & pickup" />
                <CheckboxField label="Canvasser" sublabel="Rental harian" />
                <CheckboxField label="Outsourcing" sublabel="Mitra eksternal" disabled />
              </div>
            </div>
          }
          code={`<CheckboxField label="Express" sublabel="Roda 2 instant" defaultChecked />
<CheckboxField label="Reservasi" sublabel="Delivery scheduled" defaultChecked />
<CheckboxField label="X-Dock" sublabel="Hub-to-hub" />
<CheckboxField label="4-Wheel" sublabel="Mobil & pickup" />
<CheckboxField label="Outsourcing" sublabel="Mitra eksternal" disabled />`}
        />

        <DocsExample
          title="Bulk action — suspended mitra list"
          description="Select-all header dengan indeterminate state. Ops centang sebagian mitra untuk bulk-reactivate setelah investigasi."
          preview={
            <div className="w-full max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-stroke-soft-200 bg-bg-weak-50 px-3 py-2">
                <Checkbox checked="indeterminate" />
                <span className="text-xs font-medium text-text-strong-950">2 dari 4 mitra dipilih</span>
                <Button size="xs" className="ml-auto">Reaktivasi (2)</Button>
              </div>
              {[
                { id: "mtr-9412", name: "Fauzan Kurniawan", reason: "3 dispatch ditolak", checked: true },
                { id: "mtr-9418", name: "Rizky Pratama", reason: "Idle 7 hari", checked: true },
                { id: "mtr-9419", name: "Andi Wijayanto", reason: "GPS spoof flag", checked: false },
                { id: "mtr-9425", name: "Rina Saputri", reason: "Manual ops review", checked: false },
              ].map((m) => (
                <div key={m.id} className="flex items-center gap-3 border-b border-stroke-soft-200 px-3 py-2 last:border-b-0">
                  <Checkbox checked={m.checked} />
                  <div className="flex-1">
                    <div className="text-sm text-text-strong-950">{m.name} · <span className="text-text-sub-600 text-xs">{m.id}</span></div>
                    <div className="text-xs text-text-sub-600">{m.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          }
          code={`<Checkbox
  checked={headerChecked} // "indeterminate" | true | false
  onCheckedChange={(v) => setRows(rows.map(() => v === true))}
/>
{rows.map((row) => (
  <Checkbox
    checked={row.selected}
    onCheckedChange={(v) => toggleRow(row.id, v)}
  />
))}`}
        />

        <DocsExample
          title="Audit confirmation"
          description="Sebelum submit suspend permanent, ops harus centang acknowledgement. Mandatory checkbox sebelum primary action enable."
          preview={
            <div className="w-full max-w-md space-y-3 rounded-xl border border-(--state-error-base) bg-(--state-error-light) p-4">
              <div className="text-sm font-semibold text-text-strong-950">Konfirmasi suspend permanen</div>
              <CheckboxField
                label="Saya sudah review log dispatch 30 hari terakhir"
                sublabel="Tindakan ini masuk audit trail dan tidak bisa di-undo."
              />
              <CheckboxField
                label="Saya sudah konfirmasi via WhatsApp ke mitra"
                sublabel="Bukti screenshot wajib di-upload setelah submit."
              />
              <Button tone="destructive" disabled className="w-full">Suspend permanen</Button>
            </div>
          }
          code={`<CheckboxField
  label="Saya sudah review log dispatch 30 hari terakhir"
  sublabel="Tindakan ini masuk audit trail dan tidak bisa di-undo."
/>
<CheckboxField
  label="Saya sudah konfirmasi via WhatsApp ke mitra"
  sublabel="Bukti screenshot wajib di-upload setelah submit."
/>
<Button tone="destructive" disabled={!allAcknowledged}>
  Suspend permanen
</Button>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Checkbox = multi-select (banyak pilihan boleh). Untuk pilihan tunggal pakai Radio. Untuk on/off action pakai Switch. Pakai indeterminate hanya untuk select-all parent.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-2 w-full max-w-xs">
                <div className="text-xs text-text-strong-950 font-medium">Filter tribe:</div>
                <CheckboxField label="Reservasi" checked />
                <CheckboxField label="Express" checked />
                <CheckboxField label="Bulk" />
              </div>
            ),
            caption: "Multi-select filter (dispatcher boleh pilih 2-3 tribe sekaligus). Checkbox = paham bisa pilih lebih dari satu.",
          }}
          dont={{
            preview: (
              <div className="space-y-2 w-full max-w-xs">
                <div className="text-xs text-text-strong-950 font-medium">Pilih tipe akun:</div>
                <CheckboxField label="Mitra Reguler" checked />
                <CheckboxField label="Mitra Premium" />
              </div>
            ),
            caption: "Pilihan yang mutually-exclusive (1 mitra cuma 1 tipe) = WAJIB pakai Radio, jangan Checkbox. User kira boleh pilih dua.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-2 w-full max-w-xs">
                <div className="flex items-center gap-2">
                  <Checkbox checked="indeterminate" />
                  <span className="text-xs text-text-strong-950 font-medium">3 dari 8 mitra dipilih</span>
                </div>
                <div className="ml-6 space-y-1 text-xs text-text-sub-600">
                  <div className="flex items-center gap-2"><Checkbox checked size="sm" /> mtr-9412</div>
                  <div className="flex items-center gap-2"><Checkbox size="sm" /> mtr-7821</div>
                  <div className="flex items-center gap-2"><Checkbox checked size="sm" /> mtr-3045</div>
                </div>
              </div>
            ),
            caption: "Header indeterminate saat sebagian row checked. Klik header = toggle semua. Pola table select-all bulk action.",
          }}
          dont={{
            preview: (
              <CheckboxField label="Anda menyetujui semua syarat" checked="indeterminate" />
            ),
            caption: "Indeterminate untuk satu checkbox tunggal (bukan parent-of-children) = user bingung apa artinya. Pakai checked atau unchecked, tidak ada tengah.",
          }}
        />
      </DocsSection>

      <DocsSection title="API" id="api">
        <DocsApiTable
          idPrefix="checkbox-prop"
          rows={[
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "14 / 16 / 20 px box size." },
            { name: "tone", type: '"primary" | "destructive"', defaultValue: '"primary"', description: "Filled color when checked. destructive = error-base." },
            { name: "checked", type: 'boolean | "indeterminate"', description: "Controlled state. indeterminate renders the minus icon (used for table select-all)." },
            { name: "onCheckedChange", type: "(checked: boolean | 'indeterminate') => void", description: "Fires on toggle." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Disabled state — opacity 50, cursor not-allowed." },
            { name: "CheckboxField.label", type: "ReactNode", description: "Primary label (clickable)." },
            { name: "CheckboxField.sublabel", type: "ReactNode", description: "Inline secondary text after label (e.g. parenthesized hint)." },
            { name: "CheckboxField.badge", type: "ReactNode", description: "Trailing badge slot — typically Badge.NEW pill." },
            { name: "CheckboxField.description", type: "ReactNode", description: "Block description below label row." },
            { name: "CheckboxField.action", type: "ReactNode", description: "Action link below description (anchor or LinkButton)." },
            { name: "CheckboxField.controlPosition", type: '"left" | "right"', defaultValue: '"left"', description: "Position of checkbox relative to label body." },
            { name: "CheckboxCard.leading", type: "ReactNode", description: "Optional leading visual — icon, Avatar, brand mark." },
            { name: "CheckboxCard.selected", type: "boolean", description: "Override the active-border tone. Defaults to checked." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
