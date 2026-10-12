import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const schoolName = process.env.SEED_SCHOOL_NAME || "My School";
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
