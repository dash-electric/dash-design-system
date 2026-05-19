"use client"

import { RiSettings4Line as Settings2 } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/registry/dash/ui/popover"
import { Label } from "@/registry/dash/ui/label"
import { Switch } from "@/registry/dash/ui/switch"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function PopoverDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Overlays"
        title="Popover"
        description="Non-modal floating panel anchored to a trigger. Use for inline forms, settings, filter builders. For action lists use Dropdown Menu instead."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add popover`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { Popover, PopoverTrigger, PopoverContent } from "@/registry/dash/ui/popover"

<Popover>
  <PopoverTrigger asChild><Button>Settings</Button></PopoverTrigger>
  <PopoverContent>…</PopoverContent>
</Popover>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Inline settings panel"
          preview={
            <Popover>
              <PopoverTrigger asChild>
                <Button tone="neutral" style="stroke" leftIcon={<Settings2 className="size-4" />}>
                  Dispatch settings
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold">Dispatch settings</h4>
                    <p className="text-xs text-text-sub-600">Express tribe overrides</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-suspend">Auto-suspend after 3 missed</Label>
                    <Switch id="auto-suspend" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lebaran-freeze">Lebaran rate freeze</Label>
                    <Switch id="lebaran-freeze" />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          }
          code={`<Popover>
  <PopoverTrigger asChild>
    <Button style="stroke" leftIcon={<Settings2 />}>Dispatch settings</Button>
  </PopoverTrigger>
  <PopoverContent>
    <h4>Dispatch settings</h4>
    <Label htmlFor="auto-suspend">Auto-suspend after 3 missed</Label>
    <Switch id="auto-suspend" defaultChecked />
    <Label htmlFor="lebaran-freeze">Lebaran rate freeze</Label>
    <Switch id="lebaran-freeze" />
  </PopoverContent>
</Popover>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "open", type: "boolean", description: "Controlled open. On Popover." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Open callback. On Popover." },
            { name: "asChild", type: "boolean", description: "Forward to child. On PopoverTrigger." },
            { name: "align", type: '"start" | "center" | "end"', defaultValue: '"center"', description: "Horizontal alignment. On PopoverContent." },
            { name: "side", type: '"top" | "right" | "bottom" | "left"', defaultValue: '"bottom"', description: "Anchor side. On PopoverContent." },
            { name: "sideOffset", type: "number", defaultValue: "6", description: "Distance from trigger. On PopoverContent." },
          ]}
        />
      </DocsSection>

      <DocsSection title="More examples">
        <DocsExample
          title="Anchored sides"
          description="Pass side=top/right/bottom/left to position relative to trigger."
          preview={
            <div className="flex flex-wrap gap-3">
              {(["top", "right", "bottom", "left"] as const).map((s) => (
                <Popover key={s}>
                  <PopoverTrigger asChild>
                    <Button tone="neutral" style="stroke" size="sm">side=&ldquo;{s}&rdquo;</Button>
                  </PopoverTrigger>
                  <PopoverContent side={s} className="w-48">
                    <p className="text-sm">Anchored to {s}.</p>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          }
          code={`<PopoverContent side="top">…</PopoverContent>
<PopoverContent side="right">…</PopoverContent>
<PopoverContent side="bottom">…</PopoverContent>
<PopoverContent side="left">…</PopoverContent>`}
        />

        <DocsExample
          title="Mitra mini-profile"
          description="Hover-and-click hover-card hybrid — for table row drill-in without leaving the page."
          preview={
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-sm underline-offset-4 hover:underline">mtr-9412</button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-full bg-bg-weak-50 flex items-center justify-center font-semibold">SP</div>
                  <div>
                    <p className="text-sm font-semibold">Sigit P.</p>
                    <p className="text-xs text-text-sub-600">Reservasi · Bekasi</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-xs text-text-soft-400">Trip</p><p className="text-sm font-semibold tabular-nums">142</p></div>
                  <div><p className="text-xs text-text-soft-400">Rating</p><p className="text-sm font-semibold tabular-nums">4.5</p></div>
                  <div><p className="text-xs text-text-soft-400">Miss 7d</p><p className="text-sm font-semibold tabular-nums text-error-base">3</p></div>
                </div>
              </PopoverContent>
            </Popover>
          }
          code={`<Popover>
  <PopoverTrigger asChild>
    <button className="">mtr-9412</button>
  </PopoverTrigger>
  <PopoverContent>
    {/* avatar + name + stats */}
  </PopoverContent>
</Popover>`}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Popover = inline form / settings panel / contextual editor.</li>
          <li>• Dropdown Menu = list of actions / commands.</li>
          <li>• Modal = full-attention focused task (blocks page).</li>
          <li>• Tooltip = short non-interactive hint.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <code className="text-xs">Popover</code> — Radix Popover root, owns open state.</li>
          <li>• <code className="text-xs">PopoverTrigger</code> — wrap any clickable; use <code className="text-xs">asChild</code> on Button.</li>
          <li>• <code className="text-xs">PopoverContent</code> — portal-rendered panel with shadow + border.</li>
          <li>• Auto-positioned with collision detection — flips when no space available.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Built on Radix Popover — focus moves into content on open, returns to trigger on close.</li>
          <li>• <code className="text-xs">Esc</code> closes; click outside closes; <code className="text-xs">Tab</code> cycles inside content.</li>
          <li>• Trigger gets <code className="text-xs">aria-expanded</code> + <code className="text-xs">aria-controls</code> wired automatically.</li>
          <li>• Don&apos;t nest interactive popovers inside popovers — flatten the design.</li>
          <li>• For hover-only patterns use <code className="text-xs">HoverCard</code> instead; Popover is click-driven.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
