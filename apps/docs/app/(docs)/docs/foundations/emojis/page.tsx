"use client"

import * as React from "react"
import { RiSearchLine as Search } from "@remixicon/react"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Badge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Emojis — Figma 1:1 (1 node verified 2026-05-18).
 *
 *   2806:5205   Master grid — Unicode emoji library across 9 categories
 *
 * Implementation: native Unicode characters. Zero JS bundle weight for the
 * glyphs themselves (the OS renders them). Use for reactions, status, mood
 * pickers, empty-state illustration, social posts.
 */

type EmojiGroup = {
  id: string
  title: string
  emojis: string[]
}

const GROUPS: EmojiGroup[] = [
  {
    id: "smileys",
    title: "Smileys & Emotion",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺️", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿"],
  },
  {
    id: "people",
    title: "People & Body",
    emojis: ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦿", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁", "👅", "👄", "💋", "🩸"],
  },
  {
    id: "hearts",
    title: "Hearts & Symbols",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "💯", "💢", "💥", "💫", "💦", "💨", "🕳", "💣", "💬", "👁‍🗨", "🗨", "🗯", "💭", "💤"],
  },
  {
    id: "animals",
    title: "Animals & Nature",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷", "🕸", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦣", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐈", "🐓", "🦃", "🦤", "🦚", "🦜", "🦢", "🦩", "🕊", "🐇", "🦝", "🦨", "🦡", "🦫", "🦦", "🦥", "🐁", "🐀", "🐿", "🦔"],
  },
  {
    id: "food",
    title: "Food & Drink",
    emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "🫖", "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾", "🧊", "🥄", "🍴", "🍽", "🥢"],
  },
  {
    id: "travel",
    title: "Travel & Places",
    emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🛵", "🏍", "🛺", "🚲", "🛴", "🛹", "🛼", "🚁", "🛸", "✈️", "🛩", "🛫", "🛬", "🪂", "💺", "🚀", "🛰", "🚉", "🚊", "🚝", "🚞", "🚋", "🚃", "🚂", "🚆", "🚇", "🚄", "🚅", "🚈", "🚎", "🚐", "⛽", "🚏", "🚦", "🚥", "🗺", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟", "🎡", "🎢", "🎠", "⛲", "⛱", "🏖", "🏝", "🏜", "🌋", "⛰", "🏔", "🗻", "🏕", "⛺", "🛖", "🏠", "🏡", "🏘", "🏚", "🏗", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🏛", "⛪", "🕌", "🛕", "🕍", "⛩", "🕋", "⛩", "⛲", "🌁", "🌃", "🌄", "🌅", "🌆", "🌇", "🌉", "♨️", "🎆", "🎇", "🌌", "☁️", "⛅", "⛈", "🌤", "🌥", "🌦", "🌧", "🌨", "🌩", "🌪", "🌫", "🌬", "🌀", "🌈", "🌂", "☂️", "☔", "⛱"],
  },
  {
    id: "activities",
    title: "Activities",
    emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸", "🥌", "🎿", "⛷", "🏂", "🪂", "🏋️", "🤼", "🤸", "⛹️", "🤺", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚵", "🚴", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖", "🏵", "🎗", "🎫", "🎟", "🎪", "🤹", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🪗", "🎸", "🪕", "🎻", "🎲", "♟", "🎯", "🎳", "🎮", "🎰", "🧩"],
  },
  {
    id: "objects",
    title: "Objects",
    emojis: ["⌚", "📱", "📲", "💻", "⌨️", "🖥", "🖨", "🖱", "🖲", "🕹", "🗜", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽", "🎞", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙", "🎚", "🎛", "🧭", "⏱", "⏲", "⏰", "🕰", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯", "🪔", "🧯", "🛢", "💸", "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰", "🪛", "🔧", "🔨", "⚒", "🛠", "⛏", "🪚", "🔩", "⚙️", "🪤", "🧱", "⛓", "🧲", "🔫", "💣", "🧨", "🪓", "🔪", "🗡", "⚔️", "🛡", "🚬", "⚰️", "🪦", "⚱️", "🏺", "🔮", "📿", "🧿", "💈", "⚗️", "🔭", "🔬", "🕳", "🩹", "🩺", "💊", "💉", "🩸", "🧬", "🦠", "🧫", "🧪", "🌡", "🧹", "🪠", "🧺", "🧻", "🚽", "🚰", "🚿", "🛁", "🛀", "🧼", "🪥", "🪒", "🧽", "🪣", "🧴", "🛎", "🔑", "🗝", "🚪", "🪑", "🛋", "🛏", "🛌", "🧸", "🪆", "🖼", "🪞", "🪟", "🛍", "🛒", "🎁", "🎈", "🎏", "🎀", "🪄", "🪅", "🎊", "🎉", "🎎", "🏮", "🎐"],
  },
  {
    id: "symbols",
    title: "Symbols & Flags",
    emojis: ["⚪", "⚫", "🔴", "🔵", "🟠", "🟡", "🟢", "🟣", "🟤", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫", "⬛", "⬜", "◼️", "◻️", "◾", "◽", "▪️", "▫️", "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💠", "🔘", "🔳", "🔲", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "♻️", "✅", "❌", "❎", "✔️", "❇️", "✳️", "❓", "❔", "❗", "❕", "‼️", "⁉️", "©️", "®️", "™️", "ℹ️", "Ⓜ️", "🆘", "🆚", "🆎", "🆑", "🆒", "🆓", "🆕", "🆖", "🆗", "🆙", "🚫", "⛔", "📛", "🚭", "🔞", "📵", "🚯", "🚱", "🚳", "🚷", "🆘", "✴️", "🌟", "⭐", "🌠", "☄️", "💫", "✨"],
  },
]

const TOTAL = GROUPS.reduce((sum, g) => sum + g.emojis.length, 0)

export default function EmojisPage() {
  const [query, setQuery] = React.useState("")
  const [activeGroup, setActiveGroup] = React.useState<string>("all")

  const filtered = GROUPS.map((g) => ({
    ...g,
    emojis:
      activeGroup === "all" || activeGroup === g.id
        ? g.emojis.filter((e) => !query || e.includes(query))
        : [],
  })).filter((g) => g.emojis.length)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Foundations"
        title="Emojis"
        description="Native Unicode emoji library — 9 categories, 800+ glyphs. Zero asset weight (OS renders the glyph). Use for reactions, status indicators, mood pickers, empty-state illustration, casual marketing surfaces. Avoid in critical UI labels — emoji rendering varies across OS / browsers."
      />

      <DocsSection title="How it works">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Render Unicode characters directly. No image fetching, no JS bundle hit. Apple/Google/Microsoft/Mozilla render differently — design for the worst-case fallback (Windows desktop is most spartan).
        </p>
        <DocsCode
          language="tsx"
          code={`// Inline literal — simplest path
<span className="text-xl">👋</span>

// Helper with accessible name
<span role="img" aria-label="waving hand" className="text-xl">👋</span>`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Emoji scales with <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">font-size</code>. Use the standard Tailwind text-* scale.
        </p>
        <DocsExample
          title="Size matrix"
          preview={
            <div className="flex items-end gap-4">
              {(["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl"] as const).map((s) => (
                <div key={s} className="text-center space-y-1">
                  <div className={s}>🎉</div>
                  <div className="text-[10px] text-text-soft-400">{s.replace("text-", "")}</div>
                </div>
              ))}
            </div>
          }
          code={`<span className="text-xs">🎉</span>
<span className="text-2xl">🎉</span>
<span className="text-5xl">🎉</span>`}
        />
      </DocsSection>

      <DocsSection title="Usage examples">
        <DocsExample
          title="Mood / status picker"
          preview={
            <div className="flex flex-wrap items-center gap-2 max-w-md">
              {[
                { label: "Happy", emoji: "😀" },
                { label: "Focused", emoji: "🎯" },
                { label: "Busy", emoji: "⏰" },
                { label: "Vacation", emoji: "🏖" },
                { label: "Sick", emoji: "🤒" },
              ].map((m) => (
                <button
                  key={m.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 hover:bg-bg-weak-50 px-3 h-8 text-sm"
                >
                  <span className="text-base">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          }
          code={`<button>
  <span>{m.emoji}</span> {m.label}
</button>`}
        />
        <DocsExample
          title="Reaction bar"
          preview={
            <div className="inline-flex items-center gap-1 rounded-full border border-stroke-soft-200 bg-bg-white-0 p-1">
              {[
                { emoji: "👍", count: 12 },
                { emoji: "❤️", count: 7 },
                { emoji: "😂", count: 3 },
                { emoji: "🎉", count: 1 },
              ].map((r) => (
                <button
                  key={r.emoji}
                  className="inline-flex items-center gap-1 rounded-full hover:bg-bg-weak-50 px-2 h-7 text-xs"
                >
                  <span className="text-sm">{r.emoji}</span>
                  <span className="tabular-nums text-text-sub-600">{r.count}</span>
                </button>
              ))}
              <button className="inline-flex size-7 items-center justify-center rounded-full hover:bg-bg-weak-50 text-sm">+</button>
            </div>
          }
          code={`{reactions.map(r => (
  <button>{r.emoji} <span>{r.count}</span></button>
))}`}
        />
        <DocsExample
          title="Empty-state illustration"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-8 text-center max-w-sm mx-auto">
              <div className="text-5xl mb-2">📭</div>
              <div className="text-sm font-medium text-text-strong-950">No messages yet</div>
              <div className="text-xs text-text-sub-600 mt-1">When teammates send you something, it'll show up here.</div>
            </div>
          }
          code={`<div className="text-center">
  <div className="text-5xl">📭</div>
  <h3>No messages yet</h3>
  <p>...</p>
</div>`}
        />
      </DocsSection>

      <DocsSection title="Catalog">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Browse {TOTAL}+ glyphs across {GROUPS.length} categories. Click any emoji to copy its glyph.
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex-1 max-w-md">
            <InputRoot>
              <InputIcon><Search className="size-4" /></InputIcon>
              <Input placeholder="Search emoji…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </InputRoot>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: "all", title: "All" }, ...GROUPS.map((g) => ({ id: g.id, title: g.title }))].map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.id)}
                className={cn(
                  "inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium border transition-colors",
                  activeGroup === g.id
                    ? "bg-bg-strong-950 text-white border-bg-strong-950"
                    : "border-stroke-soft-200 text-text-sub-600 hover:bg-bg-weak-50",
                )}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-stroke-soft-200 p-8 text-center text-sm text-text-sub-600">
              No emoji match.
            </div>
          ) : (
            filtered.map((g) => (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-text-strong-950 inline-flex items-center gap-2">
                    {g.title}
                    <Badge size="sm" appearance="lighter" status="information">{g.emojis.length}</Badge>
                  </h3>
                </div>
                <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-1 p-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
                  {g.emojis.map((e, i) => (
                    <button
                      key={`${e}-${i}`}
                      onClick={() => {
                        if (typeof navigator !== "undefined") navigator.clipboard?.writeText(e)
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-xl hover:bg-bg-weak-50 transition-colors"
                      title={`Copy ${e}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Meaningful emoji</strong> — wrap in <code className="text-xs">{`<span role="img" aria-label="...">`}</code> when the emoji carries information (status, reaction count).</li>
          <li>• <strong>Decorative emoji</strong> — wrap in <code className="text-xs">aria-hidden=&quot;true&quot;</code> when paired with visible text label (avoid SR repetition).</li>
          <li>• <strong>Skin-tone modifiers</strong> — Unicode supports 5 skin tones via Fitzpatrick modifiers (👋🏻 👋🏼 👋🏽 👋🏾 👋🏿). Use when relevant; default yellow when not.</li>
          <li>• <strong>Color contrast</strong> — emoji are inherently low-contrast against busy backgrounds. Add a subtle bg or border in critical UI surfaces.</li>
          <li>• <strong>Internationalization</strong> — emoji meaning varies across cultures (👍 = offensive in some regions). Test with real users.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Caveats">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Platform rendering</strong> — Apple Color Emoji ≠ Google Noto ≠ Microsoft Segoe UI Emoji ≠ Twemoji. The same glyph looks different per OS.</li>
          <li>• <strong>Outdated platforms</strong> — older Windows / Android may render unknown glyphs as a blank square (.tofu). Avoid newest Unicode versions for cross-platform.</li>
          <li>• <strong>Critical UI</strong> — don't rely on emoji alone for status, error, success indicators. Pair with text or use Remix icon.</li>
          <li>• <strong>Search</strong> — string search on emoji is character-based, not name-based. Consider integrating a named-emoji library (e.g. node-emoji) if name search needed.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "GROUPS", type: "EmojiGroup[]", description: "Built-in category catalog (Smileys / People / Hearts / Animals / Food / Travel / Activities / Objects / Symbols)." },
            { name: "EmojiGroup.id", type: "string", description: "Stable category identifier." },
            { name: "EmojiGroup.title", type: "string", description: "Display name." },
            { name: "EmojiGroup.emojis", type: "string[]", description: "Array of Unicode emoji literals." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
