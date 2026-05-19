"use client"

import { AspectRatio } from "@/registry/dash/ui/aspect-ratio"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AspectRatioDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Layout"
        title="Aspect Ratio"
        description="Lock a container to a fixed width:height ratio. Use for image cards, video embeds, map previews — prevents layout shift while content loads."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add aspect-ratio`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="16:9 image slot"
          preview={
            <div className="w-80">
              <AspectRatio ratio={16 / 9}>
                <div className="size-full rounded-xl bg-gradient-to-br from-(--dash-purple-400) to-(--dash-blue-500)" />
              </AspectRatio>
            </div>
          }
          code={`<AspectRatio ratio={16 / 9}>
  <img src="…" alt="" className="size-full object-cover rounded-xl" />
</AspectRatio>`}
        />

        <DocsExample
          title="Square (1:1)"
          description="Use for avatar grids, KPI tiles, dispatch zone thumbnails — anywhere uniform shape matters."
          preview={
            <div className="grid grid-cols-3 gap-3 w-72">
              {["Bekasi", "Tangerang", "Surabaya"].map((city) => (
                <AspectRatio key={city} ratio={1}>
                  <div className="size-full rounded-xl bg-bg-weak-50 border border-stroke-soft-200 flex items-center justify-center text-text-sub-600 text-xs font-medium">
                    {city}
                  </div>
                </AspectRatio>
              ))}
            </div>
          }
          code={`<div className="grid grid-cols-3 gap-3">
  {cities.map(city => (
    <AspectRatio key={city} ratio={1}>
      <div className="size-full rounded-xl …">{city}</div>
    </AspectRatio>
  ))}
</div>`}
        />

        <DocsExample
          title="4:3 video preview"
          description="Common for dispatch dashcam footage, mitra training videos."
          preview={
            <div className="w-72">
              <AspectRatio ratio={4 / 3}>
                <div className="size-full rounded-xl bg-bg-strong-950 flex items-center justify-center text-text-white-0 text-sm">
                  4 : 3
                </div>
              </AspectRatio>
            </div>
          }
          code={`<AspectRatio ratio={4 / 3}>
  <video src="dashcam.mp4" className="size-full object-cover rounded-xl" />
</AspectRatio>`}
        />

        <DocsExample
          title="Map preview (21:9 cinematic)"
          description="Use ultrawide for dispatch zone heatmaps + route overviews."
          preview={
            <div className="w-full max-w-md">
              <AspectRatio ratio={21 / 9}>
                <div className="size-full rounded-xl bg-gradient-to-r from-(--dash-blue-500) via-(--dash-purple-500) to-(--dash-blue-500)" />
              </AspectRatio>
            </div>
          }
          code={`<AspectRatio ratio={21 / 9}>
  <img src="/jakarta-heatmap.png" alt="Surge heatmap Jakarta Selatan" className="size-full object-cover rounded-xl" />
</AspectRatio>`}
        />

        <DocsExample
          title="Mitra avatar tile (3:4 portrait)"
          preview={
            <div className="w-40">
              <AspectRatio ratio={3 / 4}>
                <div className="size-full rounded-xl bg-gradient-to-b from-(--dash-purple-300) to-(--dash-purple-600) flex items-end p-3">
                  <div className="text-white text-sm font-semibold">Sigit P.</div>
                </div>
              </AspectRatio>
            </div>
          }
          code={`<AspectRatio ratio={3 / 4}>
  <img src="/mitra/sigit.jpg" alt="Sigit P." className="size-full object-cover rounded-xl" />
</AspectRatio>`}
        />

        <DocsExample
          title="Inside a Card media slot"
          description="AspectRatio prevents layout shift while image loads — pair with next/image or skeleton."
          preview={
            <div className="w-72 rounded-xl border border-stroke-soft-200 bg-bg-white-0 overflow-hidden">
              <AspectRatio ratio={16 / 9}>
                <div className="size-full bg-bg-weak-50 flex items-center justify-center text-text-soft-400 text-xs">
                  Loading…
                </div>
              </AspectRatio>
              <div className="p-3">
                <div className="text-sm font-medium">Halo-dash 3-pane shell</div>
                <div className="text-xs text-text-sub-600">Backoffice support template.</div>
              </div>
            </div>
          }
          code={`<Card>
  <CardMedia>
    <AspectRatio ratio={16 / 9}>
      <Image src={src} alt={alt} fill className="object-cover" />
    </AspectRatio>
  </CardMedia>
  <CardHeader>…</CardHeader>
</Card>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "ratio", type: "number", defaultValue: "1", description: "Width / height. e.g. 16 / 9, 4 / 3, 1." },
            { name: "asChild", type: "boolean", defaultValue: "false", description: "Forward to child element instead of rendering an extra wrapper div." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — AspectRatio renders a plain <code className="text-xs">div</code> with no implicit role. The semantics live on the child (<code className="text-xs">img</code>, <code className="text-xs">video</code>, etc.).</li>
          <li>• <strong>Images</strong> must carry meaningful <code className="text-xs">alt</code>. Decorative-only? Pass <code className="text-xs">alt=&quot;&quot;</code> rather than omitting.</li>
          <li>• <strong>Reduced motion</strong> — AspectRatio is a static layout primitive. No animation, no <code className="text-xs">prefers-reduced-motion</code> impact.</li>
          <li>• <strong>Layout shift</strong> — pre-reserving height with this primitive eliminates a CLS pitfall that screen-reader + low-vision users disproportionately notice.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
