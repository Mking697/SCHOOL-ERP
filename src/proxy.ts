import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { verifyPortalSession, PORTAL_SESSION_COOKIE } from "@/lib/portal-auth";
import { verifyDriverSession, DRIVER_SESSION_COOKIE } from "@/lib/driver-auth";
import { isPathAllowedForRole } from "@/components/layout/nav-config";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/setup", "/api/setup", "/apps"];
const PORTAL_PUBLIC_PATHS = ["/portal/login", "/api/portal/auth/login"];
const DRIVER_PUBLIC_PATHS = ["/driver/login", "/api/driver/auth/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static/PWA assets must stay reachable without a session -- the browser
  // fetches manifest.webmanifest and the icon route anonymously to decide
  // whether the site is installable, before any login has happened.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icon")
  ) {
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

  // Driver App -- also its own isolated auth world (Vehicle Number +
  // Password), separate from staff and from the parent/student portal.
  const isDriverRoute = pathname.startsWith("/driver") || pathname.startsWith("/api/driver");
  if (isDriverRoute) {
    if (DRIVER_PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.next();
    }
    const token = request.cookies.get(DRIVER_SESSION_COOKIE)?.value;
    const driverSession = token ? verifyDriverSession(token) : null;
    if (!driverSession) {
      return NextResponse.redirect(new URL("/driver/login", request.url));
    }
    return NextResponse.next();
  }

  // Report cards and invoice detail/payment pages are the pages BOTH a staff
  // member and a parent/student legitimately open -- each lives outside
  // /portal on purpose (so the staff layout doesn't wrap it) and checks
  // either session itself. Accept EITHER a valid staff session or a valid
  // portal session here, otherwise a parent/student gets redirected to the
  // staff /login page before ever reaching the page's own dual-session
  // check. Invoice detail is "/fees/<id>" exactly (not the static
  // /fees/structure or /fees/generate admin sub-pages).
  const isReportCard = pathname.startsWith("/exams/") && pathname.includes("/report-card/");
  const feesIdMatch = pathname.match(/^\/fees\/([^/]+)$/);
  const isInvoiceDetail = feesIdMatch && !["structure", "generate"].includes(feesIdMatch[1]);
  if (isReportCard || isInvoiceDetail) {
    const staffToken = request.cookies.get(SESSION_COOKIE)?.value;
    const staffSession = staffToken ? verifySession(staffToken) : null;
    const portalToken = request.cookies.get(PORTAL_SESSION_COOKIE)?.value;
    const portalSession = portalToken ? verifyPortalSession(portalToken) : null;
    if (!staffSession && !portalSession) {
      return NextResponse.redirect(new URL("/login", request.url));
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

  // Classes & Sections is HR-only to MANAGE (create/edit), but the class/section
  // NAME list itself is non-sensitive shared reference data that Timetable,
  // Exams, Homework, Virtual Classroom and Fees/Generate Invoices all need to
  // populate dropdowns for roles (Teacher/Accountant/etc) that are not HR.
  // Without this, those pages silently 403 on GET /api/classes for every
  // non-HR role and their class dropdowns never populate. Mutations
  // (POST/PATCH/DELETE) still go through the normal HR_ONLY check below.
  if (request.method === "GET" && pathname === "/api/classes") {
    return NextResponse.next();
  }

  // Role-based access control: a route's allowed roles come from the same
  // nav-config used to build the sidebar, so a role that can't SEE a link
  // also can't reach it directly by URL (API included).
  if (!isPathAllowedForRole(pathname, session.role)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
