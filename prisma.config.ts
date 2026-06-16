import { defineConfig } from "prisma/config";

// Dynamically load dotenv if available (for local host development)
try {
  await import("dotenv/config");
} catch {
  // Safe fallback for production/Docker standalone environments
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
