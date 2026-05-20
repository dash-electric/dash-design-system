"use client"

import { useState } from "react"
import { RichEditor } from "@/registry/dash/ui/rich-editor"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function RichEditorDocsPage() {
  const [html, setHtml] = useState(
    "<p>Mitra <strong>mtr-9412</strong> di-suspend karena 3 dispatch terlewat hari ini. Lebaran rate freeze masih aktif.</p>",
  )
  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="composite"
        category="Components / Form"
        title="Rich Editor"
        description="Tiptap-powered rich text editor with Dash-styled toolbar. Use for suspend reason, complaint reply, announcement body, internal comment."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add rich-editor`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { RichEditor } from "@/registry/dash/ui/rich-editor"

<RichEditor
  defaultContent="<p>…</p>"
  onChange={(html) => save(html)}
/>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Full toolbar"
          preview={
            <div className="w-full max-w-2xl">
              <RichEditor
                content={html}
                onChange={setHtml}
                placeholder="Tulis alasan suspend untuk mtr-9412…"
              />
            </div>
          }
          code={`<RichEditor
  content={html}
  onChange={setHtml}
  placeholder="Tulis alasan suspend untuk mtr-9412…"
/>`}
        />

        <DocsExample
          title="Compact toolbar"
          preview={
            <div className="w-full max-w-2xl">
              <RichEditor
                toolbar="compact"
                defaultContent="<p>Comment singkat untuk Halo-dash agent…</p>"
              />
            </div>
          }
          code={`<RichEditor toolbar="compact" defaultContent="<p>…</p>" />`}
        />

        <DocsExample
          title="Disabled / read-only"
          preview={
            <div className="w-full max-w-2xl">
              <RichEditor
                disabled
                defaultContent="<p>Postmortem ini sudah <strong>archived</strong>. Tidak bisa diedit.</p>"
              />
            </div>
          }
          code={`<RichEditor disabled defaultContent="<p>Archived.</p>" />`}
        />

        <DocsExample
          title="No toolbar (just editor surface)"
          preview={
            <div className="w-full max-w-2xl">
              <RichEditor
                toolbar="none"
                defaultContent="<p>Inline editing tanpa toolbar.</p>"
              />
            </div>
          }
          code={`<RichEditor toolbar="none" defaultContent="<p>…</p>" />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Rich editor untuk konten yang butuh formatting (announcement mitra, internal note dispatcher). Bukan untuk single-line text.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs text-xs rounded border border-stroke-soft-200 bg-bg-white-0">
                <div className="border-b border-stroke-soft-200 p-1 flex gap-1 text-text-sub-600">
                  <span className="font-bold">B</span>
                  <span className="italic">I</span>
                  <span>•</span>
                </div>
                <div className="p-2">
                  Mitra <strong>mtr-9412</strong> di-suspend karena 3 dispatch terlewat.
                </div>
              </div>
            ),
            caption: "Note internal dispatcher: bold mitra ID, list dispatch yang missed. Editor minimal — Bold/Italic/List cukup.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs rounded border border-stroke-soft-200 bg-bg-white-0">
                <div className="border-b border-stroke-soft-200 p-1 flex flex-wrap gap-0.5 text-text-sub-600">
                  {Array.from({length: 18}, (_, i) => <span key={i} className="px-1">T{i}</span>)}
                </div>
              </div>
            ),
            caption: "Hindari 18 toolbar button (table, image, embed, color, font-family). Mitra cuma butuh basic markup.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Untuk \"Nama mitra\" / \"Nomor handphone\" / \"Alasan suspend\" — pakai plain Input/Textarea, bukan RichEditor. Save bandwidth dan storage.",
          }}
          dont={{
            caption: "Jangan biarkan output HTML render langsung tanpa sanitize. XSS lewat alasan suspend mitra = bad day.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "content", type: "string", description: "Controlled HTML content." },
            { name: "defaultContent", type: "string", description: "Uncontrolled initial HTML." },
            { name: "onChange", type: "(html: string) => void", description: "Fires on every keystroke with current HTML." },
            { name: "placeholder", type: "string", defaultValue: '"Tulis sesuatu…"', description: "Empty-state placeholder." },
            { name: "disabled", type: "boolean", description: "Read-only mode." },
            { name: "toolbar", type: '"full" | "compact" | "none"', defaultValue: '"full"', description: "Toolbar variant." },
            { name: "useRichEditor(opts)", type: "hook", description: "Returns raw Tiptap editor instance for imperative control." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Extensions wired">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• StarterKit (paragraph, heading, bold, italic, strike, code, blockquote, bullet list, ordered list, history)</li>
          <li>• Link (toggle via toolbar prompt, opens in new tab on click)</li>
          <li>• Placeholder (shown when editor empty)</li>
          <li>• To extend: pass your own extensions via <code className="text-xs">useRichEditor()</code> hook + render with <code className="text-xs">EditorContent</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Tiptap editor wrapped with a Dash-styled toolbar at top + editor surface below.</li>
          <li>• Toolbar variants: <code className="text-xs">full</code> (all formatting), <code className="text-xs">compact</code> (bold/italic/link/list), <code className="text-xs">none</code> (no toolbar).</li>
          <li>• HTML output via <code className="text-xs">onChange</code>; render later with <code className="text-xs">dangerouslySetInnerHTML</code> (or sanitize first).</li>
          <li>• For markdown output, swap StarterKit-HTML for a Markdown extension via the imperative hook.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Editor surface is a <code className="text-xs">role=&quot;textbox&quot;</code> with <code className="text-xs">aria-multiline=&quot;true&quot;</code>.</li>
          <li>• Toolbar buttons each carry <code className="text-xs">aria-label</code> + <code className="text-xs">aria-pressed</code> for current formatting state.</li>
          <li>• Keyboard shortcuts work (<code className="text-xs">⌘B</code> / <code className="text-xs">⌘I</code> / <code className="text-xs">⌘K</code> for link). Pair Tooltip + Kbd on toolbar buttons so users discover them.</li>
          <li>• Always pair with a visible <code className="text-xs">Label</code> + <code className="text-xs">Hint</code> for required state and length limits.</li>
          <li>• Sanitize HTML on save and on render (DOMPurify or server-side sanitizer) — never trust user-authored HTML.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
