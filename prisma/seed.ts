import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

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
  // Seeding is opt-in: only runs if SEED_SCHOOL_NAME is explicitly set
  // (useful for dev/CI setups that want a ready-made school+admin without
  // clicking through the UI). A real install intentionally does NOT set
  // this -- the first request to the app shows the /setup wizard instead,
  // where the School Admin picks the name, logo and their own login.
  if (!process.env.SEED_SCHOOL_NAME) {
    console.log("Seed skipped: SEED_SCHOOL_NAME not set -- use the web /setup wizard instead");
    return;
  }

  const schoolName = process.env.SEED_SCHOOL_NAME;
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@school.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const adminName = process.env.SEED_ADMIN_NAME || "Super Admin";

  const existing = await prisma.school.findFirst();
  if (existing) {
    console.log("Seed skipped: school already exists ->", existing.name);
    return;
  }

  const school = await prisma.school.create({
    data: { name: schoolName },
  });

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`Seeded school "${school.name}" and Super Admin user ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
