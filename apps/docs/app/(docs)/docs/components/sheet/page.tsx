"use client"

import { Button } from "@/registry/dash/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
} from "@/registry/dash/ui/sheet"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SheetDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Overlays"
        title="Sheet"
        description="Generic large side panel — desktop counterpart to Drawer (which is mobile-bottom-anchored). 4 sides × 5 sizes. Use for inspector panels, edit forms anchored to a list item, multi-step setup wizards."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add sheet`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Right-side mitra detail"
          preview={
            <Sheet>
              <SheetTrigger asChild>
                <Button>Open mitra detail</Button>
              </SheetTrigger>
              <SheetContent side="right" size="lg">
                <SheetHeader>
                  <SheetTitle>mtr-9412 · Sigit P.</SheetTitle>
                  <SheetDescription>Reservasi · Bekasi · joined Jul 2025</SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <p className="text-sm text-text-sub-600">142 trips completed. Last dispatch: 18m ago.</p>
                </SheetBody>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button tone="neutral" style="stroke">Close</Button>
                  </SheetClose>
                  <Button tone="destructive">Suspend</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          }
          code={`<Sheet>
  <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
  <SheetContent side="right" size="lg">
    <SheetHeader>
      <SheetTitle>mtr-9412 · Sigit P.</SheetTitle>
      <SheetDescription>Reservasi · Bekasi</SheetDescription>
    </SheetHeader>
    <SheetBody>…</SheetBody>
    <SheetFooter>
      <SheetClose asChild><Button>Close</Button></SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>`}
        />

        <DocsExample
          title="Sides"
          preview={
            <div className="flex flex-wrap gap-2">
              {(["right", "left", "top", "bottom"] as const).map((s) => (
                <Sheet key={s}>
                  <SheetTrigger asChild>
                    <Button tone="neutral" style="stroke">{s}</Button>
                  </SheetTrigger>
                  <SheetContent side={s}>
                    <SheetHeader>
                      <SheetTitle>side={s}</SheetTitle>
                    </SheetHeader>
                    <SheetBody>Body anchored to {s}.</SheetBody>
                  </SheetContent>
                </Sheet>
              ))}
            </div>
          }
          code={`<SheetContent side="right" />
<SheetContent side="left" />
<SheetContent side="top" />
<SheetContent side="bottom" />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Sheet adalah inspector panel — anchored ke konteks (row di tabel, item di list). Bukan dialog terpusat.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex w-full max-w-xs gap-2">
                <div className="flex-1 rounded border border-stroke-soft-200 p-2 text-xs text-text-sub-600">Mitra list (16 rows)</div>
                <div className="w-32 rounded border border-stroke-soft-200 bg-bg-weak-50 p-2">
                  <div className="text-xs font-semibold">mtr-9412</div>
                  <div className="text-[10px] text-text-sub-600">Active · 142 trip</div>
                </div>
              </div>
            ),
            caption: "Sheet anchored right side, list tetap visible. Dispatcher bisa klik mitra lain tanpa close → reopen.",
          }}
          dont={{
            preview: (
              <div className="flex flex-col w-full max-w-xs gap-2">
                <div className="rounded border border-stroke-soft-200 p-2 text-xs">
                  <div className="font-semibold mb-1">Edit profil mitra (form 12 fields)</div>
                  <div className="text-text-sub-600">NIK · SIM · NPWP · alamat · bank · …</div>
                </div>
              </div>
            ),
            caption: "Jangan pakai Sheet untuk full-page edit dengan 10+ field. Itu butuh halaman sendiri /mitra/[id]/edit.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Sheet untuk inspector (Mitra detail), wizard 2-3 step (Setup polygon shift), filter advanced (Mitra search filters).",
          }}
          dont={{
            caption: "Jangan pakai Sheet untuk konfirmasi destruktif. Itu pakai Alert Dialog. Jangan pakai Sheet bottom di desktop — pakai Drawer untuk mobile saja.",
          }}
        />
      </DocsSection>

      <DocsSection title="When to use vs Drawer / Modal">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Modal</strong> = focused atomic task (confirmation, single form).</li>
          <li>• <strong>Sheet</strong> = larger desktop panel anchored to a screen edge.</li>
          <li>• <strong>Drawer</strong> = mobile-first bottom panel (touch-drag dismiss).</li>
        </ul>
      </DocsSection>

      <DocsSection title="More examples">
        <DocsExample
          title="Sizes (right side)"
          preview={
            <div className="flex flex-wrap gap-2">
              {(["sm", "md", "lg", "xl", "full"] as const).map((s) => (
                <Sheet key={s}>
                  <SheetTrigger asChild><Button tone="neutral" style="stroke" size="sm">{s}</Button></SheetTrigger>
                  <SheetContent side="right" size={s}>
                    <SheetHeader>
                      <SheetTitle>size={s}</SheetTitle>
                    </SheetHeader>
                    <SheetBody>Right side · size {s}.</SheetBody>
                  </SheetContent>
                </Sheet>
              ))}
            </div>
          }
          code={`<SheetContent side="right" size="sm" />
<SheetContent side="right" size="md" />
<SheetContent side="right" size="lg" />
<SheetContent side="right" size="xl" />
<SheetContent side="right" size="full" />`}
        />

        <DocsExample
          title="Filter builder (left side)"
          description="Long filter form anchored to left rail — keeps the table visible on the right."
          preview={
            <Sheet>
              <SheetTrigger asChild>
                <Button tone="neutral" style="stroke">Filter mitra</Button>
              </SheetTrigger>
              <SheetContent side="left" size="md">
                <SheetHeader>
                  <SheetTitle>Filter mitra</SheetTitle>
                  <SheetDescription>Filter aktif berlaku ke tabel di kanan.</SheetDescription>
                </SheetHeader>
                <SheetBody className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Tribe</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="xs" tone="neutral" style="stroke">Reservasi</Button>
                      <Button size="xs" tone="neutral" style="stroke">Express</Button>
                      <Button size="xs" tone="neutral" style="stroke">Bulk</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Kota</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="xs" tone="neutral" style="stroke">Bekasi</Button>
                      <Button size="xs" tone="neutral" style="stroke">Tangerang</Button>
                      <Button size="xs" tone="neutral" style="stroke">Bandung</Button>
                      <Button size="xs" tone="neutral" style="stroke">Surabaya</Button>
                    </div>
                  </div>
                </SheetBody>
                <SheetFooter>
                  <SheetClose asChild><Button tone="neutral" style="stroke">Reset</Button></SheetClose>
                  <Button>Apply</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          }
          code={`<Sheet>
  <SheetTrigger><Button>Filter mitra</Button></SheetTrigger>
  <SheetContent side="left" size="md">
    <SheetHeader>
      <SheetTitle>Filter mitra</SheetTitle>
    </SheetHeader>
    <SheetBody>{/* filter form */}</SheetBody>
    <SheetFooter>
      <SheetClose asChild><Button>Reset</Button></SheetClose>
      <Button>Apply</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold text-text-strong-950 pt-2">SheetContent</h3>
        <DocsPropsTable
          rows={[
            { name: "side", type: '"right" | "left" | "top" | "bottom"', defaultValue: '"right"', description: "Anchored edge." },
            { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full"', defaultValue: '"md"', description: "Width (left/right) or height (top/bottom)." },
            { name: "showClose", type: "boolean", defaultValue: "true", description: "Show built-in close X in top right." },
            { name: "onEscapeKeyDown / onPointerDownOutside", type: "(event) => void", description: "Override default close behaviour." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">Slots</h3>
        <DocsPropsTable
          rows={[
            { name: "Sheet", type: "root", description: "Dialog root; owns open state." },
            { name: "SheetTrigger", type: "trigger", description: "Opens sheet; use asChild on Button." },
            { name: "SheetClose", type: "close helper", description: "Dismiss via asChild wrap." },
            { name: "SheetHeader / Body / Footer", type: "layout slots", description: "Identical to Modal — header pinned top, body scrolls, footer pinned bottom." },
            { name: "SheetTitle / SheetDescription", type: "a11y", description: "Wired automatically into aria-labelledby / aria-describedby." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Built on Radix Dialog (same as Modal) but anchored to a screen edge.</li>
          <li>• Size dimension depends on side: left/right uses <em>width</em>; top/bottom uses <em>height</em>.</li>
          <li>• <code className="text-xs">size=&quot;full&quot;</code> covers the entire viewport — useful for mobile-style takeovers on desktop.</li>
          <li>• For mobile-only bottom-anchored panels, use Drawer (touch-drag dismiss).</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Focus trap + restore on close (Radix Dialog semantics).</li>
          <li>• <code className="text-xs">Esc</code> closes; click outside closes; <code className="text-xs">Tab</code> cycles inside.</li>
          <li>• Always render <code className="text-xs">SheetTitle</code> — required for <code className="text-xs">aria-labelledby</code>. Add <code className="text-xs">SheetDescription</code> when context isn&apos;t obvious from the title.</li>
          <li>• Body scroll is locked while open.</li>
          <li>• Honors <code className="text-xs">prefers-reduced-motion</code> — slide-in animation collapses to fade on supported OSes.</li>
          <li>• Place primary action <em>right</em> in footer for LTR locales (Apply / Save), secondary left (Reset / Cancel).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
