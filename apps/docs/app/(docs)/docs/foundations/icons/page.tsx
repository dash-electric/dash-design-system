import {
  RiSearchLine,
  RiNotification3Line,
  RiSettings3Line,
  RiUserLine,
  RiAddLine,
  RiCloseLine,
  RiCheckLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiDownloadLine,
  RiUploadLine,
  RiDeleteBinLine,
  RiEditLine,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLockLine,
  RiLockUnlockLine,
  RiCalendarLine,
  RiTimeLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiTruckLine,
  RiBox3Line,
  RiBankCardLine,
  RiFilter3Line,
  RiMoreLine,
  RiMore2Line,
  RiMenuLine,
  RiHome5Line,
  RiFileTextLine,
  RiFolderLine,
  RiImageLine,
  RiStarLine,
  RiHeartLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiInformationLine,
} from "@remixicon/react"



import { cn } from "@/registry/dash/lib/utils"
import { DocsDoDont } from "@/components/docs/page-shell"

const sizeTokens = [
  { token: "size-3", px: 12, demo: "size-3" },
  { token: "size-4", px: 16, demo: "size-4" },
  { token: "size-5", px: 20, demo: "size-5" },
  { token: "size-6", px: 24, demo: "size-6" },
  { token: "size-8", px: 32, demo: "size-8" },
  { token: "size-10", px: 40, demo: "size-10" },
] as const

const colorSlots = [
  { token: "--icon-strong", className: "text-icon-strong", desc: "Default — body text icons, list rows, active states" },
  { token: "--icon-sub", className: "text-icon-sub", desc: "Secondary — labels, helper UI, less emphasis than strong" },
  { token: "--icon-soft", className: "text-icon-soft", desc: "Tertiary — placeholder, decorative, disabled-adjacent" },
  { token: "--icon-disabled", className: "text-icon-disabled", desc: "Disabled — non-interactive controls" },
] as const

const showcaseIcons = [
  { Icon: RiSearchLine, name: "RiSearchLine" },
  { Icon: RiNotification3Line, name: "RiNotification3Line" },
  { Icon: RiSettings3Line, name: "RiSettings3Line" },
  { Icon: RiUserLine, name: "RiUserLine" },
  { Icon: RiAddLine, name: "RiAddLine" },
  { Icon: RiCloseLine, name: "RiCloseLine" },
  { Icon: RiCheckLine, name: "RiCheckLine" },
  { Icon: RiArrowDownSLine, name: "RiArrowDownSLine" },
  { Icon: RiArrowRightSLine, name: "RiArrowRightSLine" },
  { Icon: RiArrowRightLine, name: "RiArrowRightLine" },
  { Icon: RiArrowLeftLine, name: "RiArrowLeftLine" },
  { Icon: RiDownloadLine, name: "RiDownloadLine" },
  { Icon: RiUploadLine, name: "RiUploadLine" },
  { Icon: RiDeleteBinLine, name: "RiDeleteBinLine" },
  { Icon: RiEditLine, name: "RiEditLine" },
  { Icon: RiFileCopyLine, name: "RiFileCopyLine" },
  { Icon: RiExternalLinkLine, name: "RiExternalLinkLine" },
  { Icon: RiEyeLine, name: "RiEyeLine" },
  { Icon: RiEyeOffLine, name: "RiEyeOffLine" },
  { Icon: RiLockLine, name: "RiLockLine" },
  { Icon: RiLockUnlockLine, name: "RiLockUnlockLine" },
  { Icon: RiCalendarLine, name: "RiCalendarLine" },
  { Icon: RiTimeLine, name: "RiTimeLine" },
  { Icon: RiMailLine, name: "RiMailLine" },
  { Icon: RiPhoneLine, name: "RiPhoneLine" },
  { Icon: RiMapPinLine, name: "RiMapPinLine" },
  { Icon: RiTruckLine, name: "RiTruckLine" },
  { Icon: RiBox3Line, name: "RiBox3Line" },
  { Icon: RiBankCardLine, name: "RiBankCardLine" },
  { Icon: RiFilter3Line, name: "RiFilter3Line" },
  { Icon: RiMoreLine, name: "RiMoreLine" },
  { Icon: RiMore2Line, name: "RiMore2Line" },
  { Icon: RiMenuLine, name: "RiMenuLine" },
  { Icon: RiHome5Line, name: "RiHome5Line" },
  { Icon: RiFileTextLine, name: "RiFileTextLine" },
  { Icon: RiFolderLine, name: "RiFolderLine" },
  { Icon: RiImageLine, name: "RiImageLine" },
  { Icon: RiStarLine, name: "RiStarLine" },
  { Icon: RiHeartLine, name: "RiHeartLine" },
  { Icon: RiErrorWarningLine, name: "RiErrorWarningLine" },
  { Icon: RiCheckboxCircleLine, name: "RiCheckboxCircleLine" },
  { Icon: RiCloseCircleLine, name: "RiCloseCircleLine" },
  { Icon: RiInformationLine, name: "RiInformationLine" },
]

export default function IconsPage() {
  return (
    <article className="mx-auto max-w-5xl px-6 lg:px-10 py-12 space-y-14">
      <header>
        <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">
          Foundations
        </div>
        <h1 className="text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] mb-4">
          Icons
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Dash ships icons via{" "}
          <a href="https://remixicon.com/" className="text-primary hover:underline" target="_blank" rel="noreferrer">
            Remix Icon
          </a>
          {" "}(via <code className="text-xs px-1 py-0.5 rounded bg-muted">@remixicon/react</code>) — the
          same icon library the source AlignUI Figma is drawn from. Apache-2.0
          licensed, tree-shakable, 3,000+ glyphs, and editable as plain SVG
          components. Tokens for icon color and size live alongside the rest of the
          system.
        </p>
      </header>

      {/* Hero */}
      <section
        className="rounded-2xl border border-border p-10"
        style={{
          background: "linear-gradient(135deg, var(--dash-blue-50), var(--dash-purple-50))",
        }}
      >
        <div className="grid sm:grid-cols-3 gap-6 dark:hidden">
          {[RiSearchLine, RiNotification3Line, RiTruckLine, RiBox3Line, RiMapPinLine, RiBankCardLine].map((Icon, i) => (
            <div
              key={i}
              className="flex items-center justify-center aspect-square rounded-xl bg-background/70 backdrop-blur-sm"
              style={{ boxShadow: "var(--shadow-xs)" }}
            >
              <Icon className="size-10 text-icon-strong" />
            </div>
          ))}
        </div>
        <div className="hidden dark:grid sm:grid-cols-3 gap-6">
          {[RiSearchLine, RiNotification3Line, RiTruckLine, RiBox3Line, RiMapPinLine, RiBankCardLine].map((Icon, i) => (
            <div
              key={i}
              className="flex items-center justify-center aspect-square rounded-xl bg-card"
            >
              <Icon className="size-10 text-icon-strong" />
            </div>
          ))}
        </div>
      </section>

      {/* Why Remix Icon */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          {
            title: "Matches the source",
            body: "AlignUI Figma uses Remix Icon — picking the same library means zero drift between Figma frames and the rendered product.",
          },
          {
            title: "Line + Fill pairs",
            body: "Every glyph ships as both a Line (outline) and Fill (solid) variant — RiSearchLine, RiSearchFill. Use Line for default UI, Fill for active/selected states.",
          },
          {
            title: "3000+ glyphs",
            body: "Covers the full Dash domain (logistics, finance, dashboards) plus general UI, brand logos, weather, devices. Browse remixicon.com.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold text-foreground mb-1.5">{item.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      {/* Sizes */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Sizes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Reuse Tailwind&apos;s <code className="text-xs px-1 py-0.5 rounded bg-muted">size-*</code> utilities — no
          dedicated icon size tokens. Most product UI lives at <code className="text-xs px-1 py-0.5 rounded bg-muted">size-4</code> (16px) and{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">size-5</code> (20px).
        </p>
        <div className="rounded-lg border border-border bg-card p-6 flex flex-wrap items-end gap-8">
          {sizeTokens.map((s) => (
            <div key={s.token} className="flex flex-col items-center gap-2">
              <RiNotification3Line className={cn(s.demo, "text-icon-strong")} />
              <div className="text-[10px] text-muted-foreground">
                {s.token} · {s.px}px
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Color slots */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Color slots</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Four semantic icon colors. They follow the rest of the theme — <code className="text-xs px-1 py-0.5 rounded bg-muted">.dark</code> automatically flips them.
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {colorSlots.map((slot) => (
            <div key={slot.token} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_auto] items-center gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <RiNotification3Line className={cn("size-6", slot.className)} />
                <code className="text-xs text-foreground">{slot.token}</code>
              </div>
              <p className="text-sm text-muted-foreground">{slot.desc}</p>
              <code className="text-[10px] text-muted-foreground sm:text-right">
                text-{slot.token.replace("--", "")}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Icon catalog preview */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-1">Common icons in Dash UI</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A starter set used across the dashboard, mitra screens, and dispatch flows.
          Browse the full library at{" "}
          <a href="https://remixicon.com/" className="text-primary hover:underline" target="_blank" rel="noreferrer">
            remixicon.com
          </a>
          .
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-7 gap-2">
          {showcaseIcons.map(({ Icon, name }) => (
            <div
              key={name}
              className="aspect-square rounded-lg border border-border bg-card flex flex-col items-center justify-center gap-1.5 p-3 hover:border-foreground/30 transition-colors"
            >
              <Icon className="size-5 text-icon-strong" />
              <code className="text-[9px] text-muted-foreground truncate w-full text-center">
                {name}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Usage</h2>
        <div className="rounded-lg bg-(--dash-slate-950) text-(--dash-slate-100) p-5 text-sm overflow-x-auto">
          <div className="text-(--dash-slate-400) mb-1"># tree-shaken named import</div>
          <div>{`import { RiSearchLine, RiNotification3Line } from "@remixicon/react"


`}</div>
          <div className="text-(--dash-slate-400) mt-3 mb-1"># default size + color via tokens</div>
          <div>{`<RiSearchLine className="size-5 text-icon-sub" />`}</div>
          <div className="text-(--dash-slate-400) mt-3 mb-1"># brand accent</div>
          <div>{`<RiNotification3Line className="size-5 text-primary" />`}</div>
          <div className="text-(--dash-slate-400) mt-3 mb-1"># Line vs Fill — outline default, fill on active</div>
          <div>{`<RiHome5Line />  {/* default nav item */}`}</div>
          <div>{`<RiHome5Fill />  {/* selected nav item */}`}</div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Rules</h2>
        <ul className="space-y-3 text-base text-foreground/90">
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Default to the <code className="text-xs px-1 py-0.5 rounded bg-muted">Line</code> variant across product UI. Reserve <code className="text-xs px-1 py-0.5 rounded bg-muted">Fill</code> for active/selected states (nav item, toggle on, filled rating).</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Pair icon size with text size: <code className="text-xs px-1 py-0.5 rounded bg-muted">size-4</code> with text-sm, <code className="text-xs px-1 py-0.5 rounded bg-muted">size-5</code> with text-base, <code className="text-xs px-1 py-0.5 rounded bg-muted">size-6</code> with text-lg+.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Use <code className="text-xs px-1 py-0.5 rounded bg-muted">aria-hidden</code> when icon is purely decorative; otherwise pair with <code className="text-xs px-1 py-0.5 rounded bg-muted">aria-label</code>.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Avoid raw color hex on icons — always reach for an <code className="text-xs px-1 py-0.5 rounded bg-muted">--icon-*</code> token, a semantic color (<code className="text-xs px-1 py-0.5 rounded bg-muted">text-primary</code>), or an extension scale (<code className="text-xs px-1 py-0.5 rounded bg-muted">text-(--dash-orange-500)</code>).</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Stroke width is fixed per variant — Remix Icon ships pre-weighted SVG, no <code className="text-xs px-1 py-0.5 rounded bg-muted">strokeWidth</code> prop needed.</span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
            <span>Need a custom icon (Dash logo marks, country flags, brand glyphs)? Add to <code className="text-xs px-1 py-0.5 rounded bg-muted">components/icons/dash/</code> and export individual SVG components — never bundle all in one file.</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Source</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          source design Figma ships its icon library on top of Remix Icon. Dash
          adopts the same library directly via{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">@remixicon/react</code>{" "}
          so every glyph in the rendered product matches the Figma source 1:1,
          with no re-export step. Icon color and stroke tokens (<code className="text-xs px-1 py-0.5 rounded bg-muted">--icon-strong</code>,{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">--icon-sub</code>,{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">--icon-soft</code>,{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-muted">--icon-disabled</code>) are extracted from the Icons page of the Dash-licensed source design Figma.
        </p>
      </section>
      <section className="space-y-4">
        <header><h2 className="text-2xl font-semibold tracking-tight">Remix Icon set</h2><p className="text-sm text-muted-foreground max-w-2xl mt-1">Dash uses Remix Icon exclusively in product UI. Don't mix Lucide, Heroicons, and emojis in the same surface.</p></header>
        <DocsDoDont
          do={{
            preview: (
              <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
                <div className="size-9 rounded-md border border-border flex items-center justify-center"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12l9-9 9 9M5 10v10h14V10" /></svg></div>
                <div className="size-9 rounded-md border border-border flex items-center justify-center"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="13" height="10" rx="1" /><path d="M15 10h4l3 3v4h-7z" /></svg></div>
                <div className="size-9 rounded-md border border-border flex items-center justify-center"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" /></svg></div>
                <div className="size-9 rounded-md border border-border flex items-center justify-center"><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 01-.3 2l1.6 1.2-2 3.4-1.9-.8a7 7 0 01-3.4 2L12 22h-4l-.4-2.2a7 7 0 01-3.4-2l-1.9.8-2-3.4 1.6-1.2A7 7 0 011.6 12c0-.7.1-1.3.3-2L.3 8.8l2-3.4 1.9.8a7 7 0 013.4-2L8 2h4l.4 2.2a7 7 0 013.4 2l1.9-.8 2 3.4-1.6 1.2c.2.7.3 1.3.3 2z" /></svg></div>
              </div>
            ),
            caption: "Line variants by default (1.5px stroke), fill for active states. Single icon system end-to-end.",
          }}
          dont={{
            preview: (
              <div className="grid grid-cols-4 gap-2 w-full max-w-sm text-2xl text-center">
                <div>🏠</div><div>🚛</div><div>👨‍👩‍👧</div><div>⚙</div>
              </div>
            ),
            caption: "Don't substitute emoji for icons. Different shape per OS, ignores brand color tokens, breaks accessibility tree.",
          }}
        />
      </section>

      <section className="space-y-4">
        <header><h2 className="text-2xl font-semibold tracking-tight">Stroke weight matches size</h2><p className="text-sm text-muted-foreground max-w-2xl mt-1">16px icons get 1.5px stroke. 24px icons get 1.5px. 48px hero icons may take 2px. Don't scale a 12px icon to 48px — strokes vanish.</p></header>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-end gap-3">
                <div className="size-5 rounded border border-border flex items-center justify-center"><svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8h12M8 2v12" /></svg></div>
                <div className="size-7 rounded border border-border flex items-center justify-center"><svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10h14M10 3v14" /></svg></div>
                <div className="size-9 rounded border border-border flex items-center justify-center"><svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h16M12 4v16" /></svg></div>
              </div>
            ),
            caption: "Three sizes, calibrated stroke at each. Visually consistent weight across the system.",
          }}
          dont={{
            preview: (
              <div className="flex items-end gap-3">
                <div className="size-3 rounded border border-border flex items-center justify-center"><svg viewBox="0 0 24 24" className="size-2" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M4 12h16M12 4v16" /></svg></div>
                <div className="size-12 rounded border border-border flex items-center justify-center"><svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 12h16M12 4v16" /></svg></div>
              </div>
            ),
            caption: "Don't scale a single icon source to extreme sizes. Strokes go fuzzy at 8px and chunky at 48px.",
          }}
        />
      </section>
        </article>
  )
}
