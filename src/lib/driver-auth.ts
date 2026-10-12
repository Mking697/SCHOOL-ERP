import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Driver App has its own session world, same isolation pattern as the
// student/parent portal -- a driver login can never be confused with a
// staff or portal session.
const SECRET = (process.env.JWT_SECRET || "dev-secret-change-me") + ":driver";

export type DriverSessionPayload = {
  routeId: string;
  vehicleNumber: string;
};

export const DRIVER_SESSION_COOKIE = "school_erp_driver_session";

export function signDriverSession(payload: DriverSessionPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyDriverSession(token: string): DriverSessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as DriverSessionPayload;
  } catch {
    return null;
  }
}

export async function getDriverSession(): Promise<DriverSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DRIVER_SESSION_COOKIE)?.value;
  return token ? verifyDriverSession(token) : null;
}
