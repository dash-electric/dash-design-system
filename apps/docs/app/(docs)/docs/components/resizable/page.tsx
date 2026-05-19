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
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ResizableDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Layout"
        title="Resizable"
        description="Splitter for two or more panels with draggable handles. Use for Halo-dash 3-pane shell (list / detail / inspector), code-with-preview layouts, settings nav + content."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add resizable`} />
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
