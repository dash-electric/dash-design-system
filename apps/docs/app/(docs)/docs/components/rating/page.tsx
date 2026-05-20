"use client"

import * as React from "react"
import {
  RiStarLine as Star,
  RiHeart3Line as Heart,
  RiThumbUpLine as ThumbUp,
  RiThumbDownLine as ThumbDown,
  RiFlag2Line as Flag,
  RiVerifiedBadgeFill as Verified,
  RiCloseLine as Close,
  RiExternalLinkLine as External,
  RiChat3Line as Chat,
} from "@remixicon/react"
import { Rating } from "@/registry/dash/ui/rating"
import { Avatar, AvatarImage, AvatarFallback, AvatarIndicator } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Rating — Figma 1:1 (16 nodes verified 2026-05-18).
 *
 * Patterns:
 *   - Star row (default, yellow-500 fill)
 *   - Half-step star row
 *   - Heart row (icon override + tone="error")
 *   - Stars + score + reviews-count composition
 *   - Sizes (sm / md / lg)
 *   - Read-only display variant
 *   - Profile card with rating + report flag
 *   - Emoji mood picker (5-step, inline helper)
 *   - Helpful / Not-helpful binary picker (inline helper)
 *   - "Help us improve" feedback dialog
 */

/* -------------------------------------------------------------------------- */
/*  Inline emoji-mood helper                                                  */
/* -------------------------------------------------------------------------- */

const MOOD_EMOJIS = ["😞", "🙁", "😐", "🙂", "😄"]

const EmojiMood = ({
  value,
  onValueChange,
}: {
  value: number | null
  onValueChange: (v: number) => void
}) => (
  <div
    role="radiogroup"
    className="inline-flex w-full rounded-md border border-stroke-soft-200 divide-x divide-stroke-soft-200 overflow-hidden"
  >
    {MOOD_EMOJIS.map((emoji, i) => {
      const v = i + 1
      const active = value === v
      return (
        <button
          key={v}
          type="button"
          aria-label={`${v} of ${MOOD_EMOJIS.length}`}
          onClick={() => onValueChange(v)}
          className={[
            "flex-1 inline-flex items-center justify-center py-2 text-xl transition-colors",
            active ? "bg-(--state-warning-light)" : "hover:bg-bg-weak-50",
          ].join(" ")}
        >
          {emoji}
        </button>
      )
    })}
  </div>
)

/* -------------------------------------------------------------------------- */
/*  Inline thumbs helper                                                      */
/* -------------------------------------------------------------------------- */

const ThumbsPicker = ({
  value,
  onValueChange,
}: {
  value: "helpful" | "not" | null
  onValueChange: (v: "helpful" | "not") => void
}) => (
  <div role="radiogroup" className="inline-flex items-center gap-2">
    {([
      { id: "helpful", Icon: ThumbUp,   label: "Helpful" },
      { id: "not",     Icon: ThumbDown, label: "Not helpful" },
    ] as const).map((opt) => {
      const active = value === opt.id
      const Icon = opt.Icon
      return (
        <button
          key={opt.id}
          type="button"
          onClick={() => onValueChange(opt.id)}
          aria-pressed={active}
          className={[
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            active
              ? "bg-(--primary-alpha-16) text-primary"
              : "bg-bg-weak-50 text-text-sub-600 hover:text-text-strong-950",
          ].join(" ")}
        >
          <Icon className="size-3.5" />
          {opt.label}
        </button>
      )
    })}
  </div>
)

/* -------------------------------------------------------------------------- */

export default function RatingDocsPage() {
  const [stars, setStars] = React.useState(4.5)
  const [hearts, setHearts] = React.useState(4)
  const [mood, setMood] = React.useState<number | null>(4)
  const [thumb, setThumb] = React.useState<"helpful" | "not" | null>("helpful")
  const [feedback, setFeedback] = React.useState("")

  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="specialized"
        category="Components / Forms"
        title="Rating"
        description="Star / heart row with half-step support, hover preview, controlled value 0..max. Swap the glyph via icon and the fill colour via tone. Compose with score + reviews count for product cards; use the inline EmojiMood + ThumbsPicker helpers for feedback flows."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add rating`} />
      </DocsSection>

      <DocsSection title="Star row">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default 5-star rating with yellow-500 fill. Click a star to set; hover to preview. Set <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">allowHalf</code> for 0.5 precision.
        </p>
        <DocsExample
          title="Whole + half star pickers"
          preview={
            <div className="space-y-4">
              <Rating value={stars} onValueChange={setStars} />
              <Rating value={stars} onValueChange={setStars} allowHalf />
              <span className="text-xs text-text-soft-400">Selected: <strong className="text-text-strong-950">{stars}</strong></span>
            </div>
          }
          code={`<Rating value={stars} onValueChange={setStars} />
<Rating value={stars} onValueChange={setStars} allowHalf />`}
        />
      </DocsSection>

      <DocsSection title="Read-only display">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Pass <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">readOnly</code> to render a static rating (no hover buttons, no interaction). Use for product cards / review lists.
        </p>
        <DocsExample
          title="Static 4.5"
          preview={
            <div className="space-y-3">
              <Rating value={4.5} readOnly allowHalf />
              <Rating value={3.5} readOnly allowHalf />
              <Rating value={5} readOnly />
            </div>
          }
          code={`<Rating value={4.5} readOnly allowHalf />`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Three sizes — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm (16px)</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">md (20px)</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">lg (24px)</code>.
        </p>
        <DocsExample
          title="3 sizes"
          preview={
            <div className="flex items-end gap-6">
              {(["sm","md","lg"] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <Rating value={4.5} readOnly allowHalf size={s} />
                  <span className="text-[10px] text-text-soft-400">{s}</span>
                </div>
              ))}
            </div>
          }
          code={`<Rating value={4.5} size="sm" readOnly allowHalf />
<Rating value={4.5} size="md" readOnly allowHalf />
<Rating value={4.5} size="lg" readOnly allowHalf />`}
        />
      </DocsSection>

      <DocsSection title="Score + reviews composition">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Pair Rating with score + total-ratings + reviews-link inline. Standard product / course card pattern.
        </p>
        <DocsExample
          title='4.5 · 5.2K Ratings · 18 reviews'
          preview={
            <div className="space-y-4">
              <Rating value={4.5} readOnly allowHalf />
              <div className="space-y-1">
                <Rating value={4.5} readOnly allowHalf />
                <div className="text-sm text-text-sub-600 flex items-center gap-2">
                  <strong className="text-text-strong-950">4.5</strong>
                  <span className="text-text-soft-400">·</span>
                  5.2K Ratings
                  <a href="#" className="text-primary underline underline-offset-4 hover:no-underline">18 reviews</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Rating value={4.5} readOnly allowHalf />
                <span className="text-sm text-text-sub-600">
                  <strong className="text-text-strong-950">4.5</strong> · 5.2K Ratings <a href="#" className="text-primary underline underline-offset-4 hover:no-underline">18 reviews</a>
                </span>
              </div>
            </div>
          }
          code={`<Rating value={4.5} readOnly allowHalf />
<div>
  <strong>4.5</strong> · 5.2K Ratings <a>18 reviews</a>
</div>`}
        />
      </DocsSection>

      <DocsSection title="Heart row">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Pass <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">icon={"{Heart}"}</code> + <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">tone="error"</code> for a love/like row. Same API as stars — supports half, sizes, readOnly.
        </p>
        <DocsExample
          title="Heart picker + score composition"
          preview={
            <div className="space-y-4">
              <Rating value={hearts} onValueChange={setHearts} icon={Heart} tone="error" />
              <Rating value={hearts} onValueChange={setHearts} icon={Heart} tone="error" allowHalf />
              <div className="space-y-1">
                <Rating value={4} readOnly icon={Heart} tone="error" />
                <div className="text-sm text-text-sub-600">
                  <strong className="text-text-strong-950">4.5</strong> · 5.2K Ratings <a href="#" className="text-primary underline underline-offset-4 hover:no-underline">18 reviews</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Rating value={4.5} readOnly allowHalf icon={Heart} tone="error" />
                <span className="text-sm text-text-sub-600">
                  <strong className="text-text-strong-950">4.5</strong> · 5.2K Ratings <a href="#" className="text-primary underline underline-offset-4 hover:no-underline">18 reviews</a>
                </span>
              </div>
            </div>
          }
          code={`<Rating value={hearts} onValueChange={setHearts} icon={Heart} tone="error" />
<Rating value={4.5} readOnly allowHalf icon={Heart} tone="error" />`}
        />
      </DocsSection>

      <DocsSection title="Profile card with rating">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact profile pill — avatar + identity + read-only score + report flag.
        </p>
        <DocsExample
          title="James Brown @jamesbrown"
          preview={
            <div className="max-w-sm rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-(--shadow-custom-sm) flex items-center gap-3">
              <Avatar size="lg">
                <AvatarImage src="https://i.pravatar.cc/80?u=james-rating" />
                <AvatarFallback>JB</AvatarFallback>
                <AvatarIndicator tone="verified" size="lg" position="top-right"><Verified /></AvatarIndicator>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-strong-950 inline-flex items-center gap-1.5">
                  James Brown <span className="text-text-soft-400 font-normal text-xs">@jamesbrown</span>
                </div>
                <div className="inline-flex items-center gap-1.5 mt-0.5">
                  <Rating value={4.5} readOnly allowHalf size="sm" />
                  <span className="text-xs text-text-soft-400">(4.5)</span>
                </div>
              </div>
              <CompactButton variant="ghost" size="sm" aria-label="Report"><Flag /></CompactButton>
            </div>
          }
          code={`<Avatar size="lg">
  <AvatarImage src={photo} />
  <AvatarIndicator tone="verified" position="top-right"><Verified /></AvatarIndicator>
</Avatar>
<div>
  <strong>James Brown</strong> @jamesbrown
  <Rating value={4.5} readOnly allowHalf size="sm" /> (4.5)
</div>
<CompactButton aria-label="Report"><Flag /></CompactButton>`}
        />
      </DocsSection>

      <DocsSection title="Emoji mood picker">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          5-step emoji scale (sad → happy). Local helper composed from a radiogroup of buttons — not part of the Rating primitive. Pair with a follow-up textarea for qualitative feedback.
        </p>
        <DocsExample
          title="Daily Feedback question 1/4"
          preview={
            <div className="max-w-sm rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-(--shadow-custom-sm)">
              <header className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-text-strong-950">
                  <Chat className="size-4" /> Daily Feedback
                </div>
                <span className="text-xs text-text-soft-400">Question 1/4</span>
              </header>
              <div className="border-t border-stroke-soft-200 pt-3">
                <div className="flex flex-col items-center gap-2 mb-3">
                  <span className="size-9 rounded-full bg-(--primary-alpha-16) text-primary text-xs font-semibold inline-flex items-center justify-center">01</span>
                  <div className="text-sm font-semibold text-text-strong-950 text-center">How would you rate your mood today?</div>
                  <div className="text-xs text-text-sub-600">Share your mood to help us understand.</div>
                </div>
                <EmojiMood value={mood} onValueChange={setMood} />
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us why!"
                  className="mt-3 w-full h-20 rounded-md border border-stroke-soft-200 px-3 py-2 text-sm text-text-strong-950 placeholder:text-text-soft-400 outline-none focus:border-primary"
                />
                <Button tone="neutral" style="stroke" className="w-full mt-3">Next Question</Button>
              </div>
            </div>
          }
          code={`const [mood, setMood] = useState<number | null>(null)

<EmojiMood value={mood} onValueChange={setMood} />
<textarea placeholder="Tell us why!" />`}
        />
      </DocsSection>

      <DocsSection title="Helpful / Not helpful">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Binary thumbs picker — local helper. Use for inline "Was this helpful?" prompts (docs articles, AI answers, search results).
        </p>
        <DocsExample
          title="Inline picker"
          preview={
            <div className="space-y-3 max-w-sm">
              <p className="text-sm text-text-sub-600">Was this response helpful?</p>
              <ThumbsPicker value={thumb} onValueChange={setThumb} />
            </div>
          }
          code={`<ThumbsPicker value={thumb} onValueChange={setThumb} />`}
        />
      </DocsSection>

      <DocsSection title='"Help us improve" feedback dialog'>
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Full inline feedback dialog: title + question + ThumbsPicker + qualitative textarea + Learn-more link + Cancel/Submit footer.
        </p>
        <DocsExample
          title="Inline dialog mock"
          preview={
            <div className="max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-(--shadow-custom-md)">
              <header className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-text-strong-950">Help us improve</div>
                  <div className="text-xs text-text-sub-600">Was this response helpful?</div>
                </div>
                <CompactButton variant="ghost" size="sm" aria-label="Close"><Close /></CompactButton>
              </header>
              <div className="mt-3">
                <ThumbsPicker value={thumb} onValueChange={setThumb} />
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what we can do better..."
                className="mt-3 w-full h-20 rounded-md border border-stroke-soft-200 px-3 py-2 text-sm text-text-strong-950 placeholder:text-text-soft-400 outline-none focus:border-primary"
              />
              <div className="flex items-center justify-between gap-3 mt-3">
                <span className="text-xs text-text-soft-400">
                  Need more assistance? <a href="#" className="text-primary inline-flex items-center gap-0.5 underline underline-offset-4 hover:no-underline">Learn more <External className="size-3" /></a>
                </span>
                <div className="inline-flex items-center gap-2">
                  <Button size="sm" tone="neutral" style="stroke">Cancel</Button>
                  <Button size="sm" tone="primary">Submit</Button>
                </div>
              </div>
            </div>
          }
          code={`<Header>
  <Title>Help us improve</Title>
  <Description>Was this response helpful?</Description>
  <CloseButton />
</Header>
<ThumbsPicker />
<textarea placeholder="Tell us what we can do better..." />
<Footer>
  <Hint>Need more assistance? <Link>Learn more</Link></Hint>
  <Buttons><Cancel /><Submit /></Buttons>
</Footer>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Rating display = readOnly + label numerik. Rating input = pair dengan textarea untuk konteks 'kenapa'. Tone star yellow default — heart/like pakai tone='error'.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-2 max-w-xs">
                <Rating value={4.5} readOnly allowHalf size="sm" />
                <span className="text-xs text-text-sub-600">
                  <strong className="text-text-strong-950">4.5</strong> · 142 trip mtr-9412
                </span>
              </div>
            ),
            caption: "Display rating mitra dengan readOnly + label numerik + total count. User scan banyak mitra cepat dengan score.",
          }}
          dont={{
            preview: (
              <Rating value={4.5} onValueChange={() => {}} allowHalf size="sm" />
            ),
            caption: "Display rating tanpa readOnly = user kira bisa klik dan rate, padahal data dari backend. Selalu readOnly untuk display.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-2">
                <div className="text-xs font-medium">Rating dispatch DLV-7821</div>
                <Rating value={0} onValueChange={() => {}} />
                <textarea placeholder="Ceritakan pengalaman delivery..." className="w-full h-16 rounded border border-stroke-soft-200 p-2 text-xs" />
              </div>
            ),
            caption: "Rating input dipair dengan textarea optional. User kasih kuantitas (bintang) + kualitas (teks) supaya feedback actionable.",
          }}
          dont={{
            preview: (
              <Rating value={2} readOnly />
            ),
            caption: "Rating 2 bintang readOnly tanpa konteks (apa yang dirate, kapan, siapa) = data tidak bermakna. Pair dengan label minimum.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "number", description: "Current rating 0..max. Supports halves when allowHalf is true." },
            { name: "onValueChange", type: "(value: number) => void", description: "Fires on click. Not called when readOnly." },
            { name: "max", type: "number", defaultValue: "5", description: "Number of glyphs rendered." },
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "16 / 20 / 24 px glyph size." },
            { name: "readOnly", type: "boolean", defaultValue: "false", description: "Disables interaction — renders display-only static row." },
            { name: "allowHalf", type: "boolean", defaultValue: "false", description: "0.5 precision — splits each glyph into 2 click zones." },
            { name: "icon", type: "ElementType", defaultValue: "RiStarLine", description: "Glyph component. Any Remix icon (Heart, Flag, etc.)." },
            { name: "tone", type: '"yellow" | "error" | "primary" | "success" | "current"', defaultValue: '"yellow"', description: "Filled-state colour. Default yellow (star). Pair with icon={Heart} + tone=\"error\" for love rows." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
