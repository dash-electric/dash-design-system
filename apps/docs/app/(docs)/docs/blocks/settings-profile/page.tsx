"use client"

import { SettingsProfile } from "@/registry/dash/blocks/settings-profile"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SettingsProfileDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Settings"
        title="Settings Profile"
        description="Profile settings form — avatar + name + email + role + bio. Used as the Profile tab content inside SettingsTabsPage. Mitra-account-flavored copy by default."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add settings-profile`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Mitra profile"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <SettingsProfile />
            </div>
          }
          code={`<SettingsProfile />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Top — <code>Avatar</code> with Upload/Remove buttons.</li>
          <li><code>FieldGroup</code> + <code>Field</code> + <code>Label</code> + <code>InputRoot</code> stack for name, email, phone, role.</li>
          <li>Bio uses <code>Textarea</code>.</li>
          <li>Footer — Save changes <code>Button</code> + Cancel link.</li>
          <li>Drop directly inside <code>SettingsTabsPage</code> body when <code>activeId === "profile"</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> as the Profile tab of any Settings hub.</li>
          <li><strong>Use</strong> as a standalone "edit profile" page.</li>
          <li><strong>Don't</strong> use for KYC document upload — that's a different flow (FormStepperPage + FileUpload).</li>
        </ul>
      </DocsSection>
      <DocsSection title="Save scope clarity">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Profile form has one save button. Don't save individual fields on blur — surprises the user and produces inconsistent partial states.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-2">
                <div className="space-y-1"><p className="text-[10px] text-text-sub-600">Nama lengkap</p><div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs flex items-center px-3">Budi Aditya</div></div>
                <div className="space-y-1"><p className="text-[10px] text-text-sub-600">Email</p><div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs flex items-center px-3">budi@dash.id</div></div>
                <div className="flex justify-end pt-2"><button className="h-8 px-4 rounded-md bg-primary-base text-static-white text-xs font-medium">Simpan perubahan</button></div>
              </div>
            ),
            caption: "One save button at the footer. User reviews their edits before committing — typical, predictable, undoable.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm space-y-2">
                <div className="space-y-1"><p className="text-[10px] text-text-sub-600">Nama lengkap</p><div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs flex items-center justify-between px-3"><span>Budi Aditya</span><span className="text-[9px] text-success-base">✓ Saved</span></div></div>
                <div className="space-y-1"><p className="text-[10px] text-text-sub-600">Email</p><div className="h-9 rounded-lg border border-error-base bg-bg-white-0 text-xs flex items-center justify-between px-3"><span>budi@dash.id</span><span className="text-[9px] text-error-base">✕ Failed</span></div></div>
              </div>
            ),
            caption: "Don't save on blur. Field-by-field saves create half-committed states and frustrate users who change their mind.",
          }}
        />
      </DocsSection>

      <DocsSection title="Destructive action separation">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Delete account, leave organization — these go in their own danger zone section, not next to 'Save profile'.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-3">
                <div className="space-y-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3"><p className="text-xs font-medium">Akun</p><div className="h-8 rounded-md border border-stroke-soft-200 text-[10px] flex items-center px-2 text-text-sub-600">Email · budi@dash.id</div></div>
                <div className="space-y-2 rounded-lg border border-error-base bg-error-lighter/30 p-3"><p className="text-xs font-medium text-error-dark">Zona berbahaya</p><button className="h-8 px-3 rounded-md border border-error-base text-error-base text-[10px] font-medium">Hapus akun saya</button></div>
              </div>
            ),
            caption: "Danger zone is a separate red-bordered card. Destructive actions can't be triggered by reflex.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm flex gap-2 items-end pt-3">
                <button className="h-8 px-3 rounded-md border border-stroke-soft-200 text-[10px] font-medium flex-1">Batal</button>
                <button className="h-8 px-3 rounded-md bg-primary-base text-static-white text-[10px] font-medium flex-1">Simpan</button>
                <button className="h-8 px-3 rounded-md bg-error-base text-static-white text-[10px] font-medium flex-1">Hapus akun</button>
              </div>
            ),
            caption: "Don't place 'Hapus akun' next to 'Simpan'. One mis-click and the user just deleted their data.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
