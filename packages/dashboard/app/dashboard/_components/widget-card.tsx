import type { ReactNode } from "react";

interface WidgetCardProps {
  title: string;
  meta?: string;
  children: ReactNode;
  /** Top-right accessory (e.g. status indicator, link). */
  accessory?: ReactNode;
}

/**
 * Surface wrapper for dashboard widgets.
 *
 * Design contract:
 *   - hairline border, NO shadow combo
 *   - 8px radius
 *   - operational density: tight padding, small type
 */
export function WidgetCard({ title, meta, children, accessory }: WidgetCardProps) {
  return (
    <section
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-card)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 200,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-strong)",
              letterSpacing: -0.1,
            }}
          >
            {title}
          </h2>
          {meta ? (
            <span style={{ fontSize: 11, color: "var(--text-soft)" }}>{meta}</span>
          ) : null}
        </div>
        {accessory}
      </header>
      <div style={{ flex: 1 }}>{children}</div>
    </section>
  );
}
