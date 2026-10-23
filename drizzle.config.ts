import { defineConfig } from "drizzle-kit";

// drizzle-kit no lee .env.local por sí solo.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin archivo: se usan las variables del entorno.
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DIRECT_URL ?? "" },
});
