"use client"

import { Button } from "@/registry/dash/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/registry/dash/ui/alert-dialog"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AlertDialogDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Overlays"
        title="Alert Dialog"
        description="Modal for destructive or irreversible action confirmations. Differs from Modal — cannot dismiss by clicking overlay, must use explicit Cancel or Action button. Built on Radix AlertDialog."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add alert-dialog`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Confirm suspend mitra"
          preview={
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button tone="destructive">Suspend permanen mtr-9412</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Suspend permanen mtr-9412?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan suspend mitra Sigit P. (Reservasi · Bekasi) selamanya. Trip 142 yang
                    sudah selesai tetap terhitung, tapi mitra tidak bisa terima dispatch baru. Tindakan
                    tidak bisa di-revert.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button tone="neutral" style="stroke">Batal</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button tone="destructive">Ya, suspend permanen</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
          code={`<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button tone="destructive">Suspend permanen</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Suspend permanen mtr-9412?</AlertDialogTitle>
      <AlertDialogDescription>Tindakan tidak bisa di-revert.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel asChild><Button>Batal</Button></AlertDialogCancel>
      <AlertDialogAction asChild><Button tone="destructive">Ya</Button></AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}
        />

        <DocsExample
          title="Reset payouts (controlled state)"
          preview={
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button tone="destructive" style="stroke">Reset payout queue</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset payout queue Reservasi tribe?</AlertDialogTitle>
                  <AlertDialogDescription>
                    142 mitra masuk antrian payout 02:00 besok. Reset akan kosongkan queue dan
                    require manual re-trigger lewat Halo-dash Ops. Total nilai: Rp 38.420.000.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button tone="neutral" style="stroke">Tetap kirim</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button tone="destructive">Reset queue</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
          code={`const [open, setOpen] = useState(false)

<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogTrigger asChild>
    <Button tone="destructive" style="stroke">Reset payout queue</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Reset payout queue Reservasi tribe?</AlertDialogTitle>
      <AlertDialogDescription>142 mitra · total Rp 38.420.000.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel asChild><Button style="stroke">Tetap kirim</Button></AlertDialogCancel>
      <AlertDialogAction asChild><Button tone="destructive">Reset queue</Button></AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}
        />

        <DocsExample
          title="Delete account (irreversible)"
          preview={
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button tone="destructive" size="sm">Hapus akun</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus akun Halo-dash?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Semua data Wei Chen — audit log, komentar, file upload — akan dihapus permanen
                    dalam 30 hari. Setelah grace period berakhir, recovery tidak mungkin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button tone="neutral" style="stroke">Batal</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button tone="destructive">Hapus permanen</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
          code={`<AlertDialog>
  <AlertDialogTrigger asChild><Button tone="destructive">Hapus akun</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Hapus akun Halo-dash?</AlertDialogTitle>
      <AlertDialogDescription>Recovery tidak mungkin setelah 30 hari.</AlertDialogDescription>
    </AlertDialogHeader>
    …
  </AlertDialogContent>
</AlertDialog>`}
        />

        <DocsExample
          title="Cancel surge override"
          preview={
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button tone="neutral" style="stroke" size="sm">Cancel surge 1.4×</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel surge override Jakarta Selatan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Surge 1.4× sudah aktif 47 menit. Membatalkan akan kembalikan baseline 1.0×
                    instant — mitra yang sedang menerima dispatch dengan rate surge tetap dibayar
                    sesuai trip awal.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button tone="neutral" style="stroke">Lanjutkan surge</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button>Ya, cancel</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
          code={`<AlertDialog>
  <AlertDialogTrigger asChild><Button style="stroke">Cancel surge 1.4×</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Cancel surge override?</AlertDialogTitle>
      <AlertDialogDescription>Mitra trip aktif tetap dibayar rate surge.</AlertDialogDescription>
    </AlertDialogHeader>
    …
  </AlertDialogContent>
</AlertDialog>`}
        />

        <DocsExample
          title="Long content (scrollable)"
          preview={
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button tone="neutral" style="stroke" size="sm">Review terms before suspend</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Suspend mtr-9412 menurut Section 4.2 TOS</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini mengacu pada policy ops 2026-Q2. Mitra yang ditolak 3× dispatch
                    dalam 60 menit otomatis di-suspend. Suspension lift pada 04:00 hari berikutnya.
                    Trip yang sudah selesai tetap terhitung untuk payout. Mitra menerima push
                    notif + SMS dalam 30 detik. Banding bisa diajukan via Halo-dash Ops dalam 24 jam.
                    Status akan tetap &quot;Suspended&quot; di Tribe-Express dashboard sampai resolusi.
                    Audit log otomatis di-generate untuk compliance review.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button tone="neutral" style="stroke">Batal</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button tone="destructive">Suspend sekarang</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
          code={`<AlertDialogContent>
  <AlertDialogHeader>
    <AlertDialogTitle>…</AlertDialogTitle>
    <AlertDialogDescription>
      {/* long copy — content stays inside the dialog frame */}
    </AlertDialogDescription>
  </AlertDialogHeader>
  …
</AlertDialogContent>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Alert Dialog hanya untuk aksi destruktif / irreversible. Konsekuensi harus tertulis spesifik, action label harus verb yang sama dengan aksinya.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <div className="text-sm font-semibold">Hapus kode DASH42?</div>
                <p className="text-xs text-text-sub-600">Kode tidak bisa di-recover. 12 mitra yang sedang pakai kode ini akan otomatis pindah ke kode default.</p>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" tone="neutral" style="stroke">Batal</Button>
                  <Button size="sm" tone="destructive">Hapus kode</Button>
                </div>
              </div>
            ),
            caption: "Action button menyatakan verb persis (Hapus kode). Description spell out konsekuensi konkret (12 mitra terdampak).",
          }}
          dont={{
            preview: (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <div className="text-sm font-semibold">Konfirmasi</div>
                <p className="text-xs text-text-sub-600">Lanjutkan?</p>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" tone="neutral" style="stroke">Tidak</Button>
                  <Button size="sm">OK</Button>
                </div>
              </div>
            ),
            caption: "Hindari OK/Tidak generic. Dispatcher klik tanpa baca, lalu kaget data hilang.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Pakai Alert Dialog untuk suspend permanen mitra, hapus kode referral, cancel delivery yang sudah PICKED_UP — aksi yang tidak punya undo.",
          }}
          dont={{
            caption: "Jangan pakai Alert Dialog untuk action reversible (toggle tribe, edit profil, ubah lot). Itu cukup Modal biasa atau inline edit.",
          }}
        />
      </DocsSection>

      <DocsSection title="When to use vs Modal">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Alert Dialog</strong> = destructive / irreversible confirmation. No overlay-click dismiss.</li>
          <li>• <strong>Modal</strong> = focused task with form / details. Overlay click dismisses.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>AlertDialog</strong> — root, controls open state.</li>
          <li className="pl-4">├ <strong>AlertDialogTrigger</strong> — element that opens the dialog (usually a Button with <code className="text-xs">asChild</code>).</li>
          <li className="pl-4">└ <strong>AlertDialogContent</strong> — focus-trapped surface.</li>
          <li className="pl-8">├ <strong>AlertDialogHeader</strong> — flex column wrapper.</li>
          <li className="pl-12">├ <strong>AlertDialogTitle</strong> — required (Radix throws if missing).</li>
          <li className="pl-12">└ <strong>AlertDialogDescription</strong> — explains what happens after Confirm.</li>
          <li className="pl-8">└ <strong>AlertDialogFooter</strong> — actions row.</li>
          <li className="pl-12">├ <strong>AlertDialogCancel</strong> — safe choice, autoFocused by default.</li>
          <li className="pl-12">└ <strong>AlertDialogAction</strong> — the destructive choice.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950">AlertDialog (Root)</h3>
        <DocsPropsTable
          rows={[
            { name: "open", type: "boolean", description: "Controlled open state." },
            { name: "defaultOpen", type: "boolean", description: "Uncontrolled initial state." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Fires on state change." },
          ]}
        />
        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">AlertDialogTrigger / Cancel / Action</h3>
        <DocsPropsTable
          rows={[
            { name: "asChild", type: "boolean", defaultValue: "false", description: "Forward to the consumer element instead of rendering an extra button." },
          ]}
        />
        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">AlertDialogContent</h3>
        <DocsPropsTable
          rows={[
            { name: "onEscapeKeyDown", type: "(event) => void", description: "Override Esc behavior (call event.preventDefault() to keep open)." },
            { name: "onOpenAutoFocus", type: "(event) => void", description: "Override default Cancel-button autofocus." },
            { name: "onCloseAutoFocus", type: "(event) => void", description: "Override what gets focus after close (defaults to trigger)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <p className="text-sm text-text-sub-600">Built on <a href="https://www.radix-ui.com/primitives/docs/components/alert-dialog" target="_blank" rel="noreferrer" className="underline">Radix AlertDialog</a>.</p>
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — content surface has <code className="text-xs">role=&quot;alertdialog&quot;</code>, title gets <code className="text-xs">aria-labelledby</code>, description gets <code className="text-xs">aria-describedby</code> — all auto-wired.</li>
          <li>• <strong>Keyboard</strong>
            <ul className="ml-5 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li><code className="text-xs">Tab</code> / <code className="text-xs">Shift+Tab</code> cycles inside the dialog (focus is trapped).</li>
              <li><code className="text-xs">Esc</code> closes — same as clicking Cancel. Override via <code className="text-xs">onEscapeKeyDown</code> for truly mandatory confirmations.</li>
              <li><code className="text-xs">Enter</code> / <code className="text-xs">Space</code> activates the focused button.</li>
            </ul>
          </li>
          <li>• <strong>Focus management</strong> — opens with focus on <strong>Cancel</strong> (the safe action). Closes by returning focus to the trigger.</li>
          <li>• <strong>Overlay click</strong> — explicitly does NOT dismiss. This is the contract that separates AlertDialog from Modal.</li>
          <li>• <strong>ARIA you add</strong> — title is required. If you must hide the visible title, wrap it in <code className="text-xs">VisuallyHidden</code> rather than dropping the component.</li>
          <li>• <strong>Reduced motion</strong> — overlay fade + content scale respect <code className="text-xs">prefers-reduced-motion</code> via CSS data attributes.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
