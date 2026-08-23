import "dotenv/config";
import { defineConfig } from "prisma/config";

// `prisma generate` (used in postinstall on Vercel) only needs a well-formed URL.
// Runtime still reads the real DATABASE_URL from the environment.
const datasourceUrl =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/travel_booking";

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
