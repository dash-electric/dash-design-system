"use client"

import { Stat, StatLabel, StatValue, StatTrend, StatDescription } from "@/registry/dash/ui/stat"
import { Card } from "@/registry/dash/ui/card"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function StatDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="specialized"
        category="Components / Displaying Data"
        title="Stat"
        description="KPI tile primitive. Label + value + trend indicator + description. Wrap in Card to add a surface, or use bare for inline metrics."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add stat`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Single KPI tile"
          preview={
            <Card className="w-72">
              <Stat>
                <StatLabel>Dispatch hari ini</StatLabel>
                <StatValue>1,284</StatValue>
                <StatTrend trend="up" value="12.4%">vs kemarin</StatTrend>
              </Stat>
            </Card>
          }
          code={`<Card>
  <Stat>
    <StatLabel>Dispatch hari ini</StatLabel>
    <StatValue>1,284</StatValue>
    <StatTrend trend="up" value="12.4%">vs kemarin</StatTrend>
  </Stat>
</Card>`}
        />

        <DocsExample
          title="KPI grid"
          preview={
            <div className="grid w-full grid-cols-3 gap-4">
              <Card>
                <Stat>
                  <StatLabel>Mitra aktif</StatLabel>
                  <StatValue>734</StatValue>
                  <StatTrend trend="up" value="+12">7-day</StatTrend>
                </Stat>
              </Card>
              <Card>
                <Stat>
                  <StatLabel>Suspended</StatLabel>
                  <StatValue>28</StatValue>
                  <StatTrend trend="down" value="-3">7-day</StatTrend>
                </Stat>
              </Card>
              <Card>
                <Stat>
                  <StatLabel>Avg respons</StatLabel>
                  <StatValue>4m 12s</StatValue>
                  <StatTrend trend="neutral">no change</StatTrend>
                </Stat>
              </Card>
            </div>
          }
          code={`<div className="grid grid-cols-3 gap-4">
  <Card>
    <Stat>
      <StatLabel>Mitra aktif</StatLabel>
      <StatValue>734</StatValue>
      <StatTrend trend="up" value="+12">7-day</StatTrend>
    </Stat>
  </Card>
  …
</div>`}
        />
      </DocsSection>

      <DocsSection title="With description">
        <DocsExample
          title="KPI tile + footnote"
          preview={
            <Card className="w-80">
              <Stat>
                <StatLabel>Surge revenue · Express tribe</StatLabel>
                <StatValue>Rp 142M</StatValue>
                <StatTrend trend="up" value="+24.8%">vs 30 hari lalu</StatTrend>
                <StatDescription>BMKG hujan deras + Bekasi-Tangerang corridor.</StatDescription>
              </Stat>
            </Card>
          }
          code={`<Card>
  <Stat>
    <StatLabel>Surge revenue · Express tribe</StatLabel>
    <StatValue>Rp 142M</StatValue>
    <StatTrend trend="up" value="+24.8%">vs 30 hari lalu</StatTrend>
    <StatDescription>BMKG hujan deras + Bekasi-Tangerang.</StatDescription>
  </Stat>
</Card>`}
        />

        <DocsExample
          title="Trend variants"
          preview={
            <div className="grid grid-cols-3 gap-3">
              <Card><Stat><StatLabel>Up</StatLabel><StatValue>1,284</StatValue><StatTrend trend="up" value="+12.4%">7d</StatTrend></Stat></Card>
              <Card><Stat><StatLabel>Down</StatLabel><StatValue>248</StatValue><StatTrend trend="down" value="-8.1%">7d</StatTrend></Stat></Card>
              <Card><Stat><StatLabel>Neutral</StatLabel><StatValue>734</StatValue><StatTrend trend="neutral">no change</StatTrend></Stat></Card>
            </div>
          }
          code={`<StatTrend trend="up" value="+12.4%">7d</StatTrend>
<StatTrend trend="down" value="-8.1%">7d</StatTrend>
<StatTrend trend="neutral">no change</StatTrend>`}
        />

        <DocsExample
          title="Inline (no Card)"
          description="Use bare Stat for compact contexts — popovers, hover cards, dense dashboards."
          preview={
            <Stat>
              <StatLabel>Avg respons time</StatLabel>
              <StatValue>4m 12s</StatValue>
              <StatTrend trend="down" value="-32s">vs 7d ago</StatTrend>
            </Stat>
          }
          code={`<Stat>
  <StatLabel>Avg respons time</StatLabel>
  <StatValue>4m 12s</StatValue>
  <StatTrend trend="down" value="-32s">vs 7d ago</StatTrend>
</Stat>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Stat = KPI tile. Selalu pair value dengan trend + comparison window ('vs kemarin'). Tanpa context, angka 1,284 tidak bermakna. Trend arrow harus match interpretasi user.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <Card className="w-full max-w-xs">
                <Stat>
                  <StatLabel>Dispatch Bekasi hari ini</StatLabel>
                  <StatValue>1,284</StatValue>
                  <StatTrend trend="up" value="+12.4%">vs kemarin</StatTrend>
                </Stat>
              </Card>
            ),
            caption: "Label spesifik (Bekasi hari ini) + nilai + trend dengan comparison window. User langsung tahu apa, sekarang berapa, dibanding kapan.",
          }}
          dont={{
            preview: (
              <Card className="w-full max-w-xs">
                <Stat>
                  <StatLabel>Total</StatLabel>
                  <StatValue>1,284</StatValue>
                </Stat>
              </Card>
            ),
            caption: "Label 'Total' tanpa subject + tanpa trend = nilai 1,284 dari apa, naik atau turun? Stat butuh konteks minimum.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <Card className="w-full max-w-xs">
                <Stat>
                  <StatLabel>Mitra suspended</StatLabel>
                  <StatValue>28</StatValue>
                  <StatTrend trend="down" value="-3">7-day</StatTrend>
                </Stat>
              </Card>
            ),
            caption: "Suspended turun = good news → trend='down' tapi context bagus. Sebenarnya for ops, suspend turun positive — selalu align arrow ke direction angka, bukan interpretasi.",
          }}
          dont={{
            preview: (
              <Card className="w-full max-w-xs">
                <Stat>
                  <StatLabel>Mitra aktif</StatLabel>
                  <StatValue>734</StatValue>
                  <StatTrend trend="up" value="-12">7-day</StatTrend>
                </Stat>
              </Card>
            ),
            caption: "Trend='up' tapi value '-12' = arrow naik dengan delta negatif. Konflik visual. Pastikan trend (arah) match dengan tanda value.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold text-text-strong-950 pt-2">Slots</h3>
        <DocsPropsTable
          rows={[
            { name: "Stat", type: "div", description: "Flex column wrapper. Pass className for spacing overrides." },
            { name: "StatLabel", type: "p", description: "Uppercase label above value. Use sentence case for sub-labels." },
            { name: "StatValue", type: "p", description: "Big tabular-nums number. Drop in formatted strings (Rp / m / s)." },
            { name: "StatTrend", type: "span", description: 'Trend chip. Wires icon + color from trend prop.' },
            { name: "StatDescription", type: "p", description: "Secondary helper text below trend." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">StatTrend</h3>
        <DocsPropsTable
          rows={[
            { name: "trend", type: '"up" | "down" | "neutral"', description: "Picks ↗ / ↘ / → icon + green / red / muted color." },
            { name: "value", type: "ReactNode", description: "Numeric delta string (e.g., +12.4%, -32s)." },
            { name: "children", type: "ReactNode", description: "Trailing context (e.g., 'vs kemarin')." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Stack: label (small uppercase) → value (huge tabular-nums) → trend (chip) → description (muted).</li>
          <li>• Wrap in <code className="text-xs">Card</code> for dashboard tiles; leave bare for tight rows.</li>
          <li>• Drop StatTrend / StatDescription when not relevant — the layout adjusts.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Trend icon is <code className="text-xs">aria-hidden</code>; the color-coded value should be read via the trend label, not color alone.</li>
          <li>• When trend is the primary signal, set <code className="text-xs">aria-label</code> on the parent Card describing direction (&ldquo;Dispatch up 12.4%&rdquo;).</li>
          <li>• Use <code className="text-xs">tabular-nums</code> (built-in) so numeric grids align visually.</li>
          <li>• In dense KPI grids, ensure each tile has a unique label — never repeat &ldquo;Total&rdquo; without context.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
