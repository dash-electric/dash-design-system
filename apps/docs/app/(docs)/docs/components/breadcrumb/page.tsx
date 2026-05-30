import { RiHome5Line as Home, RiTruckLine as Truck } from "@remixicon/react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/registry/dash/ui/breadcrumb"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function BreadcrumbDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Navigation"
        title="Breadcrumb"
        description="Path navigation. Shows where the user is in the hierarchy and lets them jump back up. Use it on any page two levels deep or further inside Halo-dash, mitra detail pages, and audit screens."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add breadcrumb`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          A small set of unstyled wrappers composed into a single trail. The structure mirrors the WAI-ARIA breadcrumb pattern:
        </p>
        <div className="overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-weak-50">
              <tr className="text-left">
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400 w-1/3">Part</th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">Use for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-soft-200">
              {[
                ["Breadcrumb", "Outer <nav aria-label='breadcrumb'> landmark."],
                ["BreadcrumbList", "Ordered list of crumbs."],
                ["BreadcrumbItem", "Single crumb wrapper."],
                ["BreadcrumbLink", "Clickable crumb. Wrap a Next Link via asChild."],
                ["BreadcrumbPage", "Current page — non-interactive, aria-current='page'."],
                ["BreadcrumbSeparator", "Divider between crumbs. Decorative, aria-hidden."],
                ["BreadcrumbEllipsis", "Collapse marker when the trail is too long."],
              ].map(([part, use]) => (
                <tr key={part} className="align-top">
                  <td className="px-4 py-3 text-xs text-text-strong-950">{part}</td>
                  <td className="px-4 py-3 text-text-sub-600 leading-relaxed">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from "@/registry/dash/ui/breadcrumb"

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>mtr-9412</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Default"
          preview={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">
                    <Home aria-hidden strokeWidth={1.75} className="size-4" />
                    <span className="sr-only">Home</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Tribe-Express</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Mitra</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>mtr-9412</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          code={`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/"><Home /></BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbLink href="/tribe-express">Tribe-Express</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbLink href="/mitra">Mitra</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>mtr-9412</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
        />

        <DocsExample
          title="Separator variants"
          preview={
            <div className="space-y-5 w-full">
              {(["chevron", "slash", "dot"] as const).map((v) => (
                <div key={v}>
                  <div className="text-xs text-text-sub-600 mb-2">variant=&quot;{v}&quot;</div>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem><BreadcrumbLink href="#">Halo-dash</BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator variant={v} />
                      <BreadcrumbItem><BreadcrumbLink href="#">Operations</BreadcrumbLink></BreadcrumbItem>
                      <BreadcrumbSeparator variant={v} />
                      <BreadcrumbItem><BreadcrumbPage>TRP-2026-05-08-9384</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              ))}
            </div>
          }
          code={`<BreadcrumbSeparator variant="chevron" />  {/* default */}
<BreadcrumbSeparator variant="slash" />
<BreadcrumbSeparator variant="dot" />`}
        />

        <DocsExample
          title="With icons"
          preview={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">
                    <Home aria-hidden strokeWidth={1.75} className="size-4" />
                    <span className="sr-only">Home</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="inline-flex items-center gap-1.5">
                    <Truck aria-hidden strokeWidth={1.75} className="size-4 text-icon-sub" />
                    Dispatch
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Active queue</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          code={`<BreadcrumbLink href="/dispatch" className="inline-flex items-center gap-1.5">
  <Truck className="size-4" />
  Dispatch
</BreadcrumbLink>`}
        />

        <DocsExample
          title="Overflow with ellipsis"
          preview={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">
                    <Home aria-hidden strokeWidth={1.75} className="size-4" />
                    <span className="sr-only">Home</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Mitra</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>mtr-9412</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          code={`<BreadcrumbItem>
  <BreadcrumbEllipsis />  {/* wire to DropdownMenu for collapsed steps */}
</BreadcrumbItem>`}
        />

        <DocsExample
          title="With Next.js Link"
          preview={
            <div className="text-sm text-text-sub-600">
              Pair <code className="text-xs">asChild</code> on BreadcrumbLink with Next.js Link.
            </div>
          }
          code={`import Link from "next/link"

<BreadcrumbLink asChild>
  <Link href="/halo-dash">Halo-dash</Link>
</BreadcrumbLink>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Breadcrumb = peta hierarki halaman. Last step = current page (non-clickable). Pakai untuk halaman ≥2 level dalam. Jangan untuk linear wizard atau halaman landing.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="#">Halo-dash</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbLink href="#">Mitra</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>mtr-9412</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            ),
            caption: "Last crumb (mtr-9412) = BreadcrumbPage, non-clickable. Parent crumbs (Halo-dash, Mitra) clickable supaya dispatcher bisa naik level cepat.",
          }}
          dont={{
            preview: (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="#">Halo-dash</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbLink href="#">mtr-9412</BreadcrumbLink></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            ),
            caption: "Current page jadi link = user klik halaman yang sedang dibuka = full reload sia-sia. Last crumb HARUS BreadcrumbPage.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="#"><Home aria-hidden className="size-4" /><span className="sr-only">Home</span></BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbLink href="#">Mitra</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>mtr-9412</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            ),
            caption: "≥5 step → collapse middle dengan BreadcrumbEllipsis (expand via dropdown). User tetap lihat root + parent terakhir + current.",
          }}
          dont={{
            preview: (
              <div className="text-xs text-text-sub-600 leading-relaxed">
                Home / Halo-dash / Operations / Tribe-Express / Mitra / Aktif / Bekasi / Region 4 / mtr-9412
              </div>
            ),
            caption: "9 step tanpa collapse = breadcrumb pecah multi-line, tidak ada yang baca. Selalu gunakan ellipsis di tengah saat trail panjang.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "asChild", type: "boolean", defaultValue: "false", description: "Forward to a router primitive (Next.js Link). On BreadcrumbLink." },
            { name: "variant", type: '"chevron" | "slash" | "dot"', defaultValue: '"chevron"', description: "Separator style. On BreadcrumbSeparator." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Rules">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Last step always uses BreadcrumbPage (non-clickable, aria-current=&quot;page&quot;).</li>
          <li>• One separator variant per breadcrumb.</li>
          <li>• Collapse to BreadcrumbEllipsis at 5+ steps.</li>
          <li>• Don&apos;t add breadcrumbs to dashboard landing pages.</li>
          <li>• Keep step labels under ~20 characters.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Landmark</strong> — Breadcrumb root renders as <code className="text-xs">{`<nav aria-label="Breadcrumb">`}</code>. Override the label via <code className="text-xs">aria-label</code> when multiple breadcrumb regions appear on a page.</li>
          <li>• <strong>List semantics</strong> — BreadcrumbList renders as <code className="text-xs">ol</code>; items as <code className="text-xs">li</code>; separators as <code className="text-xs">li role=&quot;presentation&quot;</code> so SR skips them.</li>
          <li>• <strong>Current page</strong> — BreadcrumbPage carries <code className="text-xs">aria-current=&quot;page&quot;</code>. SR announces &quot;current page, [label]&quot;.</li>
          <li>• <strong>Icon-only links</strong> — wrap icon in <code className="text-xs">{`<span className="sr-only">Home</span>`}</code> so SR users hear the label.</li>
          <li>• <strong>Ellipsis</strong> — BreadcrumbEllipsis auto-labels as &quot;More&quot;; pair with DropdownMenu trigger when implementing collapsed steps so keyboard users can expand.</li>
          <li>• <strong>Keyboard</strong> — <code className="text-xs">Tab</code> walks the links left-to-right; <code className="text-xs">Enter</code> navigates. Skip-link to main content unaffected.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
