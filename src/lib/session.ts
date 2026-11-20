import { cookies } from "next/headers";
import { connection } from "next/server";
import { verifySession, SESSION_COOKIE, type SessionPayload } from "@/lib/auth";

export async function getSession(): Promise<SessionPayload | null> {
  // JWT expiry reads the current time; keep it out of the prerender phase.
  await connection();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}
