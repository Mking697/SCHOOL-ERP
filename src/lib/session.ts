import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE, type SessionPayload } from "@/lib/auth";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}
