"use client"

import { RiTruckLine as Truck, RiArrowRightUpLine as ArrowUpRight } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMedia,
} from "@/registry/dash/ui/card"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function CardDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Displaying Data"
        title="Card"
        description="Surface for grouping related content. 3 variants (stroke / elevated / ghost), composable Header / Title / Description / Content / Footer / Media slots."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add card`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "@/registry/dash/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Express tribe</CardTitle>
    <CardDescription>Same-day pickup, surge enabled.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter>…</CardFooter>
</Card>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Stat card"
          preview={
            <Card className="w-72">
              <CardHeader>
                <CardDescription>Dispatch hari ini</CardDescription>
                <CardTitle className="text-3xl tracking-tighter">1,284</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-success-base">
                  <ArrowUpRight className="size-3.5" strokeWidth={2} />
                  +12.4% vs kemarin
                </div>
              </CardContent>
            </Card>
          }
          code={`<Card className="w-72">
  <CardHeader>
    <CardDescription>Dispatch hari ini</CardDescription>
    <CardTitle className="text-3xl tracking-tighter">1,284</CardTitle>
  </CardHeader>
  <CardContent>
    <span className="text-success-base">+12.4% vs kemarin</span>
  </CardContent>
</Card>`}
        />

        <DocsExample
          title="Elevated with footer action"
          preview={
            <Card variant="elevated" className="w-80">
              <CardHeader>
                <CardTitle>Reservasi · Bekasi-Tangerang</CardTitle>
                <CardDescription>312% di atas baseline 30-hari. BMKG hujan deras.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-text-sub-600">
                  <Truck className="size-4 text-icon-sub" strokeWidth={1.75} />
                  734 dispatch · 142 mitra aktif
                </div>
              </CardContent>
              <CardFooter className="justify-between gap-2">
                <Badge status="information" appearance="lighter">Surge aktif</Badge>
                <Button size="xs">Review</Button>
              </CardFooter>
            </Card>
          }
          code={`<Card variant="elevated" className="w-80">
  <CardHeader>
    <CardTitle>Reservasi · Bekasi-Tangerang</CardTitle>
    <CardDescription>312% di atas baseline.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter className="justify-between gap-2">
    <Badge status="information" appearance="lighter">Surge aktif</Badge>
    <Button size="xs">Review</Button>
  </CardFooter>
</Card>`}
        />

        <DocsExample
          title="With media"
          preview={
            <Card className="w-80" padding="md">
              <CardMedia>
                <div className="h-32 bg-gradient-to-br from-(--dash-purple-400) to-(--dash-blue-500)" />
              </CardMedia>
              <CardHeader>
                <CardTitle>Halo-dash 3-pane shell</CardTitle>
                <CardDescription>Template for backoffice support module.</CardDescription>
              </CardHeader>
            </Card>
          }
          code={`<Card>
  <CardMedia>
    <img src="/cover.png" alt="" />
  </CardMedia>
  <CardHeader>
    <CardTitle>Halo-dash 3-pane shell</CardTitle>
    <CardDescription>…</CardDescription>
  </CardHeader>
</Card>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          A Card groups one idea. Don&apos;t flatten unrelated data into the same surface.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <Card className="w-72">
                <CardHeader>
                  <CardDescription>Reservasi · Bekasi-Tangerang</CardDescription>
                  <CardTitle className="text-2xl tracking-tight">734</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-text-sub-600">142 mitra aktif · surge ON</span>
                </CardContent>
              </Card>
            ),
            caption: "One topic per Card — judul, satu metrik utama, satu konteks pendukung. Mata mitra dispatcher langsung paham.",
          }}
          dont={{
            preview: (
              <Card className="w-72">
                <CardHeader>
                  <CardTitle className="text-base">Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-text-sub-600">
                  <div>Dispatch hari ini: 1,284</div>
                  <div>Mitra suspended: 12</div>
                  <div>Outlet baru: 4</div>
                  <div>NPS: 8.2 · Churn: 1.4%</div>
                </CardContent>
              </Card>
            ),
            caption: "Jangan jejalkan 4 metrik tanpa hierarki dalam satu Card. Split jadi Card-per-topik supaya dispatcher bisa skim cepat.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <Card variant="elevated" className="w-72">
                <CardHeader>
                  <CardTitle>Express tribe</CardTitle>
                  <CardDescription>Same-day pickup, surge enabled</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button size="xs">Review tribe</Button>
                </CardFooter>
              </Card>
            ),
            caption: "Satu primary action per Card di CardFooter. Mitra tahu langkah berikutnya tanpa harus baca ulang.",
          }}
          dont={{
            preview: (
              <Card variant="elevated" className="w-72">
                <CardHeader>
                  <CardTitle>Express tribe</CardTitle>
                </CardHeader>
                <CardFooter className="flex flex-wrap gap-1">
                  <Button size="xs">Review</Button>
                  <Button size="xs" tone="neutral" style="stroke">Export</Button>
                  <Button size="xs" tone="neutral" style="stroke">Suspend</Button>
                  <Button size="xs" tone="destructive">Hapus</Button>
                </CardFooter>
              </Card>
            ),
            caption: "Hindari 4 aksi sejajar di footer Card. Pindahkan aksi sekunder ke menu overflow atau halaman detail.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950">Card</h3>
        <p className="text-sm text-text-sub-600">Outer surface. Owns variant + padding.</p>
        <DocsPropsTable
          rows={[
            { name: "variant", type: '"stroke" | "elevated" | "ghost"', defaultValue: '"stroke"', description: "Border / shadow style." },
            { name: "padding", type: '"none" | "sm" | "md" | "lg"', defaultValue: '"md"', description: "Inner padding preset." },
            { name: "asChild", type: "boolean", defaultValue: "false", description: "Forward to a child element (e.g. <Link>) via Radix Slot." },
          ]}
        />

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">CardHeader</h3>
        <p className="text-sm text-text-sub-600">Top region. Omit if there&apos;s no title.</p>
        <DocsPropsTable
          rows={[
            { name: "className", type: "string", description: "Layout overrides; defaults to a vertical flex stack." },
          ]}
        />

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">CardTitle / CardDescription</h3>
        <p className="text-sm text-text-sub-600">Semantic <code className="text-xs">h3</code> + paragraph pair. Override level via <code className="text-xs">asChild</code>.</p>
        <DocsPropsTable
          rows={[
            { name: "asChild", type: "boolean", defaultValue: "false", description: "Forward to a custom heading element (h2/h4) when nesting depth differs." },
          ]}
        />

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">CardContent</h3>
        <p className="text-sm text-text-sub-600">Main body region. Inherits padding from Card.</p>

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">CardFooter</h3>
        <p className="text-sm text-text-sub-600">Actions row with top-border auto-applied. Default <code className="text-xs">justify-end</code>.</p>

        <h3 className="text-sm font-semibold tracking-tight text-text-strong-950 mt-6">CardMedia</h3>
        <p className="text-sm text-text-sub-600">Top media slot — strips Card padding so an image bleeds to the rounded edge.</p>
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Card</strong> — surface root.</li>
          <li className="pl-4">├ <strong>CardMedia</strong> — top image / chart slot (omit for text-only Cards).</li>
          <li className="pl-4">├ <strong>CardHeader</strong> — title + description block.</li>
          <li className="pl-8">├ <strong>CardTitle</strong></li>
          <li className="pl-8">└ <strong>CardDescription</strong></li>
          <li className="pl-4">├ <strong>CardContent</strong> — main body.</li>
          <li className="pl-4">└ <strong>CardFooter</strong> — trailing actions row.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — Card renders a plain <code className="text-xs">div</code>. Semantics come from contents.</li>
          <li>• <strong>Headings</strong> — CardTitle defaults to <code className="text-xs">h3</code>. If your page section already uses h2 hierarchy, override via <code className="text-xs">asChild</code> to keep the document outline correct.</li>
          <li>• <strong>Whole-card clickable</strong> — when the entire Card is a link, wrap in <code className="text-xs">asChild</code> + <code className="text-xs">Link</code>. Avoid nesting inner buttons inside — that triggers nested-interactive a11y errors.</li>
          <li>• <strong>Whole-card with inner actions</strong> — use the &quot;card link&quot; pattern: make the title an <code className="text-xs">a</code> with <code className="text-xs">::before</code> covering the card, leaving inner buttons clickable separately.</li>
          <li>• <strong>Keyboard</strong> — focus order follows DOM order. Cards in a grid should appear in reading order top-left to bottom-right.</li>
          <li>• <strong>Reduced motion</strong> — elevated variant hover lift respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
