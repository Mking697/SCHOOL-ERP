import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL is intentionally NOT stored as a literal connection string in
// any file on disk -- some Windows endpoint security tools (seen with Avast
// on this project) silently redact "scheme://user:pass@host" shaped text to
// "***" when written to disk, which would corrupt the DB password in .env.
// Instead we keep the pieces separate (PGHOST/PGUSER/PGPASSWORD/...) and
// build the connection string here, in memory, at config-load time.
function buildDatabaseUrl(): string {
  const host = process.env.PGHOST || "localhost";
  const port = process.env.PGPORT || "5432";
  const user = process.env.PGUSER || "school_erp";
  const password = process.env.PGPASSWORD || "";
  const database = process.env.PGDATABASE || "school_erp";
  return "postgresql://" + user + ":" + password + "@" + host + ":" + port + "/" + database + "?schema=public";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: buildDatabaseUrl(),
  },
});
