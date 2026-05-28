import { WidgetCard } from "./_components/widget-card";
import { TribeHealthWidget } from "./_components/tribe-health-widget";

export const dynamic = "force-dynamic";

/**
 * Dashboard grid. MVP ships 3 widgets:
 *  - Runs feed (PLACEHOLDER, wires to Build daemon SSE in next sprint)
 *  - Cost tracker (PLACEHOLDER, polls OpenAI Usage API)
 *  - Tribe health (REAL — heartbeat ingest + SSE)
 */
export default function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: "var(--text-strong)",
            letterSpacing: -0.3,
          }}
        >
          Control tower
        </h1>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 12,
            color: "var(--text-soft)",
          }}
        >
          Real-time runs, cost, and tribe health for the Dash platform.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          /* INTENTIONAL: 320px = widget min-width breakpoint (layout dim, not spacing grid). */
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        <WidgetCard
          title="Runs feed"
          meta="Dash Build daemon"
          accessory={<PlaceholderTag />}
        >
          <PlaceholderBody description="Will subscribe to Build daemon SSE at :7799 and stream run state transitions." />
        </WidgetCard>

        <WidgetCard
          title="Cost tracker"
          meta="OpenAI Usage API"
          accessory={<PlaceholderTag />}
        >
          <PlaceholderBody description="Will poll Usage API every 5m and roll up week-to-date spend by tribe / user / model." />
        </WidgetCard>

        <TribeHealthWidget />
      </div>
    </div>
  );
}

function PlaceholderTag() {
  return (
    <span
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: "var(--text-soft)",
        border: "1px solid var(--border-soft)",
        padding: "2px 6px",
        borderRadius: 4,
      }}
    >
      stub
    </span>
  );
}

function PlaceholderBody({ description }: { description: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        justifyContent: "center",
        height: "100%",
        color: "var(--text-sub)",
        fontSize: 12,
      }}
    >
      <p style={{ margin: 0 }}>{description}</p>
      <p style={{ margin: 0, color: "var(--text-soft)", fontSize: 11 }}>
        Wiring deferred to next session.
      </p>
    </div>
  );
}
