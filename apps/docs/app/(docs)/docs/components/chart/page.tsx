"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/registry/dash/ui/chart"
import { Card, CardHeader, CardTitle, CardDescription } from "@/registry/dash/ui/card"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const dispatchData = [
  { day: "Sen", reservasi: 234, express: 412 },
  { day: "Sel", reservasi: 287, express: 398 },
  { day: "Rab", reservasi: 312, express: 467 },
  { day: "Kam", reservasi: 298, express: 502 },
  { day: "Jum", reservasi: 356, express: 612 },
  { day: "Sab", reservasi: 412, express: 734 },
  { day: "Min", reservasi: 187, express: 421 },
]

const trendData = [
  { month: "Nov", value: 1200 },
  { month: "Des", value: 1820 },
  { month: "Jan", value: 2100 },
  { month: "Feb", value: 2380 },
  { month: "Mar", value: 2710 },
  { month: "Apr", value: 2950 },
]

const config = {
  reservasi: { label: "Reservasi", color: "var(--dash-purple-500)" },
  express: { label: "Express", color: "var(--dash-blue-500)" },
  value: { label: "Dispatch", color: "var(--dash-purple-500)" },
} satisfies ChartConfig

export default function ChartDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Displaying Data"
        title="Chart"
        description="Recharts wrapper with Dash token-aware theming. Compose Bar/Line/Area/Pie via Recharts primitives inside ChartContainer. Tooltip + Legend auto-styled."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add chart`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/registry/dash/ui/chart"
import { Bar, BarChart, XAxis } from "recharts"

const config = {
  dispatch: { label: "Dispatch", color: "var(--dash-purple-500)" },
} satisfies ChartConfig

<ChartContainer config={config}>
  <BarChart data={data}>
    <XAxis dataKey="day" />
    <Bar dataKey="dispatch" fill="var(--color-dispatch)" />
    <ChartTooltip content={<ChartTooltipContent />} />
  </BarChart>
</ChartContainer>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Bar chart — tribe dispatch breakdown"
          preview={
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Dispatch per tribe</CardTitle>
                <CardDescription>7-hari terakhir, Reservasi vs Express</CardDescription>
              </CardHeader>
              <ChartContainer config={config} className="h-64 w-full">
                <BarChart data={dispatchData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <Bar dataKey="reservasi" fill="var(--color-reservasi)" radius={4} />
                  <Bar dataKey="express" fill="var(--color-express)" radius={4} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </Card>
          }
          code={`<ChartContainer config={config}>
  <BarChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="day" />
    <Bar dataKey="reservasi" fill="var(--color-reservasi)" radius={4} />
    <Bar dataKey="express" fill="var(--color-express)" radius={4} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
  </BarChart>
</ChartContainer>`}
        />

        <DocsExample
          title="Line chart — dispatch trend"
          preview={
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Dispatch trend</CardTitle>
                <CardDescription>6 bulan terakhir</CardDescription>
              </CardHeader>
              <ChartContainer config={config} className="h-56 w-full">
                <LineChart data={trendData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <Line
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-value)" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ChartContainer>
            </Card>
          }
          code={`<ChartContainer config={config}>
  <LineChart data={trendData}>
    <XAxis dataKey="month" />
    <Line dataKey="value" stroke="var(--color-value)" strokeWidth={2} />
    <ChartTooltip content={<ChartTooltipContent />} />
  </LineChart>
</ChartContainer>`}
        />
      </DocsSection>

      <DocsSection title="Token wiring">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Pass <code className="text-xs">config</code> with one entry per series. Each entry has <code className="text-xs">label</code> + <code className="text-xs">color</code> (or per-theme <code className="text-xs">theme.light</code>/<code className="text-xs">theme.dark</code>).</li>
          <li>• Reference colors in Recharts via <code className="text-xs">var(--color-&lt;key&gt;)</code> — ChartStyle injects them scoped to the chart instance.</li>
          <li>• Tooltip + Legend custom content reads <code className="text-xs">label</code> from config automatically.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "config", type: "ChartConfig", description: "Map seriesKey → { label, color?, theme? }." },
            { name: "ChartContainer", type: "wraps ResponsiveContainer", description: "Required outer wrapper." },
            { name: "ChartTooltip", type: "Recharts Tooltip re-export", description: "Pass <ChartTooltipContent /> as content." },
            { name: "ChartTooltipContent", type: "custom content", description: 'indicator: "dot"|"line"|"dashed"; hideLabel; hideIndicator; nameKey.' },
            { name: "ChartLegend", type: "Recharts Legend re-export", description: "Pass <ChartLegendContent /> as content." },
            { name: "ChartLegendContent", type: "custom content", description: "hideIcon; verticalAlign; nameKey." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — ChartContainer renders <code className="text-xs">role=&quot;img&quot;</code> by default. Override via <code className="text-xs">role=&quot;graphics-document&quot;</code> for richer SR support.</li>
          <li>• <strong>ARIA you add</strong>
            <ul className="ml-5 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li><code className="text-xs">aria-label</code> on ChartContainer summarizing the chart (&quot;Dispatch per tribe last 7 days, Reservasi vs Express bar chart&quot;).</li>
              <li><code className="text-xs">aria-describedby</code> linking to a hidden table containing the raw values — most reliable SR fallback.</li>
            </ul>
          </li>
          <li>• <strong>Color is not enough</strong> — when series differ only by color, add <code className="text-xs">stroke-dasharray</code> patterns or shape markers (Recharts <code className="text-xs">Dot</code> shape) so color-blind users distinguish.</li>
          <li>• <strong>Tooltip</strong> — keyboard users currently can&apos;t hover; provide an alternate accessible data table for SR + keyboard-only paths.</li>
          <li>• <strong>Color contrast</strong> — bar fills against the Card surface meet WCAG AA. Test custom config colors against your surface tokens.</li>
          <li>• <strong>Reduced motion</strong> — Recharts animations honor <code className="text-xs">prefers-reduced-motion</code> when you pass <code className="text-xs">isAnimationActive={`{false}`}</code> on series components in motion-sensitive contexts.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
