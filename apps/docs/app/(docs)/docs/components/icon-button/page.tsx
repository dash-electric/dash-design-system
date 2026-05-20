"use client"

import { RiPencilLine as Pencil, RiDeleteBinLine as Trash2, RiMoreLine as MoreHorizontal, RiFileCopyLine as Copy } from "@remixicon/react"
import { IconButton } from "@/registry/dash/ui/icon-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function IconButtonDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="atom"
        category="Components / Actions"
        title="Icon Button"
        description="Square-format Button for icon-only triggers — toolbar, table row actions, header utilities. aria-label required. Pair with Tooltip when the icon meaning is not obvious."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add icon-button`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          A square-format <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">{`<button>`}</code> with the same tone × style matrix as <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">Button</code>. Pass exactly one lucide icon as the only child — sizing is enforced via <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">[&_svg]</code> rules. An <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-label</code> prop is required since there is no visible text label; pair with a Tooltip whenever the icon&apos;s meaning is not universally obvious.
        </p>
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Tones × styles"
          preview={
            <div className="flex flex-wrap items-center gap-2">
              <IconButton aria-label="Edit"><Pencil /></IconButton>
              <IconButton tone="neutral" style="stroke" aria-label="Copy"><Copy /></IconButton>
              <IconButton tone="primary" style="filled" aria-label="More"><MoreHorizontal /></IconButton>
              <IconButton tone="destructive" style="ghost" aria-label="Delete"><Trash2 /></IconButton>
              <IconButton tone="destructive" style="stroke" aria-label="Delete stroke"><Trash2 /></IconButton>
            </div>
          }
          code={`<IconButton aria-label="Edit"><Pencil /></IconButton>
<IconButton tone="neutral" style="stroke" aria-label="Copy"><Copy /></IconButton>
<IconButton tone="primary" style="filled" aria-label="More"><MoreHorizontal /></IconButton>
<IconButton tone="destructive" style="ghost" aria-label="Delete"><Trash2 /></IconButton>`}
        />

        <DocsExample
          title="Sizes"
          preview={
            <div className="flex items-center gap-2">
              <IconButton size="xs" aria-label="xs"><Pencil /></IconButton>
              <IconButton size="sm" aria-label="sm"><Pencil /></IconButton>
              <IconButton size="md" aria-label="md"><Pencil /></IconButton>
              <IconButton size="lg" aria-label="lg"><Pencil /></IconButton>
              <IconButton size="xl" aria-label="xl"><Pencil /></IconButton>
            </div>
          }
          code={`<IconButton size="xs" />
<IconButton size="sm" />
<IconButton size="md" />
<IconButton size="lg" />
<IconButton size="xl" />`}
        />

        <DocsExample
          title="Table row actions"
          preview={
            <div className="w-full border border-stroke-soft-200 rounded-lg overflow-hidden bg-bg-white-0">
              {["mtr-9412", "mtr-9419", "mtr-9425"].map((id) => (
                <div key={id} className="flex items-center justify-between px-3 py-2 text-sm border-b last:border-b-0 border-stroke-soft-200">
                  <span className="">{id}</span>
                  <div className="flex items-center gap-1">
                    <IconButton size="sm" aria-label={`Edit ${id}`}><Pencil /></IconButton>
                    <IconButton size="sm" aria-label={`Duplicate ${id}`}><Copy /></IconButton>
                    <IconButton size="sm" tone="destructive" aria-label={`Suspend ${id}`}><Trash2 /></IconButton>
                  </div>
                </div>
              ))}
            </div>
          }
          code={`<div className="flex items-center gap-1">
  <IconButton aria-label={\`Edit \${id}\`}><Pencil /></IconButton>
  <IconButton aria-label={\`Duplicate \${id}\`}><Copy /></IconButton>
  <IconButton tone="destructive" aria-label={\`Suspend \${id}\`}><Trash2 /></IconButton>
</div>`}
        />

        <DocsExample
          title="With Tooltip"
          description="Always pair icon-only buttons with Tooltip when the icon meaning isn't obvious from context."
          preview={
            <div className="text-sm text-text-sub-600">
              Wrap IconButton in <code className="text-xs">Tooltip</code>; the visible tooltip + aria-label both convey meaning.
            </div>
          }
          code={`<Tooltip>
  <TooltipTrigger asChild>
    <IconButton aria-label="Suspend mitra"><Trash2 /></IconButton>
  </TooltipTrigger>
  <TooltipContent>Suspend mitra</TooltipContent>
</Tooltip>`}
        />

        <DocsExample
          title="Disabled state"
          preview={
            <div className="flex flex-wrap items-center gap-2">
              <IconButton disabled aria-label="Disabled"><Pencil /></IconButton>
              <IconButton disabled aria-label="Disabled destructive" tone="destructive"><Trash2 /></IconButton>
            </div>
          }
          code={`<IconButton disabled aria-label="Edit"><Pencil /></IconButton>
<IconButton disabled tone="destructive" aria-label="Delete"><Trash2 /></IconButton>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          IconButton = label dipindah ke aria-label + Tooltip. Selalu spesifik di aria-label ("Edit mtr-9412", bukan "Edit"). Untuk icon ambigu, wajib pair Tooltip.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-1">
                <IconButton size="sm" aria-label="Edit mtr-9412"><Pencil /></IconButton>
                <IconButton size="sm" aria-label="Duplikat mtr-9412"><Copy /></IconButton>
                <IconButton size="sm" tone="destructive" aria-label="Suspend mtr-9412"><Trash2 /></IconButton>
              </div>
            ),
            caption: "Row action di table mitra. Aria-label sertakan ID target (mtr-9412), bukan generic 'Edit'. SR user tahu sedang edit row mana.",
          }}
          dont={{
            preview: (
              <div className="flex items-center gap-1">
                <IconButton size="sm" aria-label=""><Pencil /></IconButton>
                <IconButton size="sm" aria-label=""><Copy /></IconButton>
                <IconButton size="sm" tone="destructive" aria-label=""><Trash2 /></IconButton>
              </div>
            ),
            caption: "Tanpa aria-label = SR baca 'button button button'. Wajib aria-label untuk semua icon-only.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <IconButton tone="destructive" aria-label="Suspend mitra mtr-9412"><Trash2 /></IconButton>
            ),
            caption: "Destructive action pakai tone='destructive' supaya warna kasih sinyal severity. Aria-label sebut konsekuensi spesifik.",
          }}
          dont={{
            preview: (
              <IconButton aria-label="X"><Trash2 /></IconButton>
            ),
            caption: "Aria-label single char 'X' atau symbol = tidak deskriptif. Aria-label harus deskripsi natural-language untuk SR.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultValue: '"md"', description: "Square size preset." },
            { name: "tone", type: '"primary" | "neutral" | "destructive"', defaultValue: '"neutral"', description: "Color." },
            { name: "style", type: '"filled" | "stroke" | "ghost"', defaultValue: '"ghost"', description: "Surface style." },
            { name: "asChild", type: "boolean", description: "Render as child element via Radix Slot." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Disable + drop opacity." },
            { name: "aria-label", type: "string", description: "REQUIRED — accessible name (icon-only button)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>aria-label REQUIRED</strong> — IconButton has no visible text. Pass <code className="text-xs">aria-label</code> describing the action (&quot;Edit mtr-9412&quot;, not just &quot;Edit&quot;).</li>
          <li>• <strong>Tooltip pairing</strong> — when an icon is ambiguous (especially in toolbars), always pair with Tooltip. Both the visible tooltip and aria-label should match.</li>
          <li>• <strong>Keyboard</strong> — native button: <code className="text-xs">Tab</code> focus, <code className="text-xs">Enter</code> / <code className="text-xs">Space</code> activate.</li>
          <li>• <strong>Touch target</strong> — sizes <code className="text-xs">md</code> and above hit WCAG 2.5.5 (24×24 minimum); sizes <code className="text-xs">xs</code> + <code className="text-xs">sm</code> are below — only use in spacious row layouts.</li>
          <li>• <strong>Color contrast</strong> — all 3 × 3 tone × style combinations pass WCAG AA.</li>
          <li>• <strong>Reduced motion</strong> — no inherent motion; inherits Button focus-ring transitions which respect <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
