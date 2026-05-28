import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dash Dashboard",
  description: "Control tower for Dash platform — runs, cost, tribe health.",
};

/**
 * AppShell scaffold: top brand bar + main column.
 * Kept minimal — the operational density comes from widget content,
 * not chrome.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Plus Jakarta Sans via Google CDN — matches portal-v2 convention */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <header
            style={{
              borderBottom: "1px solid var(--border-soft)",
              background: "var(--bg-surface)",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  background: "var(--dash-purple)",
                }}
              />
              <strong
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-strong)",
                  letterSpacing: -0.1,
                }}
              >
                Dash Dashboard
              </strong>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-soft)",
                  padding: "2px 6px",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 4,
                  marginLeft: 4,
                }}
              >
                MVP
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-soft)" }}>
              Control tower · v0.1.0
            </div>
          </header>
          <main style={{ flex: 1, padding: "20px 24px" }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
