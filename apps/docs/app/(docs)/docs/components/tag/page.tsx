"use client"

import * as React from "react"
import {
  RiInformationLine as Info,
  RiCloseLine as Close,
  RiStarLine as Star,
  RiHashtag as Hash,
} from "@remixicon/react"
import { Tag } from "@/registry/dash/ui/tag"
import { Field, FieldDescription } from "@/registry/dash/ui/field"
import { Label } from "@/registry/dash/ui/label"
import { InputRoot, Input } from "@/registry/dash/ui/input"
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
 * Tag — Figma 1:1 (3 nodes verified 2026-05-18).
 *
 *   431:16147     Master spec — 2 variants (stroke / gray) × 4 states × 3 sizes
 *   3614:26690    Add Tags input pattern — tag input above + dismissible tags below
 *   3614:26783    Tag input variant
 */

const SUGGESTED = ["Pixel Art", "Digital Painting", "Retrowave", "NFT", "Watercolor", "3D", "Photography", "Cyberpunk"]

export default function TagDocsPage() {
  const [tags, setTags] = React.useState<string[]>(["Digital Painting", "Retrowave", "NFT"])
  const [draft, setDraft] = React.useState("")
  const max = 8

  const add = (v: string) => {
    const trimmed = v.trim()
    if (!trimmed || tags.includes(trimmed) || tags.length >= max) return
    setTags((t) => [...t, trimmed])
    setDraft("")
  }
  const remove = (t: string) => setTags((arr) => arr.filter((x) => x !== t))

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Data"
        title="Tag"
        description="Small inline label / chip. 2 variants (stroke + gray) × 4 states × 3 sizes. Optionally dismissible via onRemove. Use for taxonomy chips (filters, categories, post tags). For status-tone pills use Badge, for count pills use NumberBadge."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add tag`} />
      </DocsSection>

      <DocsSection title="Variants × states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two visual variants — <strong>stroke</strong> (white bg + soft border, default) and <strong>gray</strong> (filled weak-50 bg). Each has 3 states: default / active / disabled. Hover swaps bg / border tonally.
        </p>
        <DocsExample
          title="stroke + gray × 3 states"
          preview={
            <div className="space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400 mb-2">stroke</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag variant="stroke">Default</Tag>
                  <Tag variant="stroke" state="active">Active</Tag>
                  <Tag variant="stroke" state="disabled">Disabled</Tag>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400 mb-2">gray</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag variant="gray">Default</Tag>
                  <Tag variant="gray" state="active">Active</Tag>
                  <Tag variant="gray" state="disabled">Disabled</Tag>
                </div>
              </div>
            </div>
          }
          code={`<Tag variant="stroke">Default</Tag>
<Tag variant="stroke" state="active">Active</Tag>
<Tag variant="stroke" state="disabled">Disabled</Tag>

<Tag variant="gray">Default</Tag>`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          3 sizes — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">xs</code> (20px), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm</code> (24px Figma canonical), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">md</code> (28px).
        </p>
        <DocsExample
          title="xs / sm / md"
          preview={
            <div className="flex flex-wrap items-end gap-3">
              <Tag size="xs">xs Tag</Tag>
              <Tag size="sm">sm Tag</Tag>
              <Tag size="md">md Tag</Tag>
            </div>
          }
          code={`<Tag size="xs">xs Tag</Tag>
<Tag size="sm">sm Tag</Tag>
<Tag size="md">md Tag</Tag>`}
        />
      </DocsSection>

      <DocsSection title="With icon">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Pass a 12px icon via the <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">icon</code> prop. Renders before the label.
        </p>
        <DocsExample
          title="Icon + label"
          preview={
            <div className="flex flex-wrap items-center gap-2">
              <Tag icon={<Hash className="size-3" />}>topic</Tag>
              <Tag icon={<Star className="size-3" />} variant="gray">Featured</Tag>
              <Tag icon={<Info className="size-3" />} state="active">Selected</Tag>
            </div>
          }
          code={`<Tag icon={<Hash />}>topic</Tag>
<Tag icon={<Star />} variant="gray">Featured</Tag>
<Tag icon={<Info />} state="active">Selected</Tag>`}
        />
      </DocsSection>

      <DocsSection title="Dismissible">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Pass <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">onRemove</code> to surface the trailing × button. Common for active filters + selected categories.
        </p>
        <DocsExample
          title="Filter chips w/ × button"
          preview={
            <div className="flex flex-wrap items-center gap-2">
              <Tag onRemove={() => {}}>Marketing</Tag>
              <Tag onRemove={() => {}}>HR</Tag>
              <Tag onRemove={() => {}}>Engineering</Tag>
              <Tag onRemove={() => {}} variant="gray">+3 more</Tag>
            </div>
          }
          code={`<Tag onRemove={() => removeFilter(t)}>{label}</Tag>`}
        />
      </DocsSection>

      <DocsSection title="Add Tags input pattern">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Common composition: Label + helper-count + Input + tags rendered below. Type and press Enter to add; click × to remove. Cap at <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">max</code>.
        </p>
        <DocsExample
          title='"Add Tags (max. 8)"'
          preview={
            <div className="max-w-md space-y-3">
              <Field>
                <Label htmlFor="tag-input" className="inline-flex items-center gap-1.5">
                  Add Tags <span className="text-text-soft-400 font-normal">(max. {max})</span>
                  <Info className="size-3.5 text-icon-soft-400" />
                </Label>
                <InputRoot>
                  <Input
                    id="tag-input"
                    placeholder={tags.length >= max ? `Max ${max} tags` : "Type a tag…"}
                    value={draft}
                    disabled={tags.length >= max}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); add(draft) }
                      if (e.key === "Backspace" && !draft && tags.length) remove(tags[tags.length - 1])
                    }}
                  />
                </InputRoot>
                <div className="flex flex-wrap gap-2 mt-1">
                  {tags.map((t) => (
                    <Tag key={t} onRemove={() => remove(t)}>{t}</Tag>
                  ))}
                </div>
                {tags.length === 0 ? (
                  <FieldDescription>Press Enter to add a tag.</FieldDescription>
                ) : null}
              </Field>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400 mb-2">Suggested</div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED.filter((s) => !tags.includes(s)).slice(0, 6).map((s) => (
                    <Tag key={s} variant="gray" onClick={() => add(s)} className="cursor-pointer">
                      {s}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          }
          code={`const [tags, setTags] = useState<string[]>(["Digital Painting", "Retrowave", "NFT"])
const [draft, setDraft] = useState("")

<Field>
  <Label>Add Tags (max. 8)</Label>
  <Input
    value={draft}
    onChange={e => setDraft(e.target.value)}
    onKeyDown={e => {
      if (e.key === "Enter") add(draft)
      if (e.key === "Backspace" && !draft) removeLast()
    }}
  />
  <div className="flex flex-wrap gap-2">
    {tags.map(t => <Tag key={t} onRemove={() => remove(t)}>{t}</Tag>)}
  </div>
</Field>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Tag = filter chip atau metadata removable. Untuk label statis pakai Badge. Untuk action verb pakai Button. Selalu sediakan onRemove kalau tag bisa di-dismiss.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-text-sub-600">Filter aktif:</span>
                <Tag onRemove={() => {}}>tribe=Express</Tag>
                <Tag onRemove={() => {}}>kota=Bekasi</Tag>
                <Tag onRemove={() => {}}>status=Active</Tag>
              </div>
            ),
            caption: "Filter chip removable. User klik X untuk lepas filter satu per satu. Match konvensi search filter di table.",
          }}
          dont={{
            preview: (
              <Tag>Premium</Tag>
            ),
            caption: "Tag tanpa onRemove + label statis ('Premium') = behavior Badge. Pakai Badge untuk label kategori, Tag untuk yang interactive/removable.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-wrap gap-1.5 max-w-xs">
                {["Reservasi", "Bekasi", "Jakarta", "Tangerang"].map((t) => (
                  <Tag key={t} onRemove={() => {}}>{t}</Tag>
                ))}
              </div>
            ),
            caption: "Multiple tags untuk multi-value selection. Setiap chip discrete + removable. User control sempurna granular.",
          }}
          dont={{
            preview: (
              <Tag>Tap untuk lihat detail</Tag>
            ),
            caption: "Tag sebagai CTA / link = behavior salah. CTA pakai Button atau LinkButton. Tag bukan action trigger.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "variant", type: '"stroke" | "gray" | "primary"', defaultValue: '"stroke"', description: "Surface treatment. stroke = white bg + soft border. gray = filled weak-50. primary = filled brand (Dash extension)." },
            { name: "size", type: '"xs" | "sm" | "md"', defaultValue: '"sm"', description: "20 / 24 / 28 px height." },
            { name: "state", type: '"default" | "active" | "disabled"', defaultValue: '"default"', description: "Active = strong border + strong text. Disabled = weak-50 bg + disabled-300 text, no interactions." },
            { name: "icon", type: "ReactNode", description: "Optional 12px leading glyph." },
            { name: "onRemove", type: "() => void", description: "When supplied, renders trailing × button." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
