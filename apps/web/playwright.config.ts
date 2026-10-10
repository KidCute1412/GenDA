import { defineConfig } from "@playwright/test";

const executablePath = process.env.PLAYWRIGHT_CHROME_PATH;
const webPort = process.env.E2E_WEB_PORT ?? "3000";

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${webPort}`,
    trace: "retain-on-failure",
    ...(executablePath ? { launchOptions: { executablePath } } : {})
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next dev --port ${webPort}`,
    url: `http://localhost:${webPort}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
