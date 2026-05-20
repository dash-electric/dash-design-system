import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Permanent redirects to the canonical onboarding page.
   *
   * `/docs/getting-started` is the canonical entry point. Older
   * mockups, demos, and external docs sometimes link to
   * `/docs/install`, `/install`, `/start`, or `/getting-started`
   * (top-level). Catch all of them so no incoming link 404s.
   *
   * `/docs/installation` is a separate, deeper page (CLI install
   * specifics) and intentionally NOT redirected — both pages coexist.
   */
  async redirects() {
    return [
      {
        source: "/docs/install",
        destination: "/docs/getting-started",
        permanent: true,
      },
      {
        source: "/install",
        destination: "/docs/getting-started",
        permanent: true,
      },
      {
        source: "/start",
        destination: "/docs/getting-started",
        permanent: true,
      },
      {
        source: "/getting-started",
        destination: "/docs/getting-started",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
