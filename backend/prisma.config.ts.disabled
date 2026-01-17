import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",   // <-- FIXED
  migrations: {
    path: "./prisma/migrations",      // <-- FIXED (recommended)
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
