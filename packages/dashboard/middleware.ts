import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware.
 *
 * - `/api/ingest/*` is always public at the middleware layer; the route
 *   handler enforces HMAC. Doing HMAC here would require reading the body,
 *   which is awkward in Edge — keep it in the Node route.
 * - `/dashboard/*` requires a next-auth session cookie. In dev (NEXTAUTH_URL
 *   unset) we bypass so contributors can boot without provisioning Google
 *   OAuth.
 * - Everything else passes through.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/ingest/")) {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const devBypass = !process.env.NEXTAUTH_URL;
  if (devBypass) return NextResponse.next();

  // next-auth v5 default cookie names. We check presence only; the route
  // handlers do real verification via `auth()`.
  const hasSession =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/ingest/:path*"],
};
