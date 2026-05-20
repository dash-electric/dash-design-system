"use client"

import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Hint } from "@/registry/dash/ui/hint"
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
} from "@/registry/dash/ui/modal"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ModalDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Overlays"
        title="Modal"
        description="Centered dialog for focused tasks — confirmation, short form, or detail view. Blocks the page until dismissed. For side-anchored panels use Drawer; for long-form editing use a dedicated page."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add modal`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import {
  Modal, ModalTrigger, ModalContent,
  ModalHeader, ModalTitle, ModalDescription,
  ModalBody, ModalFooter, ModalClose,
} from "@/registry/dash/ui/modal"

<Modal>
  <ModalTrigger asChild><Button>Open</Button></ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Suspend mtr-9412?</ModalTitle>
      <ModalDescription>…</ModalDescription>
    </ModalHeader>
    <ModalBody>…</ModalBody>
    <ModalFooter>
      <ModalClose asChild><Button style="stroke">Batal</Button></ModalClose>
      <Button tone="destructive">Suspend</Button>
    </ModalFooter>
  </ModalContent>
</Modal>`}
        />
      </DocsSection>

      <DocsSection title="Examples" description="Confirm, form, sizes, scrollable body, no header.">
        <DocsExample
          title="Destructive confirm"
          description="Single-action dialog with cancel + primary destructive button. Always include a reversible escape hatch in the body copy."
          preview={
            <Modal>
              <ModalTrigger asChild>
                <Button>Suspend mitra mtr-9412</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>Suspend mtr-9412?</ModalTitle>
                  <ModalDescription>
                    Mitra Reservasi tribe ini akan auto-suspend selama 7 hari. Dispatch otomatis akan
                    skip akun ini selama periode suspend.
                  </ModalDescription>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm text-text-sub-600">
                    Tindakan ini bisa di-revert manual oleh Halo-dash Ops sebelum 7 hari berakhir.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <ModalClose asChild>
                    <Button tone="neutral" style="stroke">Batal</Button>
                  </ModalClose>
                  <Button tone="destructive">Suspend</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          }
          code={`<Modal>
  <ModalTrigger asChild><Button>Suspend mitra mtr-9412</Button></ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Suspend mtr-9412?</ModalTitle>
      <ModalDescription>Auto-suspend 7 hari, dispatch skip akun ini.</ModalDescription>
    </ModalHeader>
    <ModalBody>Tindakan bisa di-revert oleh Halo-dash Ops.</ModalBody>
    <ModalFooter>
      <ModalClose asChild><Button style="stroke">Batal</Button></ModalClose>
      <Button tone="destructive">Suspend</Button>
    </ModalFooter>
  </ModalContent>
</Modal>`}
        />

        <DocsExample
          title="Form dialog"
          description="Short inline form. For more than 3 fields, switch to Drawer or a dedicated page."
          preview={
            <Modal>
              <ModalTrigger asChild>
                <Button>Tambah mitra Express</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>Tambah mitra Express</ModalTitle>
                  <ModalDescription>Onboarding cepat untuk tribe Express, Bekasi region.</ModalDescription>
                </ModalHeader>
                <ModalBody className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="m-name" required>Nama lengkap</Label>
                    <InputRoot><Input id="m-name" placeholder="Sigit P." /></InputRoot>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-phone" required hint="format: 08xx-xxxx-xxxx">Nomor HP</Label>
                    <InputRoot><Input id="m-phone" placeholder="0812-3456-7890" /></InputRoot>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-notes" optional>Catatan onboarding</Label>
                    <Textarea id="m-notes" rows={3} placeholder="Catatan untuk Halo-dash Ops…" />
                    <Hint>Tersimpan di audit log mitra.</Hint>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <ModalClose asChild>
                    <Button tone="neutral" style="stroke">Batal</Button>
                  </ModalClose>
                  <Button>Simpan</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          }
          code={`<Modal>
  <ModalTrigger asChild><Button>Tambah mitra Express</Button></ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Tambah mitra Express</ModalTitle>
      <ModalDescription>Onboarding cepat.</ModalDescription>
    </ModalHeader>
    <ModalBody className="space-y-4">
      <Label htmlFor="m-name" required>Nama lengkap</Label>
      <InputRoot><Input id="m-name" /></InputRoot>
      …
    </ModalBody>
    <ModalFooter>
      <ModalClose asChild><Button style="stroke">Batal</Button></ModalClose>
      <Button>Simpan</Button>
    </ModalFooter>
  </ModalContent>
</Modal>`}
        />

        <DocsExample
          title="Sizes"
          description="sm 384px → 2xl 672px. Pick the smallest that fits content."
          preview={
            <div className="flex flex-wrap gap-3">
              {(["sm", "md", "lg", "xl", "2xl"] as const).map((s) => (
                <Modal key={s}>
                  <ModalTrigger asChild>
                    <Button tone="neutral" style="stroke">{s}</Button>
                  </ModalTrigger>
                  <ModalContent size={s}>
                    <ModalHeader>
                      <ModalTitle>Modal size {s}</ModalTitle>
                      <ModalDescription>max-w-{s} container.</ModalDescription>
                    </ModalHeader>
                    <ModalBody><p className="text-sm text-text-sub-600">Body content.</p></ModalBody>
                    <ModalFooter>
                      <ModalClose asChild><Button>Close</Button></ModalClose>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              ))}
            </div>
          }
          code={`<ModalContent size="sm">…</ModalContent>
<ModalContent size="md">…</ModalContent>
<ModalContent size="lg">…</ModalContent>
<ModalContent size="xl">…</ModalContent>
<ModalContent size="2xl">…</ModalContent>`}
        />

        <DocsExample
          title="Scrollable body"
          description="Body scrolls independently — header and footer stay pinned."
          preview={
            <Modal>
              <ModalTrigger asChild>
                <Button tone="neutral" style="stroke">Open changelog</Button>
              </ModalTrigger>
              <ModalContent size="lg">
                <ModalHeader>
                  <ModalTitle>Dispatch rule changelog</ModalTitle>
                  <ModalDescription>Last 30 days of policy edits.</ModalDescription>
                </ModalHeader>
                <ModalBody className="space-y-3 max-h-72">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="text-sm text-text-sub-600 border-b border-stroke-soft-200 pb-2 last:border-0">
                      <span className="text-xs text-text-soft-400">2026-05-{(15 - i).toString().padStart(2, "0")}</span> · Fayzul A. updated 3-dispatch-miss rule untuk tribe Reservasi.
                    </div>
                  ))}
                </ModalBody>
                <ModalFooter>
                  <ModalClose asChild><Button>Tutup</Button></ModalClose>
                </ModalFooter>
              </ModalContent>
            </Modal>
          }
          code={`<ModalContent size="lg">
  <ModalHeader>…</ModalHeader>
  <ModalBody className="max-h-72">
    {/* long content scrolls within body */}
  </ModalBody>
  <ModalFooter>…</ModalFooter>
</ModalContent>`}
        />

        <DocsExample
          title="No close button"
          description="Force action by hiding the X. Use sparingly — only when a decision is required (e.g., payment confirmation)."
          preview={
            <Modal>
              <ModalTrigger asChild><Button>Confirm payout</Button></ModalTrigger>
              <ModalContent showClose={false}>
                <ModalHeader>
                  <ModalTitle>Konfirmasi payout Rp 1.24M</ModalTitle>
                  <ModalDescription>Tidak bisa dibatalkan setelah confirm.</ModalDescription>
                </ModalHeader>
                <ModalFooter>
                  <ModalClose asChild><Button tone="neutral" style="stroke">Batal</Button></ModalClose>
                  <Button>Confirm payout</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          }
          code={`<ModalContent showClose={false}>
  <ModalHeader>
    <ModalTitle>Konfirmasi payout</ModalTitle>
  </ModalHeader>
  <ModalFooter>
    <ModalClose asChild><Button style="stroke">Batal</Button></ModalClose>
    <Button>Confirm</Button>
  </ModalFooter>
</ModalContent>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          A Modal blocks the screen. One reason, one primary action, one escape — never a mini-page jammed into a dialog.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <div className="text-sm font-semibold">Suspend mtr-9412?</div>
                <p className="text-xs text-text-sub-600">Mitra auto-suspend 7 hari. Bisa di-reaktivasi kapan saja.</p>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" tone="neutral" style="stroke">Batal</Button>
                  <Button size="sm" tone="destructive">Suspend</Button>
                </div>
              </div>
            ),
            caption: "Satu primary (Suspend) + satu cancel. Title menyatakan target spesifik (mtr-9412), bukan generic.",
          }}
          dont={{
            preview: (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <div className="text-sm font-semibold">Aksi mitra</div>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button size="sm">Suspend</Button>
                  <Button size="sm">Reaktivasi</Button>
                  <Button size="sm">Edit profil</Button>
                  <Button size="sm" tone="neutral" style="stroke">Batal</Button>
                </div>
              </div>
            ),
            caption: "Jangan tumpuk 3+ primary action. Modal jadi pilihan ganda, dispatcher ragu mana yang utama.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <div className="text-sm font-semibold">Reset kode referral?</div>
                <p className="text-xs text-text-sub-600">Kode lama (DASH42) akan invalid. Mitra perlu share kode baru.</p>
              </div>
            ),
            caption: "Spell out konsekuensi: kode lama invalid, side-effect ke mitra. Dispatcher confirm dengan informasi cukup.",
          }}
          dont={{
            preview: (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <div className="text-sm font-semibold">Anda yakin?</div>
                <p className="text-xs text-text-sub-600">Aksi ini tidak dapat dibatalkan.</p>
              </div>
            ),
            caption: "Hindari pertanyaan generic tanpa konteks. Mitra tidak tahu apa yang akan hilang.",
          }}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <code className="text-xs">Modal</code> — Radix Dialog root, owns the <code className="text-xs">open</code> state.</li>
          <li>• <code className="text-xs">ModalTrigger</code> — opens on click. Use <code className="text-xs">asChild</code> to wrap a Button.</li>
          <li>• <code className="text-xs">ModalContent</code> — portal-rendered surface. Owns <code className="text-xs">size</code> and built-in close X.</li>
          <li>• <code className="text-xs">ModalHeader</code> + <code className="text-xs">ModalTitle</code> + <code className="text-xs">ModalDescription</code> — required for screen readers. Omit Description only if title is unambiguous.</li>
          <li>• <code className="text-xs">ModalBody</code> — main content, scrollable when content exceeds max-height.</li>
          <li>• <code className="text-xs">ModalFooter</code> — sticky action row. Omit when there are no actions (info-only modal).</li>
          <li>• <code className="text-xs">ModalClose</code> — dismiss helper, wrap any element via <code className="text-xs">asChild</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold text-text-strong-950 pt-2">Modal (Root)</h3>
        <DocsPropsTable
          rows={[
            { name: "open", type: "boolean", description: "Controlled open state." },
            { name: "defaultOpen", type: "boolean", description: "Uncontrolled initial open." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Open change callback." },
            { name: "modal", type: "boolean", defaultValue: "true", description: "When false, allows interaction with outside DOM." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">ModalContent</h3>
        <DocsPropsTable
          rows={[
            { name: "size", type: '"sm" | "md" | "lg" | "xl" | "2xl"', defaultValue: '"md"', description: "max-width preset." },
            { name: "showClose", type: "boolean", defaultValue: "true", description: "Show built-in close X in top right." },
            { name: "onEscapeKeyDown", type: "(event) => void", description: "Override Esc to prevent close." },
            { name: "onPointerDownOutside", type: "(event) => void", description: "Override click-outside to prevent close." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">ModalTrigger / ModalClose</h3>
        <DocsPropsTable
          rows={[
            { name: "asChild", type: "boolean", defaultValue: "false", description: "Forward styles + behaviour to child element via Radix Slot." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">ModalHeader / ModalBody / ModalFooter</h3>
        <DocsPropsTable
          rows={[
            { name: "className", type: "string", description: "Extend or override slot classes." },
            { name: "children", type: "ReactNode", description: "Slot content." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Built on Radix Dialog — focus is trapped inside content, restored on close.</li>
          <li>• <code className="text-xs">Esc</code> closes by default; <code className="text-xs">Tab</code> / <code className="text-xs">Shift+Tab</code> cycle inside.</li>
          <li>• <code className="text-xs">ModalTitle</code> wires <code className="text-xs">aria-labelledby</code>; <code className="text-xs">ModalDescription</code> wires <code className="text-xs">aria-describedby</code>. Omit only if the title is the entire content.</li>
          <li>• Body scroll is locked while open; layout shift prevented via Radix scrollbar compensation.</li>
          <li>• Overlay click closes by default. Use <code className="text-xs">onPointerDownOutside</code> + preventDefault to force a deliberate action.</li>
          <li>• Honors <code className="text-xs">prefers-reduced-motion</code> — zoom-in / fade animations collapse to instant on supported OSes.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
