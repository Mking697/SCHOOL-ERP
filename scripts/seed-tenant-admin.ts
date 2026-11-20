import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Additive, opt-in-only tenant seeding script for the vendor-server's Hosted
// SaaS provisioning flow (see ../../vendor-server/lib/tenant-provisioning.ts).
// It is shelled out to with DATABASE connection pieces (PGHOST/PGPORT/...)
// already pointed at the brand-new tenant database, plus TENANT_* env vars
// carrying the one admin account to create. It does NOT touch prisma/seed.ts
// (which remains the existing SUPER_ADMIN on-prem seed, unchanged) and never
// runs unless every required TENANT_* var is explicitly set.
function buildConnectionString(): string {
  const host = process.env.PGHOST || "localhost";
  const port = process.env.PGPORT || "5432";
  const user = process.env.PGUSER || "school_erp";
  const password = process.env.PGPASSWORD || "";
  const database = process.env.PGDATABASE || "school_erp";
  return "postgresql://" + user + ":" + password + "@" + host + ":" + port + "/" + database + "?schema=public";
}

const adapter = new PrismaPg({ connectionString: buildConnectionString() });
const prisma = new PrismaClient({ adapter });

async function main() {
  const schoolName = process.env.TENANT_SCHOOL_NAME;
  const adminEmail = process.env.TENANT_ADMIN_EMAIL;
  const adminPassword = process.env.TENANT_ADMIN_PASSWORD;
  const adminName = process.env.TENANT_ADMIN_NAME || "School Admin";

  if (!schoolName || !adminEmail || !adminPassword) {
    console.log("Tenant seed skipped: TENANT_SCHOOL_NAME / TENANT_ADMIN_EMAIL / TENANT_ADMIN_PASSWORD not set.");
    return;
  }

  // Idempotent: a retried provisioning attempt (e.g. after a prior partial
  // failure) must not create a second school or a second admin user in the
  // same tenant database.
  const existingSchool = await prisma.school.findFirst();
  const school = existingSchool ?? await prisma.school.create({ data: { name: schoolName } });

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log(`Tenant admin ${adminEmail} already exists, skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({
    data: { name: adminName, email: adminEmail, passwordHash, role: "SCHOOL_ADMIN" },
  });

  console.log(`Tenant seeded: school "${school.name}" + SCHOOL_ADMIN ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
