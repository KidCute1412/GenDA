import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "jsdom", include: ["features/**/*.spec.ts", "app/api/**/*.spec.ts"], exclude: ["e2e/**"] } });
