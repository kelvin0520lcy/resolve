import { defineConfig, devices } from "@playwright/test";

/**
 * Strict Guitar Studio pixel references are captured in the pinned Linux
 * Playwright container used by guitar-visual.yml. Keep this suite separate
 * from the cross-platform behavior tests in the general Playwright configs.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3200",
    trace: "retain-on-failure",
  },
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFileName}/{arg}{ext}",
  projects: [
    {
      name: "guitar-visual-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "guitar-visual-mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command:
      "env NEXT_PUBLIC_FIREBASE_API_KEY= NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN= NEXT_PUBLIC_FIREBASE_PROJECT_ID= NEXT_PUBLIC_FIREBASE_APP_ID= npm run start -- -p 3200",
    url: "http://127.0.0.1:3200",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
