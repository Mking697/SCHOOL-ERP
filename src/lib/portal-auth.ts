import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Student/Parent portal has its OWN session type, completely separate from
// staff/admin sessions (different cookie, different secret derivation,
// different payload shape) so a portal login can never be confused with
// or escalated into a staff session, and vice versa.
const SECRET = (process.env.JWT_SECRET || "dev-secret-change-me") + ":portal";

export type PortalSessionPayload = {
  studentId: string;
  admissionNo: string;
};

export const PORTAL_SESSION_COOKIE = "school_erp_portal_session";

export function signPortalSession(payload: PortalSessionPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyPortalSession(token: string): PortalSessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as PortalSessionPayload;
  } catch {
    return null;
  }
}

export async function getPortalSession(): Promise<PortalSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_SESSION_COOKIE)?.value;
  return token ? verifyPortalSession(token) : null;
}
