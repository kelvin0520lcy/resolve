import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL;
if (!baseURL) {
  throw new Error("PLAYWRIGHT_BASE_URL is required for deployed smoke tests.");
}

export default defineConfig({
  testDir: "./e2e",
  testMatch: "deployed-smoke.spec.ts",
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "deployed-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "deployed-mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
