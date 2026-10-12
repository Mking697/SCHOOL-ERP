import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// See prisma.config.ts for why the connection string is built from
// PGHOST/PGUSER/PGPASSWORD/... components instead of a single DATABASE_URL
// stored in a file.
function buildConnectionString(): string {
  const host = process.env.PGHOST || "localhost";
  const port = process.env.PGPORT || "5432";
  const user = process.env.PGUSER || "school_erp";
  const password = process.env.PGPASSWORD || "";
  const database = process.env.PGDATABASE || "school_erp";
  return "postgresql://" + user + ":" + password + "@" + host + ":" + port + "/" + database + "?schema=public";
}

function createClient() {
  const adapter = new PrismaPg({ connectionString: buildConnectionString() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
