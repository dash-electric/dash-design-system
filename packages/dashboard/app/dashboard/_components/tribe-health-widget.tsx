import { tribeSnapshot, type TribeStatus } from "@/lib/store/heartbeats";
import { WidgetCard } from "./widget-card";
import { TribeHealthLive } from "./tribe-health-live";

/**
 * Server component: reads initial tribe snapshot from the in-memory store,
 * then hands off to <TribeHealthLive /> which subscribes to SSE for updates.
 *
 * Per spec (MVP widget #3): grid of per-tribe cards with status badge
 * (green=ok, yellow=degraded, red=down) + last-seen timestamp. Empty state
 * when no tribes have registered yet.
 */
export function TribeHealthWidget() {
  const initial: TribeStatus[] = tribeSnapshot();
  const meta = `${initial.length} tribe${initial.length === 1 ? "" : "s"} registered`;

  return (
    <WidgetCard
      title="Tribe health"
      meta={meta}
      accessory={
        <span style={{ fontSize: 11, color: "var(--text-soft)" }}>live · SSE</span>
      }
    >
      <TribeHealthLive initial={initial} />
    </WidgetCard>
  );
}
