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
        {/*
          A11y E4 — skip-link must be the first focusable element so keyboard
          users can bypass the header chrome and land directly on widget grid.
          Visually hidden by default; reveals on :focus via .skip-link CSS in
          globals.css (server-component friendly — no React event handlers).
        */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <header
            role="banner"
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
                  width: 24,
                  height: 24,
                  borderRadius: 4,
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
                  /* 11px = micro type per Dash type ramp (not on spacing grid). */
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
          <main
            id="main-content"
            tabIndex={-1}
            style={{ flex: 1, padding: "24px 24px" }}
          >
            {children}
          </main>
          <footer
            role="contentinfo"
            style={{
              padding: "12px 24px",
              borderTop: "1px solid var(--border-soft)",
              color: "var(--text-soft)",
              fontSize: 11,
              textAlign: "center",
            }}
          >
            Dash Dashboard · Control tower · MVP
          </footer>
        </div>
      </body>
    </html>
  );
}
