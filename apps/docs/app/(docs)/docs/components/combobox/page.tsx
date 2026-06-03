"use client"

import { useState } from "react"
import { Combobox } from "@/registry/dash/ui/combobox"
import { Label } from "@/registry/dash/ui/label"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const cities = [
  { value: "jakarta", label: "Jakarta", description: "DKI Jakarta" },
  { value: "bekasi", label: "Bekasi", description: "Jawa Barat" },
  { value: "tangerang", label: "Tangerang", description: "Banten" },
  { value: "bandung", label: "Bandung", description: "Jawa Barat" },
  { value: "surabaya", label: "Surabaya", description: "Jawa Timur" },
  { value: "medan", label: "Medan", description: "Sumatera Utara" },
  { value: "makassar", label: "Makassar", description: "Sulawesi Selatan" },
  { value: "denpasar", label: "Denpasar", description: "Bali" },
]

export default function ComboboxDocsPage() {
  const [city, setCity] = useState("bekasi")

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Form"
        title="Combobox"
        description="Searchable single-select dropdown. Use when option list is large (≥10 items) or needs free-text search. For small known sets use Select."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add combobox`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Single self-contained component. Internally it composes a Popover (trigger + portalled content), a Command list with its search input, virtualised option rows, and a selected-value indicator. You drive it from the outside with a flat <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">options</code> array + controlled <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">value</code>; no sub-components are exposed.
        </p>
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="City picker"
          preview={
            <div className="space-y-1.5 max-w-sm">
              <Label>Kota operasi</Label>
              <Combobox
                options={cities}
                value={city}
                onValueChange={setCity}
                placeholder="Pilih kota…"
                searchPlaceholder="Cari kota…"
                aria-label="City"
              />
              <p className="text-xs text-text-sub-600">Pilihan: <span className="">{city}</span></p>
            </div>
          }
          code={`<Combobox
  options={cities}
  value={city}
  onValueChange={setCity}
  placeholder="Pilih kota…"
  searchPlaceholder="Cari kota…"
/>`}
        />

        <DocsExample
          title="With option description"
          description="Description renders under the label inside the popover — useful for ambiguous codes."
          preview={
            <div className="space-y-1.5 max-w-sm">
              <Label>Pilih zone dispatch</Label>
              <Combobox
                options={[
                  { value: "jksel", label: "JKSEL", description: "Jakarta Selatan — Kemang, Kebayoran, Pondok Indah" },
                  { value: "jktim", label: "JKTIM", description: "Jakarta Timur — Cawang, Rawamangun, Pulogadung" },
                  { value: "bksbar", label: "BKSBAR", description: "Bekasi Barat — Harapan Indah, Bintara" },
                  { value: "bkstim", label: "BKSTIM", description: "Bekasi Timur — Tambun, Cikarang" },
                ]}
                placeholder="Pilih zone…"
                searchPlaceholder="Cari kode atau nama area…"
                aria-label="Dispatch zone"
              />
            </div>
          }
          code={`<Combobox
  options={[
    { value: "jksel", label: "JKSEL", description: "Jakarta Selatan — Kemang …" },
    { value: "jktim", label: "JKTIM", description: "Jakarta Timur — …" },
  ]}
  placeholder="Pilih zone…"
  searchPlaceholder="Cari kode atau nama…"
/>`}
        />

        <DocsExample
          title="With disabled option"
          preview={
            <div className="space-y-1.5 max-w-sm">
              <Label>Tribe target</Label>
              <Combobox
                options={[
                  { value: "reservasi", label: "Reservasi" },
                  { value: "express", label: "Express" },
                  { value: "bulk", label: "Bulk", disabled: true, description: "Belum tersedia untuk mitra Bekasi" },
                  { value: "halo-dash", label: "Halo-dash" },
                ]}
                aria-label="Tribe"
              />
            </div>
          }
          code={`<Combobox
  options={[
    { value: "reservasi", label: "Reservasi" },
    { value: "bulk", label: "Bulk", disabled: true, description: "Belum tersedia" },
  ]}
/>`}
        />

        <DocsExample
          title="Inside a form field"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 max-w-sm space-y-3">
              <div className="space-y-1.5">
                <Label>Nama mitra</Label>
                <div className="h-9 rounded-md border border-stroke-soft-200 px-3 flex items-center text-sm text-text-soft-400">
                  Sigit P.
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Kota operasi</Label>
                <Combobox options={cities} aria-label="City" />
                <p className="text-xs text-text-sub-600">
                  Mitra akan dispatch dalam radius 5 km dari kota terpilih.
                </p>
              </div>
            </div>
          }
          code={`<Field>
  <Label>Kota operasi</Label>
  <Combobox options={cities} />
  <FieldDescription>Dispatch dalam radius 5 km.</FieldDescription>
</Field>`}
        />

        <DocsExample
          title="Empty result state"
          description="Trigger by searching for a term that doesn't match any option."
          preview={
            <div className="space-y-1.5 max-w-sm">
              <Label>Cari kota</Label>
              <Combobox
                options={cities}
                placeholder="Pilih kota…"
                searchPlaceholder="Coba 'Pontianak'…"
                emptyText="Belum ada operasi di kota tersebut. Hubungi Halo-dash Ops untuk request ekspansi."
                aria-label="City search"
              />
            </div>
          }
          code={`<Combobox
  options={cities}
  emptyText="Belum ada operasi di kota tersebut. Hubungi Ops."
  searchPlaceholder="Cari kota…"
/>`}
        />

        <DocsExample
          title="Disabled combobox"
          preview={
            <div className="space-y-1.5 max-w-sm">
              <Label>Kota operasi (locked)</Label>
              <Combobox options={cities} disabled placeholder="Lebaran freeze" aria-label="City locked" />
              <p className="text-xs text-text-sub-600">Dibuka kembali 2026-05-16.</p>
            </div>
          }
          code={`<Combobox options={cities} disabled placeholder="Lebaran freeze" />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Combobox = filter-as-type. Pakai untuk list panjang (50+ opsi) atau yang user sudah tahu nama target.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs text-xs">
                <div className="mb-1 text-text-sub-600">Cari mitra by nama</div>
                <div className="rounded border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5">
                  <span className="text-text-soft-400">sigi│</span>
                </div>
                <div className="mt-1 rounded border border-stroke-soft-200 bg-bg-white-0 p-1 space-y-0.5">
                  <div className="rounded bg-bg-weak-50 px-2 py-1">Sigit P. · mtr-9412</div>
                  <div className="rounded px-2 py-1">Sigit R. · mtr-7331</div>
                </div>
              </div>
            ),
            caption: "Filter 1,284 mitra dengan typing 4 huruf. Dispatcher ketik nama langsung, bukan scroll list.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs">
                <div className="mb-1 text-text-sub-600">Status</div>
                <div className="rounded border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5">
                  <span className="text-text-soft-400">Cari status…</span>
                </div>
              </div>
            ),
            caption: "Jangan pakai Combobox untuk 3 status (Active/Suspended/Pending). Itu pakai Select — overkill kalau cuma 3.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Sertakan secondary info di item: \"Sigit P. · mtr-9412 · Reservasi\". Mitra duplicate name jadi distinguishable.",
          }}
          dont={{
            caption: "Jangan tampilkan 5,000 row tanpa virtualization. Combobox tetap perlu paginate atau debounce server search.",
          }}
        />
      </DocsSection>

      <DocsSection title="When to use vs Select">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Combobox</strong> = searchable list, free-text input, ≥10 options.</li>
          <li>• <strong>Select</strong> = known small set (&lt;10), no search needed.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "options", type: "ComboboxOption[]", description: "{ value, label, description?, disabled? }." },
            { name: "value", type: "string", description: "Controlled selected value." },
            { name: "onValueChange", type: "(value: string) => void", description: "Fired on selection." },
            { name: "placeholder", type: "string", defaultValue: '"Pilih opsi…"', description: "Trigger empty state text." },
            { name: "searchPlaceholder", type: "string", defaultValue: '"Cari…"', description: "Search input placeholder." },
            { name: "emptyText", type: "string", defaultValue: '"Tidak ada hasil."', description: "Shown when no options match search." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Disable trigger." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <p className="text-sm text-text-sub-600">Composed from <a href="https://www.radix-ui.com/primitives/docs/components/popover" target="_blank" rel="noreferrer" className="underline">Radix Popover</a> + Command (cmdk).</p>
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — trigger is <code className="text-xs">role=&quot;combobox&quot;</code> with <code className="text-xs">aria-expanded</code>, <code className="text-xs">aria-controls</code>, <code className="text-xs">aria-haspopup=&quot;listbox&quot;</code>. List inside is <code className="text-xs">role=&quot;listbox&quot;</code>.</li>
          <li>• <strong>Keyboard</strong>
            <ul className="ml-6 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li><code className="text-xs">Enter</code> / <code className="text-xs">Space</code> / <code className="text-xs">↓</code> opens the popover.</li>
              <li><code className="text-xs">↑</code> / <code className="text-xs">↓</code> walks options. <code className="text-xs">Home</code> / <code className="text-xs">End</code> jumps to first/last.</li>
              <li>Typing filters the list — cmdk does fuzzy matching.</li>
              <li><code className="text-xs">Enter</code> selects the highlighted option.</li>
              <li><code className="text-xs">Esc</code> closes the popover without selecting.</li>
            </ul>
          </li>
          <li>• <strong>ARIA you add</strong> — pass <code className="text-xs">aria-label</code> on Combobox when there&apos;s no visible Label.</li>
          <li>• <strong>Reduced motion</strong> — popover open/close fade respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
