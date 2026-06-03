"use client"

import { useState } from "react"
import {
  RiCheckLine as Check,
  RiCloseCircleLine as Reject,
  RiDeleteBinLine as Trash2,
  RiDownloadLine as Download,
  RiUserAddLine as Assign,
  RiArchiveLine as Archive,
} from "@remixicon/react"
import {
  BulkActionBar,
  type BulkActionBarAction,
} from "@/registry/dash/ui/bulk-action-bar"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPrinciples,
  DocsVariantTable,
} from "@/components/docs/page-shell"
import { DocsApiTable } from "@/components/docs/api-table"
import { DocsShadcnTemplate } from "@/components/docs/shadcn-template"

/* -------------------------------------------------------------------------- */
/* Demo harness — local state to drive selection count                         */
/* -------------------------------------------------------------------------- */

function DemoBar({
  initialCount = 3,
  position,
  tone,
  size,
  actions,
}: {
  initialCount?: number
  position?: "top" | "bottom"
  tone?: "neutral" | "primary" | "destructive"
  size?: "sm" | "md"
  actions: BulkActionBarAction[]
}) {
  const [count, setCount] = useState(initialCount)

  return (
    <div className="relative w-full min-h-[180px] rounded-lg border border-dashed border-stroke-soft-200 bg-bg-weak-50 p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Button
          size="xs"
          tone="neutral"
          style="stroke"
          onClick={() => setCount((c) => Math.max(0, c - 1))}
        >
          − 1
        </Button>
        <Button
          size="xs"
          tone="neutral"
          style="stroke"
          onClick={() => setCount((c) => c + 1)}
        >
          + 1
        </Button>
        <span className="text-xs text-text-sub-600 tabular-nums">
          simulated selection: {count}
        </span>
      </div>
      <div className="text-xs text-text-sub-600 leading-relaxed">
        Imagine a DataTable here. The bar appears when ≥1 row is selected.
      </div>
      <BulkActionBar
        selectedCount={count}
        onClear={() => setCount(0)}
        actions={actions}
        position={position}
        tone={tone}
        size={size}
      />
    </div>
  )
}

export default function BulkActionBarDocsPage() {
  const [, setTick] = useState(0)

  const basicActions: BulkActionBarAction[] = [
    { id: "approve", label: "Approve", tone: "primary", onClick: () => setTick((t) => t + 1) },
    { id: "reject", label: "Reject", tone: "neutral", onClick: () => setTick((t) => t + 1) },
  ]

  const destructiveActions: BulkActionBarAction[] = [
    { id: "approve", label: "Approve", tone: "primary", onClick: () => setTick((t) => t + 1) },
    {
      id: "delete",
      label: "Delete",
      tone: "destructive",
      onClick: () => setTick((t) => t + 1),
    },
  ]

  const iconActions: BulkActionBarAction[] = [
    { id: "approve", label: "Approve", icon: <Check />, tone: "primary", onClick: () => setTick((t) => t + 1) },
    { id: "reject", label: "Reject", icon: <Reject />, tone: "neutral", onClick: () => setTick((t) => t + 1) },
    { id: "export", label: "Export CSV", icon: <Download />, tone: "neutral", onClick: () => setTick((t) => t + 1) },
    { id: "delete", label: "Delete", icon: <Trash2 />, tone: "destructive", onClick: () => setTick((t) => t + 1) },
  ]

  const overflowActions: BulkActionBarAction[] = [
    { id: "approve", label: "Approve", icon: <Check />, tone: "primary", onClick: () => setTick((t) => t + 1) },
    { id: "reject", label: "Reject", icon: <Reject />, onClick: () => setTick((t) => t + 1) },
    { id: "assign", label: "Assign", icon: <Assign />, onClick: () => setTick((t) => t + 1) },
    { id: "export", label: "Export", icon: <Download />, onClick: () => setTick((t) => t + 1) },
    { id: "archive", label: "Archive", icon: <Archive />, onClick: () => setTick((t) => t + 1) },
    { id: "delete", label: "Delete", icon: <Trash2 />, tone: "destructive", onClick: () => setTick((t) => t + 1) },
  ]

  return (
    <DocsPageShell>
      <DocsHeader
        category="Actions"
        title="Bulk Action Bar"
        status="new"
        kind="atom"
        showStatus
        description="Sticky toolbar that surfaces when ≥1 row is selected in a DataTable. Left = selection count + Clear. Center = bulk actions. Optional close on the right. Pinned to the viewport bottom by default; can sit at the top of the table when scrolling matters."
        tabs={[
          { label: "Usage", active: true },
          { label: "Spec" },
          { label: "Status" },
        ]}
      />

      <DocsShadcnTemplate
        name="bulk-action-bar"
        heroPreview={
          <DemoBar
            initialCount={12}
            actions={iconActions}
          />
        }
        heroCode={`<BulkActionBar
  selectedCount={selected.size}
  onClear={() => setSelected(new Set())}
  actions={[
    { id: "approve", label: "Approve", icon: <Check />, tone: "primary", onClick: approveSelected },
    { id: "reject",  label: "Reject",  icon: <Reject />, onClick: rejectSelected },
    { id: "delete",  label: "Delete",  icon: <Trash2 />, tone: "destructive", onClick: deleteSelected },
  ]}
/>`}
        usageImport={`import { BulkActionBar, type BulkActionBarAction } from "@/registry/dash/ui/bulk-action-bar"`}
        usageJsx={`<BulkActionBar selectedCount={count} onClear={clear} actions={actions} />`}
        manual={{
          sourcePath: "registry/dash/ui/bulk-action-bar.tsx",
          dependencies: ["class-variance-authority", "@remixicon/react", "@radix-ui/react-dropdown-menu"],
        }}
      />

      <DocsSection title="Principles">
        <DocsPrinciples
          items={[
            {
              title: "Appears with intent",
              body: "Only render when ≥1 row is selected. An empty bar is noise. Slide in once, slide out once the selection clears.",
            },
            {
              title: "Selection is the subject",
              body: "Lead with the count — '12 items selected'. The verbs that follow act on exactly that set. Always pair with a 'Clear' affordance.",
            },
            {
              title: "Destructive needs a gate",
              body: "Delete, suspend, revoke — any action that cannot be undone opens a confirmation. Never fire on a single click.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Tones">
        <DocsVariantTable
          nameHeader="Tone"
          rows={[
            { name: "neutral", description: "Default — most pages. Hairline border, neutral accent dot. Use whenever no single action dominates." },
            { name: "primary", description: "When the dominant action is a positive flow (approve queue, batch publish). Adds a feature-toned border + accent dot." },
            { name: "destructive", description: "When the selection is staged for removal (bulk delete, mass suspend). Adds an error-toned border + accent dot to signal weight." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <DocsVariantTable
          nameHeader="Size"
          rows={[
            { name: "sm", description: "44px tall. Dense workspaces — Halo-dash, dispatch tools." },
            { name: "md", description: "Default. 52px tall. Backoffice tables, mitra lists." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Basic — two actions"
          description="Approve / Reject pair. Tap the +1 / −1 buttons to simulate selection changes."
          preview={<DemoBar initialCount={1} actions={basicActions} />}
          code={`const actions = [
  { id: "approve", label: "Approve", tone: "primary", onClick: approveSelected },
  { id: "reject",  label: "Reject",  onClick: rejectSelected },
]

<BulkActionBar
  selectedCount={selected.size}
  onClear={() => setSelected(new Set())}
  actions={actions}
/>`}
        />

        <DocsExample
          title="With confirmation — destructive"
          description="Destructive actions open a native confirmation prompt before firing. Will swap for the <ConfirmAction> primitive once it ships."
          preview={
            <DemoBar
              initialCount={3}
              tone="destructive"
              actions={destructiveActions}
            />
          }
          code={`const actions = [
  { id: "approve", label: "Approve", tone: "primary", onClick: approveSelected },
  {
    id: "delete",
    label: "Delete",
    tone: "destructive",
    confirmMessage: "Delete 3 trips? This cannot be undone.",
    onClick: deleteSelected,
  },
]

<BulkActionBar
  selectedCount={3}
  onClear={clear}
  tone="destructive"
  actions={actions}
/>`}
        />

        <DocsExample
          title="With icons"
          description="Leading icons reinforce the verb. Mirror the icon you used in the row-action menu."
          preview={<DemoBar initialCount={12} actions={iconActions} />}
          code={`<BulkActionBar
  selectedCount={selected.size}
  onClear={clear}
  actions={[
    { id: "approve", label: "Approve", icon: <Check />, tone: "primary", onClick: approve },
    { id: "reject",  label: "Reject",  icon: <Reject />, onClick: reject },
    { id: "export",  label: "Export CSV", icon: <Download />, onClick: exportCsv },
    { id: "delete",  label: "Delete", icon: <Trash2 />, tone: "destructive", onClick: del },
  ]}
/>`}
        />

        <DocsExample
          title="Mobile responsive (overflow menu)"
          description="Past inlineLimit (default 4), extra actions collapse into a More menu. On md screens all actions collapse into a single dropdown to preserve the count + Clear region."
          preview={
            <DemoBar
              initialCount={8}
              actions={overflowActions}
            />
          }
          code={`<BulkActionBar
  selectedCount={selected.size}
  onClear={clear}
  inlineLimit={3}
  actions={[
    { id: "approve", label: "Approve", icon: <Check />, tone: "primary", onClick: approve },
    { id: "reject",  label: "Reject",  icon: <Reject />, onClick: reject },
    { id: "assign",  label: "Assign",  icon: <Assign />, onClick: assign },
    { id: "export",  label: "Export",  icon: <Download />, onClick: exportCsv },
    { id: "archive", label: "Archive", icon: <Archive />, onClick: archive },
    { id: "delete",  label: "Delete",  icon: <Trash2 />, tone: "destructive", onClick: del },
  ]}
/>`}
        />

        <DocsExample
          title="Top position"
          description="Pin to the top of the table column for long-scroll surfaces. Sticky inside the table container, not the viewport."
          preview={
            <DemoBar
              initialCount={5}
              position="top"
              actions={iconActions}
            />
          }
          code={`<BulkActionBar
  position="top"
  selectedCount={5}
  onClear={clear}
  actions={actions}
/>`}
        />
      </DocsSection>

      <DocsSection title="API" id="api">
        <DocsApiTable
          idPrefix="bulk-action-bar-prop"
          rows={[
            { name: "selectedCount", type: "number", required: true, description: "Number of currently selected rows. Bar is hidden when 0." },
            { name: "onClear", type: "() => void", required: true, description: "Called when Clear button (or Escape) is activated. Should reset selection state in the parent." },
            { name: "actions", type: "BulkActionBarAction[]", required: true, description: "Buttons rendered in the center region. Overflow past inlineLimit folds into a DropdownMenu." },
            { name: "position", type: '"top" | "bottom"', defaultValue: '"bottom"', description: 'Pin to viewport bottom (default) or sticky inside the parent at top.' },
            { name: "tone", type: '"neutral" | "primary" | "destructive"', defaultValue: '"neutral"', description: "Border + accent-dot color. Pick by the dominant verb in the selection." },
            { name: "size", type: '"sm" | "md"', defaultValue: '"md"', description: "Bar height. sm=44px, md=52px." },
            { name: "showClose", type: "boolean", defaultValue: "false", description: "Show a trailing X close button (also calls onClear). Default off — Clear button on the left already covers it." },
            { name: "inlineLimit", type: "number", defaultValue: "4", description: "Max actions rendered inline before collapsing into a DropdownMenu. Lower on dense screens." },
            { name: "itemNoun", type: '{ singular: string; plural: string }', defaultValue: '{ singular: "item", plural: "items" }', description: 'Selection summary noun. e.g. `{ singular: "mitra", plural: "mitra" }`.' },
          ]}
        />
      </DocsSection>

      <DocsSection title="BulkActionBarAction">
        <DocsApiTable
          idPrefix="bulk-action-bar-action"
          rows={[
            { name: "id", type: "string", required: true, description: "Stable identifier. Used as React key and DropdownMenu item key." },
            { name: "label", type: "string", required: true, description: "Visible button text. Use a verb — Approve, Reject, Delete." },
            { name: "onClick", type: "() => void | Promise<void>", required: true, description: "Handler. Destructive actions fire only after the confirmation gate." },
            { name: "tone", type: '"neutral" | "primary" | "destructive"', defaultValue: '"neutral"', description: "Action intent. Destructive triggers confirmation." },
            { name: "icon", type: "ReactNode", description: "Optional leading icon." },
            { name: "loading", type: "boolean", defaultValue: "false", description: "Spinner + disable while async work runs." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Block activation (e.g. permission denied)." },
            { name: "confirmMessage", type: "string", description: "Override the default destructive confirmation prompt." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Tokens">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          No raw hex anywhere. All color decisions resolve through semantic tokens — swap the theme, swap the look.
        </p>
        <DocsVariantTable
          nameHeader="Token"
          descHeader="Used for"
          rows={[
            { name: "bg-bg-white-0", description: "Bar surface." },
            { name: "border-stroke-soft-200", description: "Neutral tone border + divider between count and actions." },
            { name: "--primary-alpha-24", description: "Primary tone border." },
            { name: "--state-error-base", description: "Destructive tone border + accent dot." },
            { name: "--state-feature-base", description: "Primary tone accent dot." },
            { name: "bg-bg-strong-950", description: "Neutral accent dot." },
            { name: "text-text-strong-950", description: "Selection count + Clear hover label." },
            { name: "text-text-sub-600", description: "'selected' suffix + Clear default label." },
            { name: "shadow-custom-shadows-medium", description: "Floating shadow — lifted off the workspace surface." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-3 text-base text-text-sub-600 leading-relaxed">
          <li><strong className="text-text-strong-950">Role</strong> — renders <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">role=&quot;toolbar&quot;</code> with a dynamic <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">aria-label</code> reflecting the live selection count.</li>
          <li><strong className="text-text-strong-950">Keyboard</strong> — Tab moves through actions left-to-right. <kbd className="text-xs px-1.5 py-0.5 rounded border border-stroke-soft-200 bg-bg-weak-50">Esc</kbd> dismisses (calls onClear).</li>
          <li><strong className="text-text-strong-950">Focus</strong> — first action receives focus when the bar appears so keyboard users go straight to the verbs.</li>
          <li><strong className="text-text-strong-950">Destructive</strong> — fires a confirmation gate before <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">onClick</code>; loading and disabled both block activation.</li>
          <li><strong className="text-text-strong-950">Motion</strong> — opacity + 12px translate, fast-duration token. Respects <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">prefers-reduced-motion</code> via the shared transition tokens.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
