import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { verifyPortalSession, PORTAL_SESSION_COOKIE } from "@/lib/portal-auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/setup", "/api/setup"];
const PORTAL_PUBLIC_PATHS = ["/portal/login", "/api/portal/auth/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Student/Parent portal has its own, completely separate auth world --
  // never gated by, or able to unlock, the staff/admin session.
  const isPortalRoute = pathname.startsWith("/portal") || pathname.startsWith("/api/portal");
  if (isPortalRoute) {
    if (PORTAL_PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.next();
    }
    const token = request.cookies.get(PORTAL_SESSION_COOKIE)?.value;
    const portalSession = token ? verifyPortalSession(token) : null;
    if (!portalSession) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
