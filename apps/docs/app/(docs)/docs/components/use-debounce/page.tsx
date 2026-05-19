"use client"

import { useState } from "react"
import { useDebounce } from "@/registry/dash/hooks/use-debounce"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function UseDebounceDocsPage() {
  const [raw, setRaw] = useState("")
  const debounced = useDebounce(raw, 400)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Utils / Hooks"
        title="useDebounce"
        description="Debounces fast-changing values so downstream effects (search API, validation, autosave) only fire after typing settles."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add use-debounce`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Search input"
          preview={
            <div className="space-y-2 max-w-md w-full">
              <InputRoot>
                <Input
                  placeholder="Cari mitra…"
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                />
              </InputRoot>
              <p className="text-xs text-text-sub-600">
                Raw value: <span className="">{raw || "—"}</span>
              </p>
              <p className="text-xs text-text-sub-600">
                Debounced (400ms): <span className="">{debounced || "—"}</span>
              </p>
            </div>
          }
          code={`const [raw, setRaw] = useState("")
const debounced = useDebounce(raw, 400)

useEffect(() => {
  if (!debounced) return
  fetch("/api/mitra?q=" + debounced)
}, [debounced])`}
        />

        <DocsExample
          title="Debounced callback"
          preview={<p className="text-sm text-text-sub-600">See code on the right.</p>}
          code={`const save = useDebouncedCallback((value: string) => {
  fetch("/api/save", { method: "POST", body: value })
}, 600)

<Input onChange={(e) => save(e.target.value)} />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold text-text-strong-950 pt-2">useDebounce&lt;T&gt;(value, delay)</h3>
        <DocsPropsTable
          rows={[
            { name: "value", type: "T", description: "Fast-changing value to debounce." },
            { name: "delay", type: "number", defaultValue: "300", description: "Debounce window in ms." },
            { name: "returns", type: "T", description: "Latest value, updated only after delay ms of inactivity." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">useDebouncedCallback(fn, delay)</h3>
        <DocsPropsTable
          rows={[
            { name: "fn", type: "(...args) => void", description: "Callback to debounce. Latest version is captured on each render." },
            { name: "delay", type: "number", defaultValue: "300", description: "Debounce window in ms." },
            { name: "returns", type: "(...args) => void", description: "Stable callback — safe to use as dep / pass into event handlers." },
          ]}
        />
      </DocsSection>

      <DocsSection title="When to use which">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <code className="text-xs">useDebounce</code> for derived values — pass debounced into <code className="text-xs">useEffect</code> deps, React Query keys.</li>
          <li>• <code className="text-xs">useDebouncedCallback</code> for side effects — autosave, analytics events, scroll handlers.</li>
          <li>• 300ms ≈ rapid typing (search-as-you-type). 600ms ≈ form autosave. 1000ms+ ≈ destructive ops.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• When debouncing search input, announce result count to screen readers via <code className="text-xs">aria-live=&quot;polite&quot;</code> on the result region.</li>
          <li>• Do not debounce keyboard navigation (Arrow keys in lists) — only debounce fetches / writes triggered by typing.</li>
          <li>• Clear the in-flight timer on unmount — hook handles automatically via <code className="text-xs">useEffect</code> cleanup.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
