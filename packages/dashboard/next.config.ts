import type { NextConfig } from "next";

/**
 * Required server env. Validated at boot so misconfigured deploys fail loud,
 * not silently with default-zero session secrets.
 *
 * Dev bypass: when NEXTAUTH_URL is unset we skip the SSO secret requirement
 * so a contributor can `pnpm --filter @dash/dashboard dev` without a Google
 * client. Middleware also bypasses auth in that mode.
 */
function assertEnv() {
  const required: Array<[string, string]> = [
    ["INGEST_HMAC_KEY", "HMAC key for ingest endpoints"],
  ];

  if (process.env.NEXTAUTH_URL) {
    required.push(
      ["NEXTAUTH_SECRET", "next-auth JWT signing secret"],
      ["GOOGLE_CLIENT_ID", "Google OAuth client id"],
      ["GOOGLE_CLIENT_SECRET", "Google OAuth client secret"],
    );
  }

  const missing = required.filter(([k]) => !process.env[k]);
  if (missing.length > 0) {
    const lines = missing.map(([k, why]) => `  - ${k} (${why})`).join("\n");
    throw new Error(
      `[dashboard] Missing required env vars:\n${lines}\nSee packages/dashboard/.env.example`,
    );
  }
}

assertEnv();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Railway sets PORT; the dev script pins :3001 to avoid colliding with docs.
  experimental: {
    // App Router is the default — no flag needed.
  },
  // Mark Pino as external so Next does not try to bundle its native transport.
  serverExternalPackages: ["pino", "pino-pretty", "@libsql/client"],
};

export default nextConfig;
