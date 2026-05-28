"use client"

import { Card } from "@/registry/dash/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/registry/dash/ui/carousel"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const tribes = [
  { name: "Reservasi", city: "Bekasi", trips: 142, surge: "1.2×" },
  { name: "Express", city: "Tangerang", trips: 263, surge: "1.4×" },
  { name: "Bulk", city: "Surabaya", trips: 78, surge: "1.0×" },
  { name: "Halo-dash", city: "Jakarta", trips: 412, surge: "1.1×" },
  { name: "Tribe-Express", city: "Bandung", trips: 98, surge: "1.3×" },
]

export default function CarouselDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Displaying Data"
        title="Carousel"
        description="Slide-by-slide content browser built on embla-carousel-react. Use for tribe campaign reels, onboarding intro slides, feature tours. For paginated grids use Pagination."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add carousel`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Built on embla-carousel-react. Compose five parts: <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">Carousel</code> (root, owns embla state), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">CarouselContent</code> (track), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">CarouselItem</code> (each slide), and the navigation buttons <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">CarouselPrevious</code> / <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">CarouselNext</code>. Set orientation, options (loop, align, slidesToScroll), and plugins (autoplay) on the root. For paginated grids reach for Pagination instead.
        </p>
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Tribe surge carousel"
          preview={
            <Carousel className="w-full max-w-md">
              <CarouselContent>
                {tribes.map((t) => (
                  <CarouselItem key={t.name}>
                    <Card variant="elevated" className="flex flex-col gap-2">
                      <span className="text-xs text-text-soft-400 uppercase">{t.city}</span>
                      <span className="text-2xl font-semibold tracking-tight">{t.name}</span>
                      <div className="flex justify-between text-sm text-text-sub-600">
                        <span>{t.trips} trips</span>
                        <span>surge {t.surge}</span>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          }
          code={`<Carousel className="w-full max-w-md">
  <CarouselContent>
    {tribes.map((t) => (
      <CarouselItem key={t.name}>
        <Card>
          <span>{t.city}</span>
          <span>{t.name}</span>
          <span>{t.trips} trips · surge {t.surge}</span>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
        />

        <DocsExample
          title="Multi-slide (basis-1/3)"
          preview={
            <Carousel className="w-full" opts={{ align: "start" }}>
              <CarouselContent>
                {tribes.map((t) => (
                  <CarouselItem key={t.name} className="basis-1/3">
                    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-sm">
                      <div className="font-semibold text-text-strong-950">{t.name}</div>
                      <div className="text-text-sub-600">{t.city}</div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          }
          code={`<Carousel opts={{ align: "start" }}>
  <CarouselContent>
    {items.map((i) => (
      <CarouselItem key={i.id} className="basis-1/3">…</CarouselItem>
    ))}
  </CarouselContent>
</Carousel>`}
        />

        <DocsExample
          title="Looping with autoplay options"
          preview={
            <Carousel
              className="w-full max-w-md"
              opts={{ align: "start", loop: true }}
            >
              <CarouselContent>
                {tribes.map((t) => (
                  <CarouselItem key={t.name} className="basis-1/2">
                    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-sm">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-text-sub-600">{t.trips} trips</div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          }
          code={`import Autoplay from "embla-carousel-autoplay"

<Carousel
  opts={{ align: "start", loop: true }}
  plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
>
  <CarouselContent>…</CarouselContent>
</Carousel>`}
        />

        <DocsExample
          title="Vertical carousel"
          preview={
            <Carousel orientation="vertical" className="w-72 h-48">
              <CarouselContent>
                {tribes.slice(0, 4).map((t) => (
                  <CarouselItem key={t.name} className="basis-1/2">
                    <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-sm h-full flex flex-col justify-center">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-text-sub-600">surge {t.surge}</div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          }
          code={`<Carousel orientation="vertical" className="h-48">
  <CarouselContent>
    {items.map(item => <CarouselItem key={item.id} className="basis-1/2">…</CarouselItem>)}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
        />

        <DocsExample
          title="External controls via setApi"
          description="Drive scroll position from a parent — useful for indicator dots, custom toolbars."
          preview={
            <div className="text-sm text-text-sub-600">
              Pass <code className="text-xs">setApi</code> to grab the Embla instance, then call <code className="text-xs">api.scrollTo(n)</code>.
            </div>
          }
          code={`const [api, setApi] = useState<CarouselApi>()
const [current, setCurrent] = useState(0)

useEffect(() => {
  if (!api) return
  setCurrent(api.selectedScrollSnap())
  api.on("select", () => setCurrent(api.selectedScrollSnap()))
}, [api])

<Carousel setApi={setApi}>…</Carousel>
<DotStepper steps={api?.scrollSnapList().length ?? 0} current={current} />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Carousel = browse banyak item dalam ruang terbatas. User control kapan slide pindah. Auto-play hanya untuk konten promo, dan harus pause-on-hover supaya tidak mengganggu reading.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <Carousel className="w-full max-w-xs" opts={{ align: "start" }}>
                <CarouselContent>
                  {tribes.slice(0, 4).map((t) => (
                    <CarouselItem key={t.name} className="basis-1/2">
                      <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs">
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-text-sub-600">{t.trips} trips</div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ),
            caption: "Multi-slide visible (basis-1/2) + tombol Prev/Next jelas + tidak auto-rotate. User scroll sesuai kecepatan baca, lihat preview slide berikut.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs">
                <div className="font-semibold">Reservasi</div>
                <div className="text-text-sub-600">142 trips</div>
                <div className="text-[10px] text-text-soft-400 mt-2">↻ Auto-rotating every 2s</div>
              </div>
            ),
            caption: "Single-visible + auto-rotate cepat tanpa kontrol pause = user kehilangan info sebelum sempat baca. Frustrasi tinggi.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <Carousel className="w-full max-w-xs">
                <CarouselContent>
                  <CarouselItem>
                    <Card variant="elevated" className="flex flex-col gap-1">
                      <span className="text-[10px] text-text-soft-400 uppercase">Bekasi</span>
                      <span className="text-lg font-semibold">Reservasi</span>
                      <span className="text-xs text-text-sub-600">142 trips · surge 1.2×</span>
                    </Card>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ),
            caption: "Carousel untuk konten visual gallery (campaign, tutorial, intro). Setiap slide self-contained dengan konteks lengkap.",
          }}
          dont={{
            preview: (
              <Carousel className="w-full max-w-xs">
                <CarouselContent>
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <CarouselItem key={n} className="basis-1/4">
                      <div className="rounded border border-stroke-soft-200 p-1 text-[10px] text-center">{n}</div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ),
            caption: "Carousel untuk daftar data tabular (10+ items terstruktur) = user sulit scan + tidak bisa filter/sort. Pakai Table atau Pagination.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "Axis." },
            { name: "opts", type: "EmblaOptionsType", description: "Embla options (align, loop, slidesToScroll…)." },
            { name: "plugins", type: "EmblaPluginType[]", description: "Embla plugins (autoplay, classNames…)." },
            { name: "setApi", type: "(api: CarouselApi) => void", description: "Receive the Embla instance to drive externally." },
            { name: "useCarousel()", type: "hook", description: "Inside <Carousel>: scrollPrev / scrollNext / canScrollPrev / canScrollNext / api." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — Carousel renders <code className="text-xs">role=&quot;region&quot;</code> + <code className="text-xs">aria-roledescription=&quot;carousel&quot;</code>. Each CarouselItem gets <code className="text-xs">role=&quot;group&quot;</code> + <code className="text-xs">aria-roledescription=&quot;slide&quot;</code>.</li>
          <li>• <strong>ARIA you add</strong> — pass <code className="text-xs">aria-label</code> on the root describing the carousel content (&quot;Tribe surge highlights&quot;).</li>
          <li>• <strong>Keyboard</strong>
            <ul className="ml-6 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li><code className="text-xs">←</code> / <code className="text-xs">→</code> when the carousel container has focus moves to previous/next slide.</li>
              <li><code className="text-xs">Tab</code> reaches the Prev/Next buttons. <code className="text-xs">Enter</code>/<code className="text-xs">Space</code> activate.</li>
              <li>Slides themselves are not focusable by default — wrap interactive content inside.</li>
            </ul>
          </li>
          <li>• <strong>Autoplay</strong> — when using the Autoplay plugin, pair with a visible Pause control so SR/low-motion users can stop the rotation. <code className="text-xs">stopOnInteraction: true</code> halts on first user input.</li>
          <li>• <strong>Reduced motion</strong> — Embla&apos;s scroll animation respects <code className="text-xs">prefers-reduced-motion</code> by skipping the transition (slides still change instantly).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
