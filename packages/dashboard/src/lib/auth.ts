import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_DOMAINS = ["dash.com", "dash-elektrik.id"];

/**
 * next-auth v5 (beta) config.
 *
 * Auth model per TRD §5:
 *  - Google provider, hosted-domain restricted (@dash.com, @dash-elektrik.id).
 *  - JWT session in HTTP-only cookie, 7d sliding.
 *  - Role mapping is the next session's job; MVP just authenticates identity.
 *
 * Dev bypass: when NEXTAUTH_URL is unset (the typical local-dev case), we
 * register no providers so the route handlers degrade to "unauthenticated"
 * and middleware will let `/dashboard/*` through. Lets a contributor boot
 * the app without provisioning Google OAuth.
 */
const isDev = !process.env.NEXTAUTH_URL;

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: isDev
    ? []
    : [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          authorization: {
            params: {
              prompt: "select_account",
              hd: ALLOWED_DOMAINS.join(","),
            },
          },
        }),
      ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email ?? "";
      const domain = email.split("@")[1]?.toLowerCase() ?? "";
      return ALLOWED_DOMAINS.includes(domain);
    },
    async jwt({ token, profile }) {
      if (profile?.email) {
        token.email = profile.email;
        const domain = profile.email.split("@")[1]?.toLowerCase() ?? "";
        token.domain = domain;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export const DEV_AUTH_BYPASS = isDev;
