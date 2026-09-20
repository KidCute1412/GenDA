import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "jsdom", include: ["features/**/*.spec.ts"], exclude: ["e2e/**"] } });
