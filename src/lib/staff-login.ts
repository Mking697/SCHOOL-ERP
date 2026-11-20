import bcrypt from "bcryptjs";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";

export const STAFF_LOGIN_ROLES = ["TEACHER", "ACCOUNTANT", "HR", "SCHOOL_ADMIN", "PRINCIPAL"] as const;
export type StaffLoginRole = (typeof STAFF_LOGIN_ROLES)[number];
export function isStaffLoginRole(value: unknown): value is StaffLoginRole {
  return typeof value === "string" && (STAFF_LOGIN_ROLES as readonly string[]).includes(value);
}

export class StaffLoginError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Client = PrismaClient | Prisma.TransactionClient;

// Shared by (a) Add Staff with "create login access" checked, in the SAME
// transaction as the staff row, and (b) the standalone per-staff "Activate
// Login Access" / "Reset Password" panel. Keeps staff-record creation and
// login-account creation atomic when both are requested together, instead of
// two separate steps that could leave a staff record without login access if
// the second step were skipped or failed.
export async function grantStaffLoginAccess(
  db: Client,
  staffId: string,
  input: { email: string | null; name: string; existingUserId: string | null; role: unknown; password: string },
): Promise<{ email: string; role: StaffLoginRole; created: boolean }> {
  const password = input.password;
  if (!password || String(password).length < 6) {
    throw new StaffLoginError(400, "Password kam se kam 6 characters ka hona chahiye");
  }
  if (!input.email) {
    throw new StaffLoginError(400, "Login access ke liye pehle staff ka email add karo");
  }
  const email = input.email.trim().toLowerCase();
  const role: StaffLoginRole = isStaffLoginRole(input.role) ? input.role : "TEACHER";
  const passwordHash = await bcrypt.hash(password, 10);

  if (input.existingUserId) {
    const user = await db.user.update({
      where: { id: input.existingUserId },
      data: { passwordHash, isActive: true },
    });
    return { email: user.email, role: user.role as StaffLoginRole, created: false };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new StaffLoginError(409, "Ye email pehle se kisi aur login se juda hai");
  }
  const user = await db.user.create({
    data: { name: input.name, email, passwordHash, role, isActive: true },
  });
  await db.staff.update({ where: { id: staffId }, data: { userId: user.id } });
  return { email: user.email, role: user.role as StaffLoginRole, created: true };
}
