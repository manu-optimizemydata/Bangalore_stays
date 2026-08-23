import "dotenv/config";
import { defineConfig } from "prisma/config";

// CLI (migrate/seed) prefers DIRECT_URL so Supabase pooler transaction mode is not used.
// Runtime still reads DATABASE_URL in src/lib/prisma.ts.
const datasourceUrl =
  process.env.DIRECT_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  "postgresql://postgres:postgres@localhost:5432/travel_booking";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: datasourceUrl,
  },
});
