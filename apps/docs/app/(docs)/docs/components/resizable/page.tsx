"use client"

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/registry/dash/ui/resizable"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ResizableDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Layout"
        title="Resizable"
        description="Splitter for two or more panels with draggable handles. Use for Halo-dash 3-pane shell (list / detail / inspector), code-with-preview layouts, settings nav + content."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add resizable`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="2-pane horizontal"
          preview={
            <div className="h-56 w-full rounded-xl border border-stroke-soft-200 overflow-hidden">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize={35} minSize={20}>
                  <div className="flex h-full items-center justify-center bg-bg-weak-50 text-sm text-text-sub-600">
                    Mitra list
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={65}>
                  <div className="flex h-full items-center justify-center text-sm text-text-sub-600">
                    Detail mitra mtr-9412
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          }
          code={`<ResizablePanelGroup orientation="horizontal">
  <ResizablePanel defaultSize={35} minSize={20}>List</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={65}>Detail</ResizablePanel>
</ResizablePanelGroup>`}
        />

        <DocsExample
          title="3-pane (Halo-dash shell)"
          preview={
            <div className="h-56 w-full rounded-xl border border-stroke-soft-200 overflow-hidden">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize={25} minSize={15}>
                  <div className="flex h-full items-center justify-center bg-bg-weak-50 text-xs text-text-sub-600">
                    Tickets
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center text-xs text-text-sub-600">
                    Conversation
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} minSize={15}>
                  <div className="flex h-full items-center justify-center bg-bg-weak-50 text-xs text-text-sub-600">
                    Inspector
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          }
          code={`<ResizablePanelGroup orientation="horizontal">
  <ResizablePanel defaultSize={25}>Tickets</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={50}>Conversation</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={25}>Inspector</ResizablePanel>
</ResizablePanelGroup>`}
        />
      </DocsSection>

      <DocsSection title="Vertical split">
        <DocsExample
          title="Editor + console"
          description="Vertical resize is common for code-with-output, dispatch detail + log."
          preview={
            <div className="h-72 w-full rounded-xl border border-stroke-soft-200 overflow-hidden">
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={60}>
                  <div className="flex h-full items-center justify-center text-sm text-text-sub-600">
                    Dispatch detail · mtr-9412
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={20}>
                  <div className="flex h-full items-center justify-center bg-bg-weak-50 text-xs text-text-sub-600">
                    [log] 12:04:18 · mitra accepted dispatch
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          }
          code={`<ResizablePanelGroup orientation="vertical">
  <ResizablePanel defaultSize={60}>Detail</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={40} minSize={20}>Log</ResizablePanel>
</ResizablePanelGroup>`}
        />

        <DocsExample
          title="Without handle grip"
          description="Hidden grip — handle still draggable, just no visual affordance. Use for embedded splits."
          preview={
            <div className="h-32 w-full rounded-xl border border-stroke-soft-200 overflow-hidden">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center bg-bg-weak-50 text-xs text-text-sub-600">Left</div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center text-xs text-text-sub-600">Right</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          }
          code={`<ResizableHandle /> {/* withHandle omitted */}`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Resizable untuk power-user shell (3-pane Halo-dash, IDE-style). Persist sizes via autoSaveId supaya layout user survive reload. Set minSize cukup besar (15-20%) — pane terlalu tipis = unreadable.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="h-32 w-full max-w-md rounded-lg border border-stroke-soft-200 overflow-hidden">
                <ResizablePanelGroup orientation="horizontal">
                  <ResizablePanel defaultSize={25} minSize={20}>
                    <div className="flex h-full items-center justify-center bg-bg-weak-50 text-[10px] text-text-sub-600">Tickets</div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="flex h-full items-center justify-center text-[10px] text-text-sub-600">Conversation mtr-9412</div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={25} minSize={20}>
                    <div className="flex h-full items-center justify-center bg-bg-weak-50 text-[10px] text-text-sub-600">Inspector</div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            ),
            caption: "3-pane Halo-dash shell dengan autoSaveId + minSize ≥20%. User drag, layout tersimpan, reload survive. Pane minimum tetap readable.",
          }}
          dont={{
            preview: (
              <div className="h-32 w-full max-w-md rounded-lg border border-stroke-soft-200 overflow-hidden">
                <ResizablePanelGroup orientation="horizontal">
                  <ResizablePanel defaultSize={5}>
                    <div className="flex h-full items-center justify-center bg-bg-weak-50 text-[8px] text-text-sub-600 overflow-hidden">L</div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={95}>
                    <div className="flex h-full items-center justify-center text-[10px] text-text-sub-600">Main</div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            ),
            caption: "Pane 5% tanpa minSize + tanpa autoSaveId = sidebar tidak readable + sizes hilang setiap reload. Pakai minSize 15% min, persist via autoSaveId.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="h-32 w-full max-w-md rounded-lg border border-stroke-soft-200 overflow-hidden">
                <ResizablePanelGroup orientation="vertical">
                  <ResizablePanel defaultSize={60}>
                    <div className="flex h-full items-center justify-center text-[10px] text-text-sub-600">Dispatch detail · DLV-7821</div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={40} minSize={20}>
                    <div className="flex h-full items-center justify-center bg-bg-weak-50 text-[10px] text-text-sub-600">[log] 12:04 · accepted</div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            ),
            caption: "Vertical split untuk dispatch detail + log. Handle visible (withHandle) supaya user tahu bisa di-drag.",
          }}
          dont={{
            preview: (
              <div className="h-32 w-full max-w-md rounded-lg border border-stroke-soft-200 overflow-hidden">
                <ResizablePanelGroup orientation="horizontal">
                  <ResizablePanel defaultSize={50}>
                    <div className="flex h-full items-center justify-center bg-bg-weak-50 text-[10px] text-text-sub-600">A</div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={50}>
                    <div className="flex h-full items-center justify-center text-[10px] text-text-sub-600">B</div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            ),
            caption: "Top-level shell tanpa withHandle = user tidak tahu boundary bisa di-drag. Pakai withHandle untuk surface yang user-facing.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold text-text-strong-950 pt-2">ResizablePanelGroup</h3>
        <DocsPropsTable
          rows={[
            { name: "orientation", type: '"horizontal" | "vertical"', description: "Panel split axis." },
            { name: "autoSaveId", type: "string", description: "Persist panel sizes to localStorage under this key." },
            { name: "onLayout", type: "(sizes: number[]) => void", description: "Fires whenever user drags." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">ResizablePanel</h3>
        <DocsPropsTable
          rows={[
            { name: "defaultSize", type: "number", description: "Initial percentage (0-100). Required when uncontrolled." },
            { name: "minSize", type: "number", description: "Minimum percentage allowed." },
            { name: "maxSize", type: "number", description: "Maximum percentage allowed." },
            { name: "collapsible", type: "boolean", description: "Allow drag to 0%." },
            { name: "collapsedSize", type: "number", description: "Size when collapsed (default 0)." },
            { name: "onCollapse / onExpand", type: "() => void", description: "Fired on collapse / expand." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">ResizableHandle</h3>
        <DocsPropsTable
          rows={[
            { name: "withHandle", type: "boolean", defaultValue: "false", description: "Render visible grip (recommended for top-level splits)." },
            { name: "disabled", type: "boolean", description: "Lock drag." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <code className="text-xs">ResizablePanelGroup</code> wraps an N-pane split. All children must be <code className="text-xs">ResizablePanel</code> or <code className="text-xs">ResizableHandle</code>.</li>
          <li>• Insert one <code className="text-xs">ResizableHandle</code> between each pair of panels.</li>
          <li>• Sum of <code className="text-xs">defaultSize</code> values should = 100.</li>
          <li>• Built on react-resizable-panels — supports keyboard, touch, and autoSave.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Each handle is <code className="text-xs">role=&quot;separator&quot;</code> with <code className="text-xs">aria-orientation</code>.</li>
          <li>• Keyboard: <code className="text-xs">Tab</code> focuses handle; <code className="text-xs">Arrow</code> keys resize ~10%/press; <code className="text-xs">Home</code> / <code className="text-xs">End</code> jump to min / max; <code className="text-xs">F6</code> moves focus between panels.</li>
          <li>• Pass <code className="text-xs">aria-label</code> on each handle describing what is being resized (e.g., &ldquo;Resize Mitra list&rdquo;).</li>
          <li>• Persist with <code className="text-xs">autoSaveId</code> so user&apos;s layout survives reloads — critical for power-user shells.</li>
          <li>• Don&apos;t go below a usable minSize (15-20%); content gets unreadable.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
