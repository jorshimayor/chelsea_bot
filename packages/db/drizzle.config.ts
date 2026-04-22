import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./packages/db/migrations",
  schema: "./packages/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL || ""
  }
});
